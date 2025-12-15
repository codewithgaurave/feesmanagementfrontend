import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { feeAPI, studentAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { HiRefresh } from 'react-icons/hi';

const AddFee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    studentId: '',
    feeType: '',
    amount: '',
    dueDate: '',
    description: '',
    status: 'pending'
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(true);

  const feeTypes = [
    'Tuition Fee',
    'Admission Fee',
    'Exam Fee',
    'Library Fee',
    'Lab Fee',
    'Sports Fee',
    'Transport Fee',
    'Hostel Fee'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // No need for additional logic as backend handles student reference
  };

  useEffect(() => {
    fetchStudents();
    
    if (location.state?.prefillData) {
      const data = location.state.prefillData;
      setFormData(prev => ({
        ...prev,
        studentId: data.studentId || data._id,
        feeType: data.feeType,
        amount: data.amount || data.dueAmount
      }));
    }
  }, [location.state]);

  const fetchStudents = async () => {
    try {
      setFetchingStudents(true);
      console.log('Fetching students...');
      
      // Check if auth token exists
      const token = localStorage.getItem('authToken');
      console.log('Auth token exists:', !!token);
      
      const response = await studentAPI.getAll();
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      const studentsData = response.data?.data || [];
      console.log('Students array:', studentsData);
      console.log('Students count:', studentsData.length);
      
      setStudents(studentsData);
      
      if (studentsData.length === 0) {
        console.log('No students found in response');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message);
      
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Failed to fetch students: ${errorMsg}`);
      setStudents([]);
    } finally {
      setFetchingStudents(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await feeAPI.create(formData);
      const student = students.find(s => s._id === formData.studentId);
      
      toast.success('Fee added successfully!');
      
      await Swal.fire({
        title: 'Fee Added!',
        html: `
          <div class="text-left">
            <p><strong>Student:</strong> ${student?.name}</p>
            <p><strong>Amount:</strong> ₹${formData.amount}</p>
            <p><strong>Fee Type:</strong> ${formData.feeType}</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      });
      
      navigate('/fees/show');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add fee. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Fee</h1>
          <p className="mt-1 text-gray-600">Collect fee from students</p>
        </div>
        <button
          onClick={() => navigate('/fees/show')}
          className="px-4 py-2 text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600"
        >
          Back to Fees
        </button>
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select Student *
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                disabled={fetchingStudents}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">
                  {fetchingStudents ? 'Loading students...' : 
                   students.length === 0 ? 'No students available' : 'Choose a student'}
                </option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name} - {student.class} (Roll: {student.rollNumber})
                  </option>
                ))}
              </select>
              {!fetchingStudents && students.length === 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No students found. Please{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/students/add')}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      add students
                    </button>
                    {' '}first.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Fee Type *
              </label>
              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select fee type</option>
                {feeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any additional notes..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/fees/show')}
              className="px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-white transition-colors bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <HiRefresh className="animate-spin h-4 w-4" />
                  <span>Adding Fee...</span>
                </>
              ) : (
                <span>Add Fee</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFee;