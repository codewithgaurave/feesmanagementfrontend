import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import AdminLayout from "./layout/AdminLayout";
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Students
import AddStudent from "./pages/students/AddStudent";
import EditStudent from "./pages/students/EditStudents";
import ShowStudents from "./pages/students/ShowStudents";
import StudentDetails from "./pages/students/StudentDetails";
import StudentFeeDetails from "./pages/students/StudentFeeDetails";

// Fees
import AddFee from "./pages/Fees/AddFee";
import ShowFees from './pages/Fees/ShowFees';
import DueFees from './pages/Fees/DueFees';
import UpcomingFees from "./pages/Fees/UpcomingFees";
import FeeDetails from "./pages/Fees/FeeDetails";

import ChangePassword from "./pages/ChangePassword";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes - Redirect to dashboard if logged in */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Protected Routes - Require authentication */}
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Students */}
            <Route path="/students/add" element={<AddStudent />} />
            <Route path="/students/edit/:id" element={<EditStudent />} />
            <Route path="/students/show" element={<ShowStudents />} />
            <Route path="/students/details/:id" element={<StudentDetails />} />
            <Route path="/students/fees/:id" element={<StudentFeeDetails />} />

            {/* Fees */}
            <Route path="/fees/add" element={<AddFee />} />
            <Route path="/fees/show" element={<ShowFees />} />
            <Route path="/fees/due" element={<DueFees />} />
            <Route path="/fees/upcoming" element={<UpcomingFees />} />
            <Route path="/fees/details/:id" element={<FeeDetails />} />

            {/* Change Password */}
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;