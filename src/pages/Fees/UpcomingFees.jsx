import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feeAPI, notificationAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { 
  FaBell, FaCalendarAlt, FaRupeeSign, FaExclamationTriangle, 
  FaInfoCircle, FaClipboardList, FaSearch, FaMoneyBillWave, 
  FaPrint, FaPaperPlane, FaUserCircle 
} from 'react-icons/fa';
import { MdSchedule, MdNotifications } from 'react-icons/md';
import { IoMdAlert } from 'react-icons/io';

const UpcomingFees = () => {
  const navigate = useNavigate();
  const [filterDays, setFilterDays] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [upcomingFees, setUpcomingFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUpcomingFees();
  }, []);

  const fetchUpcomingFees = async () => {
    try {
      setLoading(true);
      const response = await feeAPI.getUpcomingFees();
      // Handle nested data response from backend
      const feesData = response.data.data || response.data || [];
      setUpcomingFees(Array.isArray(feesData) ? feesData : []);
      setError('');
    } catch (err) {
      setError('Failed to fetch upcoming fees');
      console.error('Error fetching upcoming fees:', err);
      setUpcomingFees([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const oldUpcomingFees = [
    { id: 1, student: "Rahul Kumar", rollNo: "21", class: "1st Year", feeType: "Tuition Fee", amount: 50000, dueDate: "2025-02-05", daysLeft: 20, phone: "+91 9876543210", priority: "Medium", totalAmount: 50000, paidAmount: 0, installmentNo: 1, totalInstallments: 2 },
    { id: 2, student: "Priya Sharma", rollNo: "15", class: "2nd Year", feeType: "Library Fee", amount: 5000, dueDate: "2025-01-25", daysLeft: 10, phone: "+91 9876543211", priority: "High", totalAmount: 5000, paidAmount: 0, installmentNo: 1, totalInstallments: 1 },
    { id: 3, student: "Amit Singh", rollNo: "08", class: "3rd Year", feeType: "Lab Fee", amount: 15000, dueDate: "2025-01-30", daysLeft: 15, phone: "+91 9876543212", priority: "Medium", totalAmount: 30000, paidAmount: 15000, installmentNo: 2, totalInstallments: 2 },
    { id: 4, student: "Sneha Patel", rollNo: "32", class: "1st Year", feeType: "Hostel Fee", amount: 25000, dueDate: "2025-01-22", daysLeft: 7, phone: "+91 9876543213", priority: "High", totalAmount: 75000, paidAmount: 50000, installmentNo: 3, totalInstallments: 3 },
    { id: 5, student: "Vikash Yadav", rollNo: "05", class: "4th Year", feeType: "Exam Fee", amount: 3000, dueDate: "2025-01-18", daysLeft: 3, phone: "+91 9876543214", priority: "Critical", totalAmount: 3000, paidAmount: 0, installmentNo: 1, totalInstallments: 1 },
    { id: 6, student: "Anita Gupta", rollNo: "12", class: "2nd Year", feeType: "Transport Fee", amount: 8000, dueDate: "2025-03-15", daysLeft: 60, phone: "+91 9876543215", priority: "Low", totalAmount: 24000, paidAmount: 16000, installmentNo: 3, totalInstallments: 3 }
  ];

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-500">{error}</div>
          <button 
            onClick={fetchUpcomingFees}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredFees = Array.isArray(upcomingFees) ? upcomingFees.filter(fee => {
    const studentName = fee?.studentId?.name || '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fee?.feeType || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const today = new Date();
    const dueDate = new Date(fee?.dueDate);
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    const matchesDays = filterDays === 'all' || daysLeft <= parseInt(filterDays);
    return matchesSearch && matchesDays;
  }) : [];

  const getPriorityColor = (priority, daysLeft) => {
    if (daysLeft <= 3) return 'bg-red-100 text-red-800 border-red-200';
    if (daysLeft <= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (daysLeft <= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPriorityIcon = (daysLeft) => {
    if (daysLeft <= 3) {
      return <FaExclamationTriangle className="w-5 h-5 text-red-600" />;
    }
    if (daysLeft <= 7) {
      return <IoMdAlert className="w-5 h-5 text-orange-600" />;
    }
    return <FaCalendarAlt className="w-5 h-5 text-blue-600" />;
  };

  const totalUpcomingAmount = filteredFees.reduce((sum, fee) => sum + fee.amount, 0);
  
  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };
  
  const criticalCount = filteredFees.filter(fee => getDaysLeft(fee.dueDate) <= 3).length;
  const highPriorityCount = filteredFees.filter(fee => getDaysLeft(fee.dueDate) <= 7).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Fee Dates</h1>
          <p className="mt-1 text-gray-600">Monitor and track upcoming fee payment deadlines</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={async () => {
              const result = await Swal.fire({
                title: 'Send Bulk Notifications',
                html: `
                  <div style="text-align: left;">
                    <p>Send notifications to all students with upcoming fees?</p>
                    <div style="margin: 15px 0;">
                      <label><input type="radio" name="notifyType" value="email" checked> Email Only</label><br>
                      <label><input type="radio" name="notifyType" value="sms"> SMS Only</label><br>
                      <label><input type="radio" name="notifyType" value="both"> Both Email & SMS</label>
                    </div>
                  </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Send Notifications',
                preConfirm: () => {
                  return document.querySelector('input[name="notifyType"]:checked').value;
                }
              });
              
              if (result.isConfirmed) {
                try {
                  const students = filteredFees.map(fee => ({
                    name: fee.studentId?.name,
                    email: fee.studentId?.email,
                    phone: fee.studentId?.phone,
                    amount: fee.amount,
                    dueDate: fee.dueDate
                  }));
                  
                  await notificationAPI.sendBulkNotifications({
                    students,
                    type: result.value,
                    message: 'Your fee payment is due soon. Please make the payment to avoid late fees.'
                  });
                  
                  toast.success('Bulk notifications sent successfully!');
                } catch (error) {
                  toast.error('Failed to send bulk notifications');
                }
              }
            }}
            className="flex items-center px-6 py-3 text-white transition-all duration-200 bg-blue-500 hover:bg-blue-600 rounded-xl"
          >
            <MdNotifications className="w-5 h-5 mr-2" />
            Send Notifications
          </button>
          <button className="flex items-center px-6 py-3 text-white transition-all duration-200 college-gradient rounded-xl hover:shadow-lg">
            <MdSchedule className="w-5 h-5 mr-2" />
            Schedule Reminders
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Upcoming</p>
              <p className="text-2xl font-bold text-blue-900">₹{totalUpcomingAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 text-white bg-blue-500 rounded-xl">
              <FaRupeeSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="p-6 border border-red-200 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical (≤3 days)</p>
              <p className="text-2xl font-bold text-red-900">{criticalCount}</p>
            </div>
            <div className="p-3 text-white bg-red-500 rounded-xl">
              <FaExclamationTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="p-6 border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">High Priority (≤7 days)</p>
              <p className="text-2xl font-bold text-orange-900">{highPriorityCount}</p>
            </div>
            <div className="p-3 text-white bg-orange-500 rounded-xl">
              <FaInfoCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="p-6 border border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Records</p>
              <p className="text-2xl font-bold text-green-900">{filteredFees.length}</p>
            </div>
            <div className="p-3 text-white bg-green-500 rounded-xl">
              <FaClipboardList className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name, roll number, or fee type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-xl focus:ring-2 focus:ring-college-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              className="px-4 py-3 transition-all duration-200 border border-gray-300 rounded-xl focus:ring-2 focus:ring-college-primary focus:border-transparent"
            >
              <option value="all">All Upcoming</option>
              <option value="3">Next 3 Days</option>
              <option value="7">Next 7 Days</option>
              <option value="15">Next 15 Days</option>
              <option value="30">Next 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div className="p-6 college-gradient">
          <h2 className="flex items-center text-xl font-semibold text-white">
            <FaCalendarAlt className="w-6 h-6 mr-2" />
            Upcoming Fee Timeline ({filteredFees.length})
          </h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {filteredFees.sort((a, b) => getDaysLeft(a.dueDate) - getDaysLeft(b.dueDate)).map((fee, index) => {
              const studentName = fee.studentId?.name || 'Unknown Student';
              const daysLeft = getDaysLeft(fee.dueDate);
              const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                return new Date(dateString).toLocaleDateString('en-IN');
              };
              
              return (
              <div key={fee._id} className={`relative border-2 rounded-2xl p-6 ${getPriorityColor('', daysLeft)} card-hover`}>
                {/* Timeline Line */}
                {index < filteredFees.length - 1 && (
                  <div className="absolute left-8 top-full w-0.5 h-4 bg-gray-300"></div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {getPriorityIcon(fee.daysLeft)}
                      <div className="flex items-center justify-center w-12 h-12 font-semibold text-white rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                        <FaUserCircle className="w-8 h-8" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{studentName}</h3>
                      <p className="text-sm text-gray-600">{fee.studentId?.class} - Roll: {fee.studentId?.rollNumber}</p>
                      <p className="text-sm text-gray-500">{fee.studentId?.phone}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Fee Type</p>
                    <p className="text-lg font-semibold text-gray-900">{fee.feeType}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Due Amount</p>
                    <p className="text-xl font-bold text-gray-900">₹{fee.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 capitalize">{fee.status}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-lg font-semibold text-gray-700">{fee.description || 'N/A'}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Due Date</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(fee.dueDate)}</p>
                    <p className={`text-sm font-medium ${
                      daysLeft <= 3 ? 'text-red-600' :
                      daysLeft <= 7 ? 'text-orange-600' :
                      daysLeft <= 15 ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {daysLeft} days left
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate('/fees/add', { state: { prefillData: fee } })}
                        className="flex items-center px-3 py-2 text-sm text-white transition-colors duration-200 bg-green-500 rounded-lg hover:bg-green-600"
                      >
                        <FaMoneyBillWave className="w-4 h-4 mr-1" />
                        Collect
                      </button>
                      <button 
                        onClick={() => navigate(`/fees/print/${fee._id}`)}
                        className="flex items-center px-3 py-2 text-sm text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                      >
                        <FaPrint className="w-4 h-4 mr-1" />
                        Print
                      </button>
                    </div>
                    <button 
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: 'Send Reminder',
                          html: `
                            <div style="text-align: left;">
                              <p>Send payment reminder to <strong>${studentName}</strong></p>
                              <div style="margin: 15px 0;">
                                <label><input type="checkbox" id="sendEmail" checked> Email</label><br>
                                <label><input type="checkbox" id="sendSMS" checked> SMS</label><br>
                                <label><input type="checkbox" id="makeCall"> Call</label>
                              </div>
                            </div>
                          `,
                          icon: 'question',
                          showCancelButton: true,
                          confirmButtonColor: '#f97316',
                          cancelButtonColor: '#6b7280',
                          confirmButtonText: 'Send Notifications',
                          cancelButtonText: 'Cancel',
                          preConfirm: () => {
                            return {
                              email: document.getElementById('sendEmail').checked,
                              sms: document.getElementById('sendSMS').checked,
                              call: document.getElementById('makeCall').checked
                            };
                          }
                        });
                        
                        if (result.isConfirmed) {
                          const { email, sms, call } = result.value;
                          const studentPhone = fee.studentId?.phone;
                          const studentEmail = fee.studentId?.email;
                          
                          try {
                            if (email && studentEmail) {
                              await notificationAPI.sendEmail({
                                to: studentEmail,
                                subject: 'Fee Payment Reminder',
                                message: `Your ${fee.feeType} payment is due.`,
                                studentName,
                                amount: fee.amount,
                                dueDate: fee.dueDate
                              });
                            }
                            
                            if (sms && studentPhone) {
                              await notificationAPI.sendSMS({
                                phone: studentPhone,
                                message: `Fee payment reminder: ₹${fee.amount} due soon.`,
                                studentName,
                                amount: fee.amount,
                                dueDate: fee.dueDate
                              });
                            }
                            
                            if (call && studentPhone) {
                              await notificationAPI.makeCall({
                                phone: studentPhone,
                                studentName
                              });
                            }
                            
                            toast.success(`Notifications sent to ${studentName}!`);
                          } catch (error) {
                            toast.error('Failed to send notifications');
                            console.error('Notification error:', error);
                          }
                        }
                      }}
                      className="flex items-center justify-center w-full px-3 py-2 text-sm text-white transition-colors duration-200 bg-orange-500 rounded-lg hover:bg-orange-600"
                    >
                      <FaPaperPlane className="w-4 h-4 mr-1" />
                      Send Reminder
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {filteredFees.length === 0 && (
            <div className="py-12 text-center">
              <FaCalendarAlt className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming fees found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingFees;