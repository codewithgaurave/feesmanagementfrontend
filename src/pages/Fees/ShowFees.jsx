import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feeAPI, notificationAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { PrintFeeListButton, PrintPageButton } from '../../components/PrintButton';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { HiPrinter, HiEye, HiRefresh, HiPlus, HiDocumentText, HiBell, HiPhone } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';
import { MdCheckCircle, MdError } from 'react-icons/md';

const ShowFees = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feeAPI.getAll();
      const feesData = response.data.data || response.data || [];
      setFees(Array.isArray(feesData) ? feesData : []);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login again to view fees');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch fees data');
      }
      console.error('Error fetching fees:', err);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFees = Array.isArray(fees) ? fees.filter(fee => {
    const studentName = fee?.studentId?.name || 'Unknown Student';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fee?.feeType || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || (fee?.status || '').toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  }) : [];

  const handleViewDetails = (fee) => {
    navigate(`/fees/details/${fee._id}`, { state: { fee } });
  };



  const handleExcelDownload = (fee) => {
    const excelData = [{
      'Student Name': fee.studentId?.name || 'Unknown',
      'Roll Number': fee.studentId?.rollNumber || 'N/A',
      'Class': fee.studentId?.class || 'N/A',
      'Fee Type': fee.feeType || 'N/A',
      'Description': fee.description || 'No description',
      'Amount': fee.amount || 0,
      'Paid Amount': fee.paidAmount || 0,
      'Status': fee.status || 'Pending',
      'Due Date': fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : 'N/A',
      'Paid Date': fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN') : 'N/A',
      'Payment Method': fee.paymentMethod || 'N/A'
    }];
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fee Details');
    
    const fileName = `Fee_${fee.studentId?.name || 'Unknown'}_${fee.feeType || 'Fee'}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success('Excel file downloaded successfully!');
  };

  const handleMarkAsPaid = async (feeId, studentName, amount) => {
    const result = await Swal.fire({
      title: 'Mark as Paid?',
      html: `Mark fee for <strong>${studentName}</strong> as paid?<br><small>Amount: ₹${amount?.toLocaleString()}</small>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Mark Paid',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      try {
        await feeAPI.payFee(feeId);
        toast.success('Fee marked as paid successfully!');
        fetchFees();
      } catch (err) {
        toast.error('Error marking fee as paid: ' + err.message);
        console.error('Error marking fee as paid:', err);
      }
    }
  };
  
  const handleSendReminder = async (fee) => {
    const studentName = fee.studentId?.name || 'Unknown Student';
    const studentEmail = fee.studentId?.email;
    const studentPhone = fee.studentId?.phone;
    
    if (!studentEmail && !studentPhone) {
      toast.error('No email or phone number available for this student');
      return;
    }
    
    const { value: reminderType } = await Swal.fire({
      title: 'Send Payment Reminder',
      html: `Send reminder to <strong>${studentName}</strong>?<br><small>Amount: ₹${fee.amount?.toLocaleString()}</small>`,
      icon: 'question',
      input: 'select',
      inputOptions: {
        'email': `Email ${studentEmail ? '(' + studentEmail + ')' : '(Not available)'}`,
        'sms': `SMS ${studentPhone ? '(' + studentPhone + ')' : '(Not available)'}`,
        'both': 'Both Email & SMS'
      },
      inputValue: 'both',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Send Reminder',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) return 'Please select a reminder type';
        if (value === 'email' && !studentEmail) return 'Email not available';
        if (value === 'sms' && !studentPhone) return 'Phone number not available';
      }
    });
    
    if (reminderType) {
      const loadingToast = toast.loading('Sending reminder...');
      
      try {
        const reminderData = {
          studentName,
          amount: fee.amount || 0,
          dueDate: fee.dueDate,
          feeType: fee.feeType || 'Fee Payment',
          message: fee.status === 'overdue' ? 'Your fee payment is overdue. Please pay immediately to avoid penalties.' : 'Please pay your fee at the earliest.'
        };
        
        let success = false;
        
        if (reminderType === 'email' || reminderType === 'both') {
          if (studentEmail) {
            await notificationAPI.sendEmail({
              to: studentEmail,
              ...reminderData
            });
            success = true;
          }
        }
        
        if (reminderType === 'sms' || reminderType === 'both') {
          if (studentPhone) {
            await notificationAPI.sendSMS({
              phone: studentPhone,
              ...reminderData
            });
            success = true;
          }
        }
        
        toast.dismiss(loadingToast);
        
        if (success) {
          toast.success(`Reminder sent to ${studentName} via ${reminderType}!`);
        } else {
          toast.error('Failed to send reminder');
        }
        
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('Error sending reminder: ' + error.message);
        console.error('Reminder error:', error);
      }
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchFees}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">Manage all student fees and payments</p>
        </div>
        <div className="flex space-x-3 flex-wrap">
          <button
            onClick={fetchFees}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            disabled={loading}
          >
            <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/fees/add')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <HiPlus className="w-5 h-5" />
            <span>Add Fee</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Fees</p>
              <p className="text-2xl font-bold text-blue-900">₹{fees.reduce((sum, fee) => sum + (fee.amount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-xl">
              <FaRupeeSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Collected</p>
              <p className="text-2xl font-bold text-green-900">₹{fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + (fee.amount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-xl">
              <MdCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Due Amount</p>
              <p className="text-2xl font-bold text-red-900">₹{fees.filter(fee => fee.status !== 'paid').reduce((sum, fee) => sum + (fee.amount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-red-500 text-white p-3 rounded-xl">
              <MdError className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Records</p>
              <p className="text-2xl font-bold text-purple-900">{fees.length}</p>
            </div>
            <div className="bg-purple-500 text-white p-3 rounded-xl">
              <HiDocumentText className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({fees.length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paid ({fees.filter(f => f.status === 'paid').length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({fees.filter(f => f.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'overdue' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overdue ({fees.filter(f => f.status === 'overdue').length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <input
          type="text"
          placeholder="Search by student name or fee type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFees.map((fee) => (
                <tr key={fee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {fee.studentId?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {fee.studentId?.name || 'Unknown Student'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Roll: {fee.studentId?.rollNumber || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fee.feeType || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{fee.description || 'No description'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{fee.amount?.toLocaleString() || 0}</div>
                    {fee.paidAmount > 0 && (
                      <div className="text-sm text-green-600">Paid: ₹{fee.paidAmount.toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                      fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {fee.status?.charAt(0).toUpperCase() + fee.status?.slice(1) || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(fee)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <HiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleExcelDownload(fee)}
                        className="text-green-600 hover:text-green-900"
                        title="Download Excel"
                      >
                        <HiPrinter className="w-5 h-5" />
                      </button>
                      {fee.status !== 'paid' && (
                        <>
                          <button
                            onClick={() => handleSendReminder(fee)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Send Reminder"
                          >
                            <HiBell className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleMarkAsPaid(fee._id, fee.studentId?.name, fee.amount)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Paid"
                          >
                            <FaRupeeSign className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {fee.studentId?.phone && (
                        <a
                          href={`tel:${fee.studentId.phone}`}
                          className="text-purple-600 hover:text-purple-900"
                          title="Call Student"
                        >
                          <HiPhone className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredFees.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">
            {fees.length === 0 ? 'No fees have been added yet' : 'No fees found matching your criteria'}
          </div>
          {fees.length === 0 && (
            <button
              onClick={() => navigate('/fees/add')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add First Fee
            </button>
          )}
        </div>
      )}


    </div>
  );
};

export default ShowFees;