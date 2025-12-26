// WebSite/src/components/ResumeAnalyzer.jsx
// Complete resume analyzer with drag-and-drop

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Target,
  Zap,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';

import { resumeService } from '../services/resumeService';
import { candidateService } from '../services/candidateService';
import Loading, { ContentLoading } from './common/Loading';
import ErrorDisplay from './common/ErrorDisplay';
import { useToast } from './common/Toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const ResumeAnalyzer = () => {
  const toast = useToast();

  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescFile, setJobDescFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getUserAnalyses();
      setAnalyses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file) => {
    if (!file) return 'No file selected';
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload PDF, DOCX, DOC, or TXT';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 10MB';
    }
    
    return null;
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setResumeFile(file);
    toast.success(`File selected: ${file.name}`);
  }, [toast]);

  const handleFileSelect = (e, isJobDesc = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (isJobDesc) {
      setJobDescFile(file);
      toast.success(`Job description selected: ${file.name}`);
    } else {
      setResumeFile(file);
      toast.success(`Resume selected: ${file.name}`);
    }
  };

  const analyzeResume = async () => {
    if (!resumeFile) {
      toast.warning('Please select a resume file');
      return;
    }

    setAnalyzing(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resumeFile', resumeFile);
      
      if (jobDescFile) {
        formData.append('jobDescriptionFile', jobDescFile);
      }

      await resumeService.analyzeResumeAsync(
        formData,
        (progress) => setUploadProgress(progress)
      );

      toast.success('Analysis started! You will be notified when complete.');
      
      // clear files
      setResumeFile(null);
      setJobDescFile(null);
      setUploadProgress(0);

      // reload analyses after a delay
      setTimeout(() => {
        loadAnalyses();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to analyze resume');
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = (isJobDesc = false) => {
    if (isJobDesc) {
      setJobDescFile(null);
    } else {
      setResumeFile(null);
    }
  };

  if (loading) {
    return <ContentLoading message="Loading your analyses..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Resume Analyzer
          </h1>
          <p className="text-gray-600 text-lg">
            Get instant ATS score and personalized recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <div className="space-y-6">
            
            {/* Resume Upload */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Your Resume
              </h2>

              {!resumeFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragging
                      ? 'border-[#4b4bff] bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your resume here
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    or
                  </p>
                  <label className="px-6 py-3 bg-[#4b4bff] text-white rounded-xl font-medium hover:bg-[#3b3bef] transition-colors cursor-pointer inline-block">
                    Browse Files
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={(e) => handleFileSelect(e, false)}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-500 text-xs mt-4">
                    Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{resumeFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(resumeFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(false)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Optional Job Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Job Description (Optional)
              </h3>
              
              {!jobDescFile ? (
                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 transition-all">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Upload job description</p>
                  <p className="text-gray-500 text-sm">
                    For better matching analysis
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => handleFileSelect(e, true)}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{jobDescFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(jobDescFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(true)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Analyze Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={analyzeResume}
              disabled={!resumeFile || analyzing}
              className={`
                w-full py-4 rounded-xl font-medium text-white transition-all flex items-center justify-center space-x-2
                ${resumeFile && !analyzing
                  ? 'bg-[#4b4bff] hover:bg-[#3b3bef]'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              {analyzing ? (
                <>
                  <Loading size="sm" variant="spinner" />
                  <span>Analyzing... {uploadProgress.toFixed(0)}%</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Analyze Resume</span>
                </>
              )}
            </motion.button>

            {error && (
              <ErrorDisplay error={error} onDismiss={() => setError(null)} />
            )}
          </div>

          {/* Previous Analyses */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Previous Analyses
            </h2>

            {analyses.length > 0 ? (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <AnalysisCard
                    key={analysis.id}
                    analysis={analysis}
                    onClick={() => setSelectedAnalysis(analysis)}
                    isSelected={selectedAnalysis?.id === analysis.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  No analyses yet. Upload your resume to get started!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Detailed Analysis View */}
        <AnimatePresence>
          {selectedAnalysis && (
            <DetailedAnalysis
              analysis={selectedAnalysis}
              onClose={() => setSelectedAnalysis(null)}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// Analysis Card Component
const AnalysisCard = ({ analysis, onClick, isSelected }) => {
  const score = analysis.overallScore || analysis.score || 0;
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        p-4 rounded-xl border-2 cursor-pointer transition-all
        ${isSelected
          ? 'border-[#4b4bff] bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 truncate">
          {analysis.fileName || 'Resume Analysis'}
        </h3>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {new Date(analysis.createdAt * 1000).toLocaleDateString()}
        </span>
        <button className="text-[#4b4bff] hover:underline flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
      </div>
    </motion.div>
  );
};

// Detailed Analysis Modal
const DetailedAnalysis = ({ analysis, onClose }) => {
  const score = analysis.overallScore || analysis.score || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Analysis Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Score Display */}
          <div className="bg-gradient-to-r from-[#4b4bff] to-[#6b6bff] rounded-2xl p-8 text-white mb-8 text-center">
            <div className="mb-4">
              <Award className="w-16 h-16 mx-auto opacity-80" />
            </div>
            <h3 className="text-xl mb-2">ATS Compatibility Score</h3>
            <div className="text-6xl font-bold mb-2">{score}</div>
            <p className="text-blue-100">out of 100</p>
          </div>

          {/* Analysis Sections */}
          <div className="space-y-6">
            
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <span>Strengths</span>
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.improvements && analysis.improvements.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Target className="w-6 h-6 text-orange-600" />
                  <span>Areas for Improvement</span>
                </h3>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResumeAnalyzer;