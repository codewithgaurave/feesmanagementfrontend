import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { studentAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { PrintStudentListButton, PrintPageButton } from '../../components/PrintButton';
import { HiSearch, HiPlus, HiEye, HiPencil, HiTrash, HiUsers, HiCheckCircle, HiCash, HiPrinter } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';
import * as XLSX from 'xlsx';

// Add Google Fonts
if (!document.querySelector('link[href*="Inter"]')) {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

// Add custom styles
if (!document.querySelector('#custom-dashboard-styles')) {
  const style = document.createElement('style');
  style.id = 'custom-dashboard-styles';
  style.textContent = `
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .dashboard-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .card-shadow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .card-hover {
      transition: all 0.3s ease;
    }
    
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  `;
  document.head.appendChild(style);
}

const ShowStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll();
      // Handle nested data response from backend
      const studentsData = response.data.data || response.data || [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setError('');
    } catch (err) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
      setStudents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const calculateFeeStatus = (student) => {
    const totalFee = student.totalFee || 0;
    const paidFee = student.paidFee || 0;
    const dueAmount = totalFee - paidFee;
    const status = dueAmount <= 0 ? 'Paid' : dueAmount < totalFee ? 'Partial' : 'Due';
    return { status, dueAmount, totalFee };
  };

  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    const matchesSearch = student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.class?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    
    const { status } = calculateFeeStatus(student);
    
    // Map filter status to actual status  
    let targetStatus = statusFilter;
    if (statusFilter === 'Overdue' || statusFilter === 'Pending') {
      targetStatus = 'Due';
    }
    
    return matchesSearch && status === targetStatus;
  }) : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to first page when search, filter, or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const handleDelete = async (id) => {
    const student = students.find(s => s._id === id);
    
    const result = await Swal.fire({
      title: 'Delete Student?',
      html: `Are you sure you want to delete <strong>${student.name}</strong>?<br><small>This action cannot be undone.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      try {
        await studentAPI.delete(id);
        toast.success('Student deleted successfully!');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/students/edit/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/students/details/${id}`);
  };

  const handleFeeDetails = (id) => {
    navigate(`/students/fees/${id}`);
  };

  const handleExcelDownload = () => {
    const excelData = filteredStudents.map(student => ({
      'Name': student.name || 'N/A',
      'Roll Number': student.rollNumber || 'N/A',
      'Class': student.class || 'N/A',
      'Session': student.session || 'N/A',
      'Phone': student.phone || 'N/A',
      'Email': student.email || 'N/A',
      'Address': student.address || 'N/A',
      'Date of Birth': student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : 'N/A',
      'Total Fee': student.totalFee || 0,
      'Paid Fee': student.paidFee || 0,
      'Due Amount': (student.totalFee || 0) - (student.paidFee || 0),
      'Fee Status': calculateFeeStatus(student).status
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    const fileName = `Students_List_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success('Excel file downloaded successfully!');
  };

  const getStatusBadge = (status) => {
    const colorScheme = {
      'Paid': 'green',
      'Partial': 'blue', 
      'Due': 'red'
    };
    return colorScheme[status] || 'gray';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Due': return 'bg-red-100 text-red-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="mb-6 text-xl font-semibold text-rose-600">{error}</div>
          <button 
            onClick={fetchStudents}
            className="px-6 py-3 text-white bg-blue-400 rounded-xl hover:bg-blue-500 transition-all duration-300 font-semibold shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-blue-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
         
        <div className="flex space-x-3">
          <button
            onClick={handleExcelDownload}
            className="flex items-center px-6 py-3 space-x-2 text-white transition-all duration-300 rounded-xl bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl font-semibold"
          >
            <HiPrinter className="w-5 h-5" />
            <span>Print List</span>
          </button>
          <button
            onClick={() => navigate('/students/add')}
            className="flex items-center px-6 py-3 space-x-2 text-white transition-all duration-300 rounded-xl bg-blue-400 hover:bg-blue-500 shadow-lg hover:shadow-xl font-semibold"
          >
            <HiPlus className="w-5 h-5" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* Search Bar and Filters */}
      <div className="p-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <HiSearch className="w-5 h-5 text-blue-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name, roll number, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-12 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/90 backdrop-blur-sm font-medium text-gray-600 placeholder-gray-400 transition-all duration-200"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {['All', 'Paid', 'Partial', 'Overdue', 'Pending'].map((filterStatus) => {
              const isActive = statusFilter === filterStatus;
              
              let buttonClasses = 'px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ';
              
              if (filterStatus === 'All') {
                buttonClasses += isActive 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
              } else if (filterStatus === 'Paid') {
                buttonClasses += isActive 
                  ? 'bg-green-500 text-white border-green-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50';
              } else if (filterStatus === 'Partial') {
                buttonClasses += isActive 
                ? 'bg-yellow-300 text-white border-yellow-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50';
              } else if (filterStatus === 'Overdue') {
                buttonClasses += isActive 
                  ? 'bg-red-300 text-white border-red-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
              } else if (filterStatus === 'Pending') {
                buttonClasses += isActive 
                ? 'bg-orange-300 text-white border-orange-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50';
              }
              
              return (
                <button
                  key={filterStatus}
                  onClick={() => setStatusFilter(filterStatus)}
                  className={buttonClasses}
                >
                  {filterStatus}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Students Table - Chakra UI Style */}
      <div className="p-6 overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Student Info
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Academic
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Fee Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentStudents.map((student) => {
                const { status, dueAmount, totalFee } = calculateFeeStatus(student);
                return (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-semibold text-sm">
                              {student.name?.charAt(0) || 'S'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-700">
                            {student.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {student.rollNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-700">
                          {student.phone || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.email || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.address || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-700">
                          Class: {student.class || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Session: {student.session || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          DOB: {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          status === 'Paid' ? 'bg-green-100 text-green-700' :
                          status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {status}
                        </span>
                        <div className="text-sm font-medium text-gray-700">
                          Total: ₹{totalFee.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Due: ₹{dueAmount.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(student._id)}
                          className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                          title="View Details"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(student._id)}
                          className="p-2 text-orange-600 bg-orange-100 rounded-lg hover:bg-orange-200 transition-all duration-200"
                          title="Edit Student"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeeDetails(student._id)}
                          className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all duration-200"
                          title="Fee Details"
                        >
                          <FaRupeeSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200"
                          title="Delete Student"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={filteredStudents.length}>All</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;
                
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        isCurrentPage
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                
                // Show ellipsis
                if (
                  (page === currentPage - 2 && currentPage > 3) ||
                  (page === currentPage + 2 && currentPage < totalPages - 2)
                ) {
                  return (
                    <span key={page} className="px-3 py-2 text-sm text-gray-400">
                      ...
                    </span>
                  );
                }
                
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-400 rounded-xl shadow-lg">
                <HiUsers className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-gray-700">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-400 rounded-xl shadow-lg">
                <HiCheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500">Active Students</p>
              <p className="text-3xl font-bold text-gray-700">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-400 rounded-xl shadow-lg">
                <HiCash className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500">Total Fee Amount</p>
              <p className="text-3xl font-bold text-gray-700">₹{students.reduce((sum, s) => sum + (s.totalFee || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowStudents;