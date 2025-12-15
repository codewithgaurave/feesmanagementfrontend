import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { PrintStudentDetailsButton } from '../../components/PrintButton';
import { HiArrowLeft, HiInformationCircle, HiEye, HiDocumentText } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';
import { MdCheckCircle, MdError } from 'react-icons/md';

const StudentFeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentFees();
  }, [id]);

  const fetchStudentFees = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First try to get student with fees
      const response = await studentAPI.getByStudentId(id);
      const feeData = response.data;
      
      if (feeData && feeData.student) {
        setStudent(feeData.student);
        setFees(Array.isArray(feeData.fees) ? feeData.fees : []);
      } else {
        // Fallback: get student info separately
        const studentResponse = await studentAPI.getById(id);
        const studentData = studentResponse.data.data || studentResponse.data;
        if (studentData) {
          setStudent(studentData);
          setFees([]);
        } else {
          throw new Error('Student not found');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch student fee details';
      setError(errorMessage);
      setStudent(null);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateTotals = () => {
    const totalAmount = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const paidAmount = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const dueAmount = totalAmount - paidAmount;
    return { totalAmount, paidAmount, dueAmount };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading student fee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <div className="text-sm text-gray-600 mb-4">
            Student ID: {id}
          </div>
          <div className="space-x-3">
            <button 
              onClick={fetchStudentFees}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/students/show')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { totalAmount, paidAmount, dueAmount } = calculateTotals();

  // If no student data found, show error
  if (!loading && !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">Student Not Found</div>
          <div className="text-sm text-gray-600 mb-4">
            No student found with ID: {id}
          </div>
          <button 
            onClick={() => navigate('/students/show')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Fee Details - {student?.name || 'Student'}
          </h1>
          <p className="text-gray-600 mt-1">
            Complete fee history for Roll No: {student?.rollNumber}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {student && (
            <PrintStudentDetailsButton 
              student={student} 
              fees={fees}
              variant="success"
              text="Print Details"
            />
          )}
          <button
            onClick={() => navigate('/students/show')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <HiArrowLeft className="w-4 h-4" />
            <span>Back to Students</span>
          </button>
        </div>
      </div>

      {/* Status Info */}
      {student && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <HiInformationCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700">
              Showing fee details for <strong>{student.name}</strong> (Roll: {student.rollNumber})
              {fees.length > 0 ? ` - ${fees.length} fee record(s) found` : ' - No fee records found'}
            </p>
          </div>
        </div>
      )}

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
        {student ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-500">Name</span>
              <p className="font-medium text-gray-900">{student.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Roll Number</span>
              <p className="font-medium text-gray-900">{student.rollNumber || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Class</span>
              <p className="font-medium text-gray-900">{student.class || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">Student information not available</p>
          </div>
        )}
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-900">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-xl">
              <FaRupeeSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-900">₹{paidAmount.toLocaleString()}</p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-xl">
              <MdCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Due Amount</p>
              <p className="text-2xl font-bold text-red-900">₹{dueAmount.toLocaleString()}</p>
            </div>
            <div className="bg-red-500 text-white p-3 rounded-xl">
              <MdError className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Fee Records */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Fee Records ({fees.length})</h3>
        </div>
        
        {fees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{fee.feeType}</div>
                      {fee.description && (
                        <div className="text-sm text-gray-500">{fee.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ₹{fee.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600">
                      ₹{(fee.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      ₹{((fee.amount || 0) - (fee.paidAmount || 0)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(fee.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                        {fee.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/fees/details/${fee._id}`)}
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <HiDocumentText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fee records found</h3>
            <p className="mt-1 text-sm text-gray-500">No fees have been added for this student yet.</p>
            <button
              onClick={() => navigate('/fees/add')}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add Fee
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeeDetails;