// WebSite/src/components/Dashboard.jsx
// Production-ready dashboard with all features

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Target,
  Zap,
  ChevronRight,
  User,
  Briefcase,
  MessageSquare,
} from 'lucide-react';

import { fetchDashboardData } from '../../store/dashboardSlice';
import { candidateService } from '../services/candidateService';
import { userService } from '../services/userService';
import Loading, { ContentLoading } from './common/Loading';
import ErrorDisplay from './common/ErrorDisplay';
import { useToast } from './common/Toast';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { user, profile } = useSelector((state) => state.auth);
  const { data: dashboardData, loading } = useSelector((state) => state.dashboard);

  const [resumeScores, setResumeScores] = useState([]);
  const [activities, setActivities] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLocalLoading(true);
    setError(null);

    try {
      // fetch dashboard data
      await dispatch(fetchDashboardData()).unwrap();

      // fetch resume scores
      try {
        const scores = await candidateService.getUserAnalyses();
        setResumeScores(Array.isArray(scores) ? scores : []);
      } catch (err) {
        console.error('Failed to load resume scores:', err);
        // non-critical error
      }

      // fetch recent activities
      try {
        const history = await userService.getHistory();
        setActivities(Array.isArray(history) ? history : []);
      } catch (err) {
        console.error('Failed to load activities:', err);
      }

    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
      toast.error('Failed to load dashboard data');
    } finally {
      setLocalLoading(false);
    }
  };

  if (localLoading || loading) {
    return <ContentLoading message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorDisplay 
          error={error} 
          onRetry={loadDashboardData}
          title="Dashboard Error"
        />
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const latestScore = resumeScores[0] || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-[#4b4bff] to-[#6b6bff] rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {profile?.displayName || user?.displayName || 'there'}! 👋
                </h1>
                <p className="text-blue-100">
                  Ready to ace your next interview?
                </p>
              </div>
              <div className="hidden md:block">
                <Zap className="w-16 h-16 opacity-50" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Resume Analyses"
            value={stats.totalResumeScores || 0}
            color="blue"
          />
          <StatCard
            icon={MessageSquare}
            label="Mock Interviews"
            value={stats.totalInterviews || 0}
            color="green"
          />
          <StatCard
            icon={Briefcase}
            label="Job Searches"
            value={stats.totalTests || 0}
            color="purple"
          />
          <StatCard
            icon={Award}
            label="Total Activities"
            value={stats.totalActivities || 0}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column - Action Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Interview Practice Card */}
            <ActionCard
              icon={Brain}
              title="Practice with AI Interviewer"
              description="Get real-time feedback on your interview performance"
              buttonText="Start Interview"
              onClick={() => navigate('/interview-practice')}
              gradient="from-purple-500 to-pink-500"
            />

            {/* Resume Analyzer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Resume Analysis
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Check your ATS compatibility
                    </p>
                  </div>
                </div>
              </div>

              {latestScore ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Latest Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold text-[#4b4bff]">
                        {latestScore.overallScore || latestScore.score || 0}
                      </span>
                      <span className="text-gray-500">/100</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#4b4bff] to-[#6b6bff] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${latestScore.overallScore || latestScore.score || 0}%` }}
                    />
                  </div>

                  <button
                    onClick={() => navigate('/resume-analyzer')}
                    className="w-full py-3 bg-[#4b4bff] text-white rounded-xl font-medium hover:bg-[#3b3bef] transition-colors"
                  >
                    View Full Analysis
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">
                    No resume analyzed yet
                  </p>
                  <button
                    onClick={() => navigate('/resume-analyzer')}
                    className="px-6 py-3 bg-[#4b4bff] text-white rounded-xl font-medium hover:bg-[#3b3bef] transition-colors"
                  >
                    Analyze Your Resume
                  </button>
                </div>
              )}
            </motion.div>

            {/* Job Search Card */}
            <ActionCard
              icon={Briefcase}
              title="Find Your Dream Job"
              description="Search across multiple job platforms at once"
              buttonText="Search Jobs"
              onClick={() => navigate('/job-search')}
              gradient="from-green-500 to-teal-500"
            />
          </div>

          {/* Right Column - Activity Timeline */}
          <div className="space-y-6">
            <ActivityCalendar activities={activities} />
            <RecentActivity activities={activities.slice(0, 5)} />
          </div>
        </div>

      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

// Action Card Component
const ActionCard = ({ icon: Icon, title, description, buttonText, onClick, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
  >
    <div className={`bg-gradient-to-r ${gradient} p-6`}>
      <div className="flex items-center space-x-3 text-white">
        <Icon className="w-8 h-8" />
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
    </div>
    <div className="p-6">
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        onClick={onClick}
        className="w-full py-3 bg-[#4b4bff] text-white rounded-xl font-medium hover:bg-[#3b3bef] transition-colors flex items-center justify-center space-x-2"
      >
        <span>{buttonText}</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
);

// Activity Calendar Component (simplified)
const ActivityCalendar = ({ activities }) => {
  const getActivityDates = () => {
    const dates = new Set();
    activities.forEach(activity => {
      if (activity.timestamp) {
        const date = new Date(activity.timestamp * 1000).toDateString();
        dates.add(date);
      }
    });
    return dates;
  };

  const activityDates = getActivityDates();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-[#4b4bff]" />
        <h3 className="text-lg font-bold text-gray-900">Activity This Month</h3>
      </div>
      <div className="text-center py-8">
        <p className="text-4xl font-bold text-[#4b4bff]">{activityDates.size}</p>
        <p className="text-gray-600 mt-2">Active Days</p>
      </div>
    </motion.div>
  );
};

// Recent Activity Component
const RecentActivity = ({ activities }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
  >
    <div className="flex items-center space-x-2 mb-4">
      <Clock className="w-5 h-5 text-[#4b4bff]" />
      <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
    </div>
    
    {activities.length > 0 ? (
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-[#4b4bff] rounded-full mt-2" />
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium">
                {activity.activityType?.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-gray-500">
                {activity.timestamp 
                  ? new Date(activity.timestamp * 1000).toLocaleDateString()
                  : 'Recently'
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-500 py-8">No recent activity</p>
    )}
  </motion.div>
);

export default Dashboard;