// WebSite/src/components/QuestionBank.jsx
// Complete question bank with categories and search

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  Code,
  Brain,
  Users,
  Target,
  ChevronRight,
  ChevronLeft,
  Filter,
  X,
} from 'lucide-react';

import { questionBankService } from '../services/questionBankService';
import Loading, { ContentLoading } from './common/Loading';
import ErrorDisplay from './common/ErrorDisplay';
import { useToast } from './common/Toast';

const CATEGORIES = [
  { id: 'all', name: 'All Questions', icon: Book },
  { id: 'javascript', name: 'JavaScript', icon: Code },
  { id: 'python', name: 'Python', icon: Code },
  { id: 'react', name: 'React', icon: Code },
  { id: 'system-design', name: 'System Design', icon: Brain },
  { id: 'behavioral', name: 'Behavioral', icon: Users },
  { id: 'algorithms', name: 'Algorithms', icon: Target },
];

const QuestionBank = () => {
  const toast = useToast();

  // State
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  // Filter questions when category or search changes
  useEffect(() => {
    filterQuestions();
  }, [selectedCategory, searchQuery, questions]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await questionBankService.getAllQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load questions');
      toast.error('Could not load questions');
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => 
        q.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q =>
        q.question?.toLowerCase().includes(query) ||
        q.category?.toLowerCase().includes(query) ||
        q.type?.toLowerCase().includes(query)
      );
    }

    setFilteredQuestions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // Clear search when changing category
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <ContentLoading message="Loading question bank..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Interview Question Bank
          </h1>
          <p className="text-gray-600 text-lg">
            Practice with curated interview questions from top companies
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-6"
        >
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search questions..."
              className="flex-1 px-4 py-2 border-0 focus:ring-0 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-8"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filter by Category</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all
                    ${isSelected
                      ? 'bg-[#4b4bff] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay 
              error={error} 
              onRetry={loadQuestions}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Questions List */}
        {filteredQuestions.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {currentQuestions.map((question, index) => (
                <QuestionCard
                  key={question.id || index}
                  question={question}
                  onClick={() => setSelectedQuestion(question)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors
                    ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    {filteredQuestions.length} questions
                  </span>
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors
                    ${currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchQuery
                ? `No questions found for "${searchQuery}"`
                : 'No questions in this category'
              }
            </p>
          </motion.div>
        )}

        {/* Question Detail Modal */}
        <AnimatePresence>
          {selectedQuestion && (
            <QuestionDetailModal
              question={selectedQuestion}
              onClose={() => setSelectedQuestion(null)}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// Question Card Component
const QuestionCard = ({ question, onClick }) => {
  const getDifficultyColor = (difficulty) => {
    const level = difficulty?.toLowerCase();
    if (level === 'easy') return 'text-green-600 bg-green-100';
    if (level === 'medium') return 'text-yellow-600 bg-yellow-100';
    if (level === 'hard') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
          {question.question}
        </h3>
        
        {question.difficulty && (
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium flex-shrink-0
            ${getDifficultyColor(question.difficulty)}
          `}>
            {question.difficulty}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-600">
        {question.category && (
          <span className="flex items-center space-x-1">
            <Code className="w-4 h-4" />
            <span>{question.category}</span>
          </span>
        )}
        
        {question.type && (
          <span>• {question.type}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-2">
          {question.tags?.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        <button className="text-[#4b4bff] hover:text-[#3b3bef] font-medium text-sm flex items-center space-x-1">
          <span>View Details</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Question Detail Modal
const QuestionDetailModal = ({ question, onClose }) => (
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
      className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-8">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {question.question}
            </h2>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {question.category}
              </span>
              <span>•</span>
              <span>{question.type}</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {question.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {question.description}
              </p>
            </div>
          )}

          {question.hints && question.hints.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Hints
              </h3>
              <ul className="space-y-2">
                {question.hints.map((hint, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-[#4b4bff] mt-1">•</span>
                    <span className="text-gray-700">{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {question.sampleAnswer && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Sample Answer
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {question.sampleAnswer}
                </p>
              </div>
            </div>
          )}

          {question.tags && question.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Related Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#4b4bff] text-white rounded-xl font-medium hover:bg-[#3b3bef] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default QuestionBank;