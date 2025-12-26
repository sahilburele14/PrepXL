// WebSite/src/components/JobSearch.jsx
// Complete job search with multi-platform support

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  ExternalLink,
  Filter,
  Save,
  Star,
  Calendar,
  Settings,
} from 'lucide-react';

import { jobService } from '../services/jobService';
import Loading, { ContentLoading } from './common/Loading';
import ErrorDisplay from './common/ErrorDisplay';
import { useToast } from './common/Toast';

const JobSearch = () => {
  const toast = useToast();

  // Search state
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('all');
  const [experience, setExperience] = useState('all');

  // Results state
  const [jobs, setJobs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  // Auto-search state
  const [autoSearchEnabled, setAutoSearchEnabled] = useState(false);
  const [dailyCollections, setDailyCollections] = useState([]);
  const [showCollections, setShowCollections] = useState(false);

  // Load auto-search status on mount
  useEffect(() => {
    loadAutoSearchStatus();
    loadDailyCollections();
  }, []);

  const loadAutoSearchStatus = async () => {
    try {
      const status = await jobService.getAutoSearchStatus();
      setAutoSearchEnabled(status.enabled || false);
    } catch (err) {
      console.error('Failed to load auto-search status:', err);
    }
  };

  const loadDailyCollections = async () => {
    try {
      const collections = await jobService.getDailyCollections();
      setDailyCollections(Array.isArray(collections) ? collections : []);
    } catch (err) {
      console.error('Failed to load collections:', err);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!query.trim()) {
      toast.warning('Please enter a search term');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const params = {
        keywords: query,
        location: location || undefined,
        jobType: jobType !== 'all' ? jobType : undefined,
        experienceLevel: experience !== 'all' ? experience : undefined,
      };

      const response = await jobService.searchJobs(params);
      
      // Extract jobs from response
      const jobsList = response.jobs || response.results || [];
      setJobs(Array.isArray(jobsList) ? jobsList : []);
      
      toast.success(`Found ${jobsList.length} jobs`);
    } catch (err) {
      setError(err.message || 'Failed to search jobs');
      toast.error('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const toggleAutoSearch = async () => {
    try {
      if (autoSearchEnabled) {
        await jobService.disableAutoSearch();
        setAutoSearchEnabled(false);
        toast.success('Auto-search disabled');
      } else {
        const config = {
          keywords: query || 'software engineer',
          location: location || '',
          jobType: jobType !== 'all' ? jobType : undefined,
          experienceLevel: experience !== 'all' ? experience : undefined,
        };
        
        await jobService.enableAutoSearch(config);
        setAutoSearchEnabled(true);
        toast.success('Auto-search enabled! You will receive daily job matches.');
      }
    } catch (err) {
      toast.error('Failed to toggle auto-search');
    }
  };

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
            Job Search
          </h1>
          <p className="text-gray-600 text-lg">
            Search across multiple job platforms at once
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-2" />
                  Job Title or Keywords
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4b4bff] focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, Remote"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4b4bff] focus:border-transparent"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4b4bff] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Star className="w-4 h-4 inline mr-2" />
                  Experience Level
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4b4bff] focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Principal</option>
                </select>
              </div>
            </div>

            {/* Search Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={toggleAutoSearch}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors
                  ${autoSearchEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Settings className="w-4 h-4" />
                <span>{autoSearchEnabled ? 'Auto-Search ON' : 'Enable Auto-Search'}</span>
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCollections(!showCollections)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Daily Collections</span>
                </button>

                <button
                  type="submit"
                  disabled={searching}
                  className="px-6 py-2 bg-[#4b4bff] text-white rounded-xl font-medium hover:bg-[#3b3bef] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {searching ? (
                    <>
                      <Loading size="sm" variant="spinner" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search Jobs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay 
              error={error} 
              onRetry={handleSearch}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Daily Collections */}
        {showCollections && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Daily Job Collections
            </h2>
            
            {dailyCollections.length > 0 ? (
              <div className="space-y-3">
                {dailyCollections.map((collection, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(collection.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {collection.jobCount || 0} jobs found
                      </p>
                    </div>
                    <button
                      onClick={() => {/* Load collection jobs */}}
                      className="px-4 py-2 bg-[#4b4bff] text-white rounded-lg hover:bg-[#3b3bef] transition-colors"
                    >
                      View Jobs
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No daily collections yet. Enable auto-search to get started!
              </p>
            )}
          </motion.div>
        )}

        {/* Job Results */}
        {jobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Search Results ({jobs.length} jobs)
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job, index) => (
                <JobCard key={index} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searching && jobs.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Enter your search criteria and click "Search Jobs"
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ job }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {job.title}
        </h3>
        <p className="text-gray-600 mb-2">{job.company}</p>
        
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          {job.location && (
            <span className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </span>
          )}
          
          {job.type && (
            <span className="flex items-center space-x-1">
              <Briefcase className="w-4 h-4" />
              <span>{job.type}</span>
            </span>
          )}
          
          {job.salary && (
            <span className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </span>
          )}
          
          {job.postedDate && (
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{job.postedDate}</span>
            </span>
          )}
        </div>
      </div>

      {job.logo && (
        <img 
          src={job.logo} 
          alt={job.company}
          className="w-16 h-16 rounded-lg object-cover ml-4"
        />
      )}
    </div>

    {job.description && (
      <p className="text-gray-700 mb-4 line-clamp-3">
        {job.description}
      </p>
    )}

    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
      <div className="flex space-x-2">
        {job.tags?.slice(0, 3).map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      <a
        href={job.link || job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 px-4 py-2 bg-[#4b4bff] text-white rounded-xl font-medium hover:bg-[#3b3bef] transition-colors"
      >
        <span>Apply</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  </motion.div>
);

export default JobSearch;