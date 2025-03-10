import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import ProtectedRoute from "./components/ProtectedRoute";

// Import pages
import LoginPage from "./pages/guest/LoginPage.jsx";
import Blog from "./pages/guest/Blog.jsx";
import Forgotpassword from "./pages/guest/Forgotpassword.jsx";
import RegisterPage from "./pages/guest/RegisterPage.jsx";
import Quiz from "./pages/customer/Quiz.jsx";
import VerifyEmailPage from "./pages/guest/VerifyEmailPage.jsx";
import BlogDetail from "./pages/guest/BlogDetail.jsx";
import ServiceManagement from "./pages/manager/ServiceManagement.jsx";
import StaffManagement from "./pages/admin/StaffManagement.jsx";
import Dashboard from "./pages/manager/Dashboard.jsx";
import ConsultantManagement from "./pages/admin/ConsultantManagement.jsx";
import ResetPassword from "./pages/guest/ResetPassword.jsx";
import BlogManagement from "./pages/manager/BlogManagement.jsx";
import QuestionManagement from "./pages/manager/QuestionManagement.jsx";
import About from "./pages/guest/About.jsx";
import BookingPageCustomer from "./pages/customer/Booking.jsx";
import ConsultantGuest from "./pages/guest/Consultant.jsx";
import ConsultantCustomer from "./pages/customer/Consultantbooking.jsx";
import ServiceGuest from "./pages/guest/Services.jsx";
import Calendar from "./pages/customer/Calendar.jsx";
import ViewBooking from "./pages/staff/ViewBooking.jsx";
import ServiceDetails from "./pages/guest/ServiceDetails.jsx";
import ChangePassword from "./components/ChangePassword";
import CustomerProfile from "./pages/customer/CustomerProfile.jsx";
import SkincareBooking from "./pages/customer/Calendar.jsx";
import ViewBooked from "./pages/consultant/ViewBooked";
import ViewBookingHistory from "./pages/customer/BookingHistory.jsx";
import { PaySuccess } from "./pages/staff/PaySuccess";
import { PayFailed } from "./pages/staff/PayFailed";


axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

function App() {
  const userRole = localStorage.getItem("roleName") || sessionStorage.getItem("roleName"); // Get user role

  // Define default pages for each role
  const roleRoutes = {
    Guest: "/about",
    Customer: "/about",
    Manager: "/dashboard",
    Admin: "/staff-management",
    Staff: "/view-booking",
  };

  // Default page based on role
  const defaultPage = roleRoutes[userRole] || "/about";

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* Root path redirects based on role */}
        <Route path="/" element={<Navigate to={defaultPage} replace />} />

        {/* Public Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<VerifyEmailPage />} />

        {/* Guest & Customer Shared Pages */}
        <Route element={<ProtectedRoute allowedRoles={["Guest", "Customer"]} />}>
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/services" element={<ServiceGuest />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/consultant" element={<ConsultantGuest />} />
          <Route path="/quiz" element={<Quiz />} />
        </Route>

        {/* Customer Pages */}
        <Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
          <Route path="/booking" element={<BookingPageCustomer />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/consultant-customer" element={<ConsultantCustomer />} />
          <Route path="/services/:id/consultant-customer" element={<ConsultantCustomer />} />
          <Route path="/services/:id/consultant-customer/:idConsultant/calendar" element={<SkincareBooking />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/booking-history" element={<ViewBookingHistory />} />
        </Route>

        {/* Manager Pages */}
        <Route element={<ProtectedRoute allowedRoles={["Manager"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/service-management" element={<ServiceManagement />} />
          <Route path="/blog-management" element={<BlogManagement />} />
          <Route path="/question-management" element={<QuestionManagement />} />
        </Route>

        {/* Admin Pages */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/consultant-management" element={<ConsultantManagement />} />
        </Route>

        {/* Company Shared Pages */}
        <Route element={<ProtectedRoute allowedRoles={["Manager", "Admin", "Staff", "Consultant"]} />}>
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

        {/* Staff Pages */}
        <Route element={<ProtectedRoute allowedRoles={["Staff"]} />}>
          <Route path="/view-booking" element={<ViewBooking />} />
          <Route path="/pay-success" element={<PaySuccess />} />
          <Route path="/pay-failed" element={<PayFailed />} />
        </Route>


        <Route element={<ProtectedRoute allowedRoles={["Consultant"]} />}>
          <Route path="/view-booked" element={<ViewBooked />} />
        </Route>


        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to={defaultPage} replace />} />
      </Routes>
    </div>
  );
}

export default App;