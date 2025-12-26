// WebSite/src/components/InterviewPractice.jsx
// Complete interview practice component with voice support

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Send,
  Loader,
  Bot,
  User,
  StopCircle,
  PlayCircle,
  BarChart3,
  Clock,
  MessageSquare,
} from 'lucide-react';

import { interviewService, InterviewChat } from '../services/interviewService';
import { candidateService } from '../services/candidateService';
import { speechService } from '../services/speechService';
import Loading, { ContentLoading } from './common/Loading';
import ErrorDisplay from './common/ErrorDisplay';
import { useToast } from './common/Toast';

const InterviewPractice = () => {
  const toast = useToast();

  // state management
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [duration, setDuration] = useState(0);

  // refs
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    loadResumeAnalyses();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadResumeAnalyses = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getUserAnalyses();
      setAnalyses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load resume analyses');
      toast.error('Could not load your resume analyses');
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async () => {
    if (!selectedAnalysisId) {
      toast.warning('Please select a resume analysis first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await interviewService.startInterview(selectedAnalysisId);
      const newInterviewId = response.interviewId;
      
      setInterviewId(newInterviewId);
      chatRef.current = new InterviewChat(newInterviewId);

      // add initial AI message
      const initialMessage = {
        role: 'interviewer',
        content: response.message || "Hello! I'm excited to interview you today. Let's start by having you tell me about yourself.",
        timestamp: Date.now(),
      };
      
      setMessages([initialMessage]);
      startTimeRef.current = Date.now();
      
      // start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 1000);

      toast.success('Interview started! Good luck!');
    } catch (err) {
      setError(err.message || 'Failed to start interview');
      toast.error('Could not start interview');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    // add user message to chat
    const newUserMsg = {
      role: 'candidate',
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newUserMsg]);

    try {
      // send to API
      const response = await chatRef.current.sendMessage(userMessage);

      // add AI response
      const aiMessage = {
        role: 'interviewer',
        content: response.reply,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // check if interview ended
      if (response.interviewEnded) {
        setInterviewEnded(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        toast.info('Interview completed!');
      }

    } catch (err) {
      toast.error('Failed to send message');
      // remove user message on error
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(userMessage); // restore input
    } finally {
      setSending(false);
    }
  };

  const endInterview = async () => {
    if (!interviewId) return;

    try {
      await interviewService.endInterview(interviewId);
      setInterviewEnded(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast.success('Interview ended. View your performance report!');
    } catch (err) {
      toast.error('Failed to end interview properly');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        try {
          setSending(true);
          const transcription = await speechService.transcribeAudio(audioBlob);
          setInputMessage(transcription);
          toast.success('Voice recorded successfully');
        } catch (err) {
          toast.error('Failed to transcribe audio');
        } finally {
          setSending(false);
        }

        // stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording... Click again to stop');

    } catch (err) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <ContentLoading message="Loading interview practice..." />;
  }

  // No interview started - show selection screen
  if (!interviewId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Interview Practice
            </h1>
            <p className="text-gray-600 text-lg">
              Practice with our AI interviewer and get instant feedback
            </p>
          </motion.div>

          {error && (
            <div className="mb-6">
              <ErrorDisplay error={error} onRetry={loadResumeAnalyses} />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Select Resume Analysis
            </h2>

            {analyses.length > 0 ? (
              <div className="space-y-4 mb-8">
                {analyses.map((analysis) => (
                  <motion.div
                    key={analysis.id}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      p-6 rounded-xl border-2 cursor-pointer transition-all
                      ${selectedAnalysisId === analysis.id
                        ? 'border-[#4b4bff] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => setSelectedAnalysisId(analysis.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {analysis.fileName || 'Resume Analysis'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Score: {analysis.overallScore || analysis.score}/100</span>
                          <span>•</span>
                          <span>
                            {new Date(analysis.createdAt * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${selectedAnalysisId === analysis.id
                          ? 'border-[#4b4bff] bg-[#4b4bff]'
                          : 'border-gray-300'
                        }
                      `}>
                        {selectedAnalysisId === analysis.id && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  No resume analyses found. Please analyze your resume first.
                </p>
                <button
                  onClick={() => window.location.href = '/resume-analyzer'}
                  className="px-6 py-3 bg-[#4b4bff] text-white rounded-xl font-medium hover:bg-[#3b3bef] transition-colors"
                >
                  Analyze Resume
                </button>
              </div>
            )}

            <button
              onClick={startInterview}
              disabled={!selectedAnalysisId}
              className={`
                w-full py-4 rounded-xl font-medium text-white transition-all flex items-center justify-center space-x-2
                ${selectedAnalysisId
                  ? 'bg-[#4b4bff] hover:bg-[#3b3bef]'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              <PlayCircle className="w-5 h-5" />
              <span>Start Interview</span>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Interview in progress
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Bot className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Interview in Progress
                </h2>
                <p className="text-gray-600 text-sm">
                  Answer thoughtfully and naturally
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono">{formatDuration(duration)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <MessageSquare className="w-5 h-5" />
                <span>{messages.length}</span>
              </div>

              <button
                onClick={endInterview}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <StopCircle className="w-4 h-4" />
                <span>End Interview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 h-[500px] overflow-y-auto">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
          </AnimatePresence>
          
          {sending && (
            <div className="flex items-center space-x-2 text-gray-500 mt-4">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!interviewEnded && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4b4bff] focus:border-transparent resize-none"
                  rows="3"
                  disabled={sending}
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={sending}
                  className={`
                    p-3 rounded-xl font-medium transition-colors
                    ${isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }
                  `}
                >
                  {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || sending}
                  className={`
                    p-3 rounded-xl font-medium transition-colors
                    ${inputMessage.trim() && !sending
                      ? 'bg-[#4b4bff] hover:bg-[#3b3bef] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interview Ended */}
        {interviewEnded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
          >
            <BarChart3 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Interview Completed!
            </h3>
            <p className="text-gray-600 mb-6">
              Great job! You can review the conversation above.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#4b4bff] text-white rounded-xl font-medium hover:bg-[#3b3bef] transition-colors"
            >
              Start New Interview
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message }) => {
  const isAI = message.role === 'interviewer';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 mb-6 ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}
    >
      <div className={`
        p-2 rounded-xl flex-shrink-0
        ${isAI ? 'bg-purple-100' : 'bg-blue-100'}
      `}>
        {isAI ? (
          <Bot className="w-6 h-6 text-purple-600" />
        ) : (
          <User className="w-6 h-6 text-blue-600" />
        )}
      </div>
      
      <div className={`flex-1 ${isAI ? '' : 'text-right'}`}>
        <div className={`
          inline-block px-4 py-3 rounded-2xl max-w-[80%]
          ${isAI 
            ? 'bg-gray-100 text-gray-900' 
            : 'bg-[#4b4bff] text-white'
          }
        `}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
};

export default InterviewPractice;