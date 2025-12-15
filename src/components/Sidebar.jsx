import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { 
  HiViewGrid, 
  HiUsers, 
  HiPlus, 
  HiDocumentText, 
  HiExclamationCircle, 
  HiClock, 
  HiKey, 
  HiLogout 
} from 'react-icons/hi';

const Sidebar = ({ onNavigate }) => {
  const { logout } = useAuth();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onNavigate) {
      onNavigate();
    }
  }, [location.pathname, onNavigate]);

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your session!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <HiViewGrid className="w-5 h-5" />
    }
  ];

  const studentItems = [
    {
      title: "Student Manage",
      path: "/students/show",
      icon: <HiUsers className="w-5 h-5" />
    }
  ];

  const feeItems = [
    {
      title: "Add Fee",
      path: "/fees/add",
      icon: <HiPlus className="w-5 h-5" />
    },
    {
      title: "Show Fees",
      path: "/fees/show",
      icon: <HiDocumentText className="w-5 h-5" />
    },
    {
      title: "Due Fees",
      path: "/fees/due",
      icon: <HiExclamationCircle className="w-5 h-5" />
    },
    {
      title: "Reminder",
      path: "/fees/upcoming",
      icon: <HiClock className="w-5 h-5" />
    }
  ];

  return (
    <div className="flex flex-col w-full h-screen text-black shadow-2xl bg-white border-r border-gray-200 lg:shadow-lg">
      {/* Logo/Brand Section */}
      {/*<div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#00a8cc] to-[#0077b6] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm sm:text-base">FMS</span>
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-gray-800">Fee Management</h2>
            <p className="text-xs text-gray-500">System</p>
          </div>
        </div>
      </div>*/}

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 lg:space-y-4">
          {/* Dashboard */}
          <div>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-100 text-blue-800 shadow-lg'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  }`
                }
              >
                <span className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                  {React.cloneElement(item.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                </span>
                <span className="font-medium nav-font text-sm sm:text-base truncate">{item.title}</span>
              </NavLink>
            ))}
          </div>

          {/* Students Section */}
          <div>
            <div className="space-y-1">
              {studentItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-100 text-blue-800 shadow-lg'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                    {React.cloneElement(item.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                  </span>
                  <span className="text-xs sm:text-sm font-medium nav-font truncate">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Fee Management Section */}
          <div>
            <div className="space-y-1">
              {feeItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-100 text-blue-800 shadow-lg'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                    {React.cloneElement(item.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                  </span>
                  <span className="text-xs sm:text-sm font-medium nav-font truncate">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div>
            <NavLink
              to="/change-password"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-100 text-blue-800 shadow-lg'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              <HiKey className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium nav-font truncate">Change Password</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Logout Button - Fixed at Bottom */}
      <div className="flex-shrink-0 p-2 sm:p-3 lg:p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 space-x-2 sm:space-x-3 text-black transition-all duration-200 border rounded-lg sm:rounded-xl group hover:text-black hover:bg-gray-50 border-gray-200 hover:border-gray-300 touch-manipulation active:bg-gray-100"
        >
          <HiLogout className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium nav-font truncate">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;