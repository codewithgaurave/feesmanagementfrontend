import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { HiUsers, HiCash, HiClock, HiCalendar, HiUserAdd, HiUserGroup, HiExclamationCircle } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFees: 0,
    dueFees: 0,
    upcomingFees: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      const data = response.data;
      
      setStats({
        totalStudents: data.totalStudents || 0,
        totalFees: data.paidFees || 0,
        dueFees: data.pendingFees || 0,
        upcomingFees: data.overdueFees || 0
      });

      setRecentActivities([
        { id: 1, type: 'payment', message: 'Fee payment received', time: '2 hours ago' },
        { id: 2, type: 'student', message: 'New student registered', time: '4 hours ago' },
        { id: 3, type: 'reminder', message: 'Fee reminders sent', time: '1 day ago' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalStudents: 0,
        totalFees: 0,
        dueFees: 0,
        upcomingFees: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add Student',
      description: 'Register new student',
      icon: <HiUserAdd className="w-8 h-8" />,
      link: '/students/add',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Collect Fee',
      description: 'Process fee payment',
      icon: <FaRupeeSign className="w-8 h-8" />,
      link: '/fees/add',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'View Students',
      description: 'Manage student data',
      icon: <HiUserGroup className="w-8 h-8" />,
      link: '/students/show',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Due Fees',
      description: 'Check pending payments',
      icon: <HiExclamationCircle className="w-8 h-8" />,
      link: '/fees/due',
      color: 'from-red-500 to-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-college-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">


      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="p-3 sm:p-4 lg:p-6 bg-white border border-gray-100 shadow-lg rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Students</p>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">{stats.totalStudents}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex-shrink-0">
              <HiUsers className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 bg-white border border-gray-100 shadow-lg rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Paid Fees</p>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 truncate">{stats.totalFees}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex-shrink-0">
              <HiCash className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 bg-white border border-gray-100 shadow-lg rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending Fees</p>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-red-600 truncate">{stats.dueFees}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex-shrink-0">
              <HiClock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 bg-white border border-gray-100 shadow-lg rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Overdue Fees</p>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-orange-600 truncate">{stats.upcomingFees}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex-shrink-0">
              <HiCalendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 sm:p-4 lg:p-6 bg-white border border-gray-100 shadow-lg rounded-lg sm:rounded-xl">
        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="block transition-all duration-200 transform hover:shadow-lg hover:-translate-y-1 rounded-lg sm:rounded-xl overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${action.color} p-3 sm:p-4 text-white h-full`}>
                <div className="mb-2 flex justify-center sm:justify-start">
                  {React.cloneElement(action.icon, { className: 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8' })}
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-center sm:text-left mb-1">{action.title}</h3>
                <p className="text-xs sm:text-sm opacity-90 text-center sm:text-left">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities & Upcoming Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        {/*<div className="p-6 bg-white border border-gray-100 shadow-lg rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start p-3 space-x-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 mt-2 rounded-full bg-college-primary"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.message}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>*/}

        {/* Quick Links */}
        {/*<div className="p-6 bg-white border border-gray-100 shadow-lg rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Quick Links</h2>
          <div className="space-y-3">
            <Link to="/students/show" className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="font-medium text-gray-700">Student Management</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/fees/manage" className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="font-medium text-gray-700">Fee Management</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/fees/upcoming" className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="font-medium text-gray-700">Upcoming Dates</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/change-password" className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="font-medium text-gray-700">Change Password</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>*/}
      </div>
    </div>
  );
};

export default Dashboard;