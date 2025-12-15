import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { studentAPI } from '../../utils/api';
import { HiArrowLeft, HiPlus, HiRefresh } from 'react-icons/hi';

const AddStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    class: '',
    section: '',
    phone: '',
    email: '',
    address: '',
    parentName: '',
    parentPhone: '',
    admissionDate: '',
    totalFee: '',
    feeType: 'Annual'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting student data:', formData);
      
      // Check if auth token exists
      const token = localStorage.getItem('authToken');
      console.log('Auth token exists:', !!token);
      
      const response = await studentAPI.create(formData);
      console.log('Student created successfully:', response);
      
      toast.success('Student added successfully!');
      
      await Swal.fire({
        title: 'Success!',
        text: 'Student has been added successfully.',
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      });
      
      navigate('/students/show');
    } catch (error) {
      console.error('Error adding student:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to add student. Please try again.';
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Add New Student</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Enter student information to add to the system</p>
        </div>
        <button
          onClick={() => navigate('/students/show')}
          className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter roll number"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Class</option>
                  <option value="11th Science">11th Science</option>
                  <option value="11th Commerce">11th Commerce</option>
                  <option value="11th Arts">11th Arts</option>
                  <option value="12th Science">12th Science</option>
                  <option value="12th Commerce">12th Commerce</option>
                  <option value="12th Arts">12th Arts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="mt-4 sm:mt-6 sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter complete address"
              />
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Name *
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter parent/guardian name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Phone Number *
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter parent phone number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic & Fee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Date *
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Fee Amount *
                </label>
                <input
                  type="number"
                  name="totalFee"
                  value={formData.totalFee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter total fee amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Type *
                </label>
                <select
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Annual">Annual</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="One-time">One-time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/students/show')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <HiRefresh className="animate-spin h-4 w-4" />
                  <span>Adding Student...</span>
                </>
              ) : (
                <>
                  <HiPlus className="w-4 h-4" />
                  <span>Add Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;