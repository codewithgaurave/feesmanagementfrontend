import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, feeAPI, notificationAPI } from '../../utils/api';
import { PrintStudentDetailsButton, PrintPageButton } from '../../components/PrintButton';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import { HiArrowLeft, HiUser, HiPencil, HiChatAlt, HiPhone, HiDocumentText, HiLightningBolt } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      // Load student data
      const studentRes = await studentAPI.getById(id);
      const studentData = studentRes.data.data || studentRes.data;
      setStudent(studentData);
      
      // Load fees data
      try {
        const feesRes = await feeAPI.getByStudentId(id);
        const feesData = feesRes.data.data || feesRes.data || [];
        setFees(Array.isArray(feesData) ? feesData : []);
      } catch (feeError) {
        console.log('No fees found for student:', feeError);
        setFees([]);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      setStudent(null);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!student?.phone) {
      toast.error('Student phone number not available');
      return;
    }
    
    setActionLoading(true);
    try {
      const dueAmount = student.dueAmount || 0;
      const message = `Dear ${student.name}, your fee payment is due. Please pay ₹${dueAmount.toLocaleString()} at your earliest convenience. Thank you.`;
      
      await notificationAPI.sendSMS({
        phone: student.phone,
        message: message,
        studentName: student.name,
        amount: dueAmount,
        email: student.email
      });
      toast.success('SMS sent successfully!');
    } catch (error) {
      console.error('Error sending SMS:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error sending SMS';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeCall = async () => {
    if (!student?.phone) {
      toast.error('Student phone number not available');
      return;
    }
    
    setActionLoading(true);
    try {
      await notificationAPI.makeCall({
        phone: student.phone,
        studentName: student.name
      });
      toast.success('Call initiated successfully!');
    } catch (error) {
      console.error('Error making call:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error making call';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayFee = async (feeId) => {
    setActionLoading(true);
    try {
      await feeAPI.payFee(feeId, { paymentMethod: 'cash' });
      toast.success('Fee payment recorded successfully!');
      loadStudentData(); // Reload data
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Error recording payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!student) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Student not found</h3>
        <button
          onClick={() => navigate('/students/show')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
          <p className="text-gray-600 mt-1">Complete information about {student.name}</p>
        </div>
        <div className="flex space-x-3">
          <PrintStudentDetailsButton 
            student={student} 
            fees={fees}
            size="md"
          />
          <PrintPageButton 
            pageTitle={`${student.name} Details - Career Medical College`}
            variant="outline"
            size="md"
          />
          <button
            onClick={() => navigate('/students/show')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <HiArrowLeft className="w-4 h-4" />
            <span>Back to Students</span>
          </button>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HiUser className="w-5 h-5 mr-2 text-blue-600" />
            Personal Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Roll Number</p>
              <p className="font-medium text-gray-900">{student.rollNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-medium text-gray-900">{student.class}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{student.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{student.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{student.address}</p>
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaRupeeSign className="w-5 h-5 mr-2 text-green-600" />
            Fee Summary
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Fee</p>
              <p className="text-2xl font-bold text-gray-900">₹{student.totalFee?.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">Paid Amount</p>
              <p className="text-xl font-semibold text-green-700">₹{student.paidAmount?.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">Due Amount</p>
              <p className="text-xl font-semibold text-red-700">₹{student.dueAmount?.toLocaleString()}</p>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-500">Fee Status</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                student.feeStatus === 'paid' ? 'bg-green-100 text-green-800' :
                student.feeStatus === 'due' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {student.feeStatus?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HiLightningBolt className="w-5 h-5 mr-2 text-purple-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/students/edit/${student._id}`)}
              className="w-full bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <HiPencil className="w-4 h-4" />
              <span>Edit Student</span>
            </button>
            
            <button
              onClick={handleSendSMS}
              disabled={actionLoading || !student?.phone}
              className="w-full bg-green-100 text-green-700 px-4 py-3 rounded-lg hover:bg-green-200 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              title={!student?.phone ? 'Phone number not available' : 'Send SMS reminder'}
            >
              <HiChatAlt className="w-4 h-4" />
              <span>{actionLoading ? 'Sending...' : 'Send SMS'}</span>
            </button>
            
            <button
              onClick={handleMakeCall}
              disabled={actionLoading || !student?.phone}
              className="w-full bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg hover:bg-yellow-200 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              title={!student?.phone ? 'Phone number not available' : 'Make call'}
            >
              <HiPhone className="w-4 h-4" />
              <span>{actionLoading ? 'Calling...' : 'Make Call'}</span>
            </button>
            
            <button
              onClick={() => navigate(`/fees/details/${student._id}`)}
              className="w-full bg-purple-100 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <HiDocumentText className="w-4 h-4" />
              <span>Fee Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fee History */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <HiDocumentText className="w-5 h-5 mr-2 text-indigo-600" />
            Fee History
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fees.map((fee) => (
                <tr key={fee._id || fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fee.feeType}</div>
                    {fee.receiptNumber && (
                      <div className="text-sm text-gray-500">Receipt: {fee.receiptNumber}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{fee.amount?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{fee.dueDate}</div>
                    {fee.paidDate && (
                      <div className="text-sm text-green-600">Paid: {fee.paidDate}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                      fee.status === 'due' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {fee.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {fee.status !== 'paid' && (
                      <button
                        onClick={() => handlePayFee(fee._id || fee.id)}
                        disabled={actionLoading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {fees.length === 0 && (
          <div className="text-center py-12">
            <HiDocumentText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fee records</h3>
            <p className="mt-1 text-sm text-gray-500">No fee records found for this student.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;