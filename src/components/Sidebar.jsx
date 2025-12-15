import React from "react";
import { NavLink } from "react-router-dom";
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

const Sidebar = () => {
  const { logout } = useAuth();

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
    <div className="fixed flex flex-col w-64 h-screen text-black shadow-2xl bg-white border-r border-gray-200">
      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Dashboard */}
          <div>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-100 text-blue-800 shadow-lg'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  }`
                }
              >
                <span className="transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-medium nav-font">{item.title}</span>
              </NavLink>
            ))}
          </div>

          {/* Students Section */}
          <div>
            <div className="">
              {studentItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-100 text-blue-800 shadow-lg'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium nav-font">{item.title}</span>
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
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-100 text-blue-800 shadow-lg'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium nav-font">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div>
            <NavLink
              to="/change-password"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-100 text-blue-800 shadow-lg'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              <HiKey className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-sm font-medium nav-font">Change Password</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Logout Button - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 space-x-3 text-black transition-all duration-200 border rounded-xl group hover:text-black hover:bg-gray-50 border-gray-200 hover:border-gray-300"
        >
          <HiLogout className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-sm font-medium nav-font">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;