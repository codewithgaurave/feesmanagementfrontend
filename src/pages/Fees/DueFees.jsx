import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { feeAPI, notificationAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { 
  HiCurrencyRupee, 
  HiUsers, 
  HiExclamationCircle, 
  HiCash, 
  HiBell, 
  HiPrinter, 
  HiPhone 
} from 'react-icons/hi';

const DueFees = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dueFees, setDueFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchDueFees();
  }, []);

  const fetchDueFees = async () => {
    try {
      if (!initialized) setLoading(true);
      setError('');
      const response = await feeAPI.getDueFees();
      const feesData = response.data.data || response.data || [];
      setDueFees(Array.isArray(feesData) ? feesData : []);
    } catch (err) {
      console.error('Error fetching due fees:', err);
      if (!initialized) {
        setError('Failed to fetch due fees');
        setDueFees([]);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const oldDueFees = [
    {
      id: 2,
      studentId: 2,
      studentName: 'Jane Smith',
      class: 'Class 11',
      feeType: 'Tuition Fee',
      totalAmount: 18000,
      paidAmount: 10000,
      dueAmount: 8000,
      dueDate: '2024-01-20',
      daysOverdue: 5,
      phone: '+91 9876543210',
      email: 'jane@example.com',
      upcomingDate: '2024-02-20',
      nextInstallmentAmount: 8000
    },
    {
      id: 3,
      studentId: 3,
      studentName: 'Mike Johnson',
      class: 'Class 12',
      feeType: 'Exam Fee',
      totalAmount: 5000,
      paidAmount: 0,
      dueAmount: 5000,
      dueDate: '2024-01-25',
      daysOverdue: 0,
      phone: '+91 9876543211',
      email: 'mike@example.com',
      upcomingDate: '2024-02-25',
      nextInstallmentAmount: 5000
    },
    {
      id: 4,
      studentId: 4,
      studentName: 'Sarah Wilson',
      class: 'Class 9',
      feeType: 'Lab Fee',
      totalAmount: 3000,
      paidAmount: 1000,
      dueAmount: 2000,
      dueDate: '2024-01-15',
      daysOverdue: 10,
      phone: '+91 9876543212',
      email: 'sarah@example.com',
      upcomingDate: '2024-02-15',
      nextInstallmentAmount: 2000
    }
  ];

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchDueFees}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use dummy data if no real data available and not loading
  const dataToUse = (initialized && dueFees.length === 0 && !error) ? oldDueFees : dueFees;
  
  const filteredDueFees = Array.isArray(dataToUse) ? dataToUse.filter(fee => {
    const studentName = fee?.studentId?.name || fee?.studentName || '';
    const feeType = fee?.feeType || '';
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           feeType.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  const getDuePriority = (daysOverdue) => {
    if (daysOverdue > 7) return { color: 'bg-red-100 text-red-800', label: 'Critical' };
    if (daysOverdue > 0) return { color: 'bg-orange-100 text-orange-800', label: 'Overdue' };
    return { color: 'bg-yellow-100 text-yellow-800', label: 'Due Soon' };
  };

  const handleSendReminder = async (fee) => {
    const studentName = fee.studentId?.name || fee.studentName || 'Unknown Student';
    const studentEmail = fee.studentId?.email || fee.email;
    const studentPhone = fee.studentId?.phone || fee.phone;
    
    if (!studentEmail && !studentPhone) {
      toast.error('No email or phone number available for this student');
      return;
    }
    
    const { value: reminderType } = await Swal.fire({
      title: 'Send Reminder',
      html: `Send payment reminder to <strong>${studentName}</strong>?<br><small>Due Amount: ₹${(fee.dueAmount || fee.amount || 0).toLocaleString()}</small>`,
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
        if (value === 'both' && !studentEmail && !studentPhone) return 'No contact information available';
      }
    });
    
    if (reminderType) {
      const loadingToast = toast.loading('Sending reminder...');
      
      try {
        const reminderData = {
          studentName,
          amount: fee.dueAmount || fee.amount || 0,
          dueDate: fee.dueDate,
          feeType: fee.feeType || 'Fee Payment',
          message: 'Please pay your fee at the earliest to avoid late charges.'
        };
        
        let emailSuccess = false;
        let smsSuccess = false;
        
        if (reminderType === 'email' || reminderType === 'both') {
          if (studentEmail) {
            try {
              await notificationAPI.sendEmail({
                to: studentEmail,
                ...reminderData
              });
              emailSuccess = true;
            } catch (error) {
              console.error('Email error:', error);
            }
          }
        }
        
        if (reminderType === 'sms' || reminderType === 'both') {
          if (studentPhone) {
            try {
              await notificationAPI.sendSMS({
                phone: studentPhone,
                ...reminderData
              });
              smsSuccess = true;
            } catch (error) {
              console.error('SMS error:', error);
            }
          }
        }
        
        toast.dismiss(loadingToast);
        
        if (reminderType === 'both') {
          if (emailSuccess && smsSuccess) {
            toast.success(`Reminder sent to ${studentName} via Email & SMS!`);
          } else if (emailSuccess) {
            toast.success(`Email reminder sent to ${studentName}!`);
            if (!smsSuccess) toast.error('SMS failed to send');
          } else if (smsSuccess) {
            toast.success(`SMS reminder sent to ${studentName}!`);
            if (!emailSuccess) toast.error('Email failed to send');
          } else {
            toast.error('Failed to send reminders');
          }
        } else if (reminderType === 'email' && emailSuccess) {
          toast.success(`Email reminder sent to ${studentName}!`);
        } else if (reminderType === 'sms' && smsSuccess) {
          toast.success(`SMS reminder sent to ${studentName}!`);
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

  const handleCollectFee = (fee) => {
    navigate('/fees/add', { state: { studentId: fee.studentId, prefillData: fee } });
  };

  const totalDueAmount = filteredDueFees.reduce((sum, fee) => sum + (fee.amount || fee.dueAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Due Fees</h1>
          <p className="text-gray-600 mt-1">Manage overdue and upcoming fee payments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={async () => {
              if (filteredDueFees.length === 0) {
                toast.error('No students with due fees found');
                return;
              }
              
              const { value: bulkType } = await Swal.fire({
                title: 'Send Bulk Reminders',
                html: `Send payment reminders to all <strong>${filteredDueFees.length} students</strong> with due fees?`,
                icon: 'question',
                input: 'select',
                inputOptions: {
                  'email': 'Email Only',
                  'sms': 'SMS Only',
                  'both': 'Both Email & SMS'
                },
                inputValue: 'both',
                showCancelButton: true,
                confirmButtonColor: '#f97316',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Send All Reminders',
                cancelButtonText: 'Cancel'
              });
              
              if (bulkType) {
                const loadingToast = toast.loading(`Sending ${bulkType} reminders to ${filteredDueFees.length} students...`);
                
                try {
                  const studentsData = filteredDueFees.map(fee => ({
                    name: fee.studentId?.name || fee.studentName || 'Unknown Student',
                    email: fee.studentId?.email || fee.email,
                    phone: fee.studentId?.phone || fee.phone,
                    amount: fee.dueAmount || fee.amount || 0,
                    dueDate: fee.dueDate,
                    feeType: fee.feeType || 'Fee Payment'
                  }));
                  
                  const response = await notificationAPI.sendBulkNotifications({
                    students: studentsData,
                    type: bulkType,
                    message: 'This is a reminder for your pending fee payment. Please pay at the earliest to avoid late charges.',
                    subject: 'Fee Payment Reminder - Urgent'
                  });
                  
                  toast.dismiss(loadingToast);
                  
                  if (response.data.success) {
                    const { successful, failed, total } = response.data.summary;
                    toast.success(`Bulk reminders completed! ${successful}/${total} sent successfully`);
                    
                    if (failed > 0) {
                      toast.error(`${failed} reminders failed to send`);
                    }
                  } else {
                    toast.error('Failed to send bulk reminders');
                  }
                  
                } catch (error) {
                  toast.dismiss(loadingToast);
                  toast.error('Error sending bulk reminders: ' + error.message);
                  console.error('Bulk reminder error:', error);
                }
              }
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Send All Reminders
          </button>
          <button
            onClick={() => navigate('/fees/show')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            All Fees
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Due Amount</p>
              <p className="text-2xl font-bold text-red-800">₹{totalDueAmount.toLocaleString()}</p>
            </div>
            <div className="bg-red-500 text-white p-3 rounded-xl">
              <HiCurrencyRupee className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Students with Due</p>
              <p className="text-2xl font-bold text-orange-800">{filteredDueFees.length}</p>
            </div>
            <div className="bg-orange-500 text-white p-3 rounded-xl">
              <HiUsers className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Critical Cases</p>
              <p className="text-2xl font-bold text-yellow-800">
                {filteredDueFees.filter(fee => (fee.daysOverdue || 0) > 7).length}
              </p>
            </div>
            <div className="bg-yellow-500 text-white p-3 rounded-xl">
              <HiExclamationCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <input
          type="text"
          placeholder="Search by student name or fee type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Due Fees List */}
      <div className="space-y-4">
        {filteredDueFees.map(fee => {
          const priority = getDuePriority(fee.daysOverdue || 0);
          const studentName = fee.studentId?.name || fee.studentName || 'Unknown Student';
          return (
            <div key={fee._id || fee.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {studentName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{studentName}</h3>
                    <p className="text-sm text-gray-600">{fee.studentId?.class || fee.class} • {fee.feeType}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${priority.color}`}>
                  {priority.label}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">₹{(fee.totalAmount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-600">Paid Amount</p>
                  <p className="text-lg font-bold text-green-800">₹{(fee.paidAmount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-red-600">Due Amount</p>
                  <p className="text-lg font-bold text-red-800">₹{(fee.dueAmount || 0).toLocaleString()}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm text-yellow-600">Due Date</p>
                  <p className="text-lg font-bold text-yellow-800">{fee.dueDate}</p>
                  {fee.daysOverdue > 0 && (
                    <p className="text-xs text-red-600">{fee.daysOverdue} days overdue</p>
                  )}
                  <div className="mt-1">
                    <p className="text-xs text-blue-600">Next Due: {fee.upcomingDate}</p>
                    <p className="text-xs text-green-600">Amount: ₹{(fee.nextInstallmentAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleCollectFee(fee)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <HiCash className="w-4 h-4" />
                  <span>Collect Fee</span>
                </button>
                <button
                  onClick={() => handleSendReminder(fee)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                >
                  <HiBell className="w-4 h-4" />
                  <span>Send Reminder</span>
                </button>
                <button
                  onClick={() => {
                    import('../../utils/printUtils').then(({ printDueFeeNotice }) => {
                      printDueFeeNotice(fee, { name: fee.studentName, phone: fee.phone, class: fee.class });
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <HiPrinter className="w-4 h-4" />
                  <span>Print Notice</span>
                </button>
                {(fee.studentId?.phone || fee.phone) ? (
                  <a
                    href={`tel:${fee.studentId?.phone || fee.phone}`}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <HiPhone className="w-4 h-4" />
                    <span>Call Student</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center space-x-2"
                    title="Phone number not available"
                  >
                    <HiPhone className="w-4 h-4" />
                    <span>No Phone</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDueFees.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No due fees found</div>
        </div>
      )}
    </div>
  );
};

export default DueFees;