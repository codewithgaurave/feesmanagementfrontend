import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
//import logo from '../assets/logo.png';

const AdminLayout = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 ml-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 border-b shadow-sm bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/*<div className="flex items-center space-x-3">
                  <div className="w-8 h-8 p-1 rounded-lg bg-gradient-to-br from-college-primary to-college-secondary">
                    <img 
                      src={logo} 
                      alt="Logo" 
                      className="object-contain w-full h-full p-1 rounded-md bg-white/20"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800 font-heading text-elegant">
                    Administrative Dashboard
                    </h1>
                  </div>
                </div>*/}
              </div>

              <div className="flex items-center space-x-6">
                {/* Time and Date */}
                <div className="flex flex-col items-end">
                  <div className="text-sm font-semibold text-gray-700">
                    {currentDateTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentDateTime.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {/* Notifications */}
               

                {/* Admin Profile */}
                <div className="flex items-center px-4 py-2 space-x-3 bg-gradient-to-r from-[#00a8cc]/10 to-[#0077b6]/10 rounded-xl">
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full bg-gradient-to-br from-[#00a8cc] to-[#0077b6]">
                    A
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-700 font-ui">Admin User</p>
                    <p className="text-xs text-gray-500 font-body">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t bg-white/50 backdrop-blur-sm border-slate-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p className="font-body">© 2024 Fee Management System. All rights reserved.</p>
            <p className="font-ui">Version 1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;