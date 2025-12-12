import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";

// Public Pages
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Ticket from "./pages/ticket/Ticket";
import Detail from "./pages/ticket/detail/Detail";
import Checkout from "./pages/ticket/detail/checkout/Checkout";
import Invoice from "./pages/ticket/invoice/Invoice";
import Payment from "./pages/ticket/payment/Payment";
import PaymentCallback from "./pages/ticket/payment/PaymentCallback";
import PaymentConfirmation from "./pages/ticket/payment/PaymentConfirmation";

// Policy Pages
import PrivacyPolicy from "./pages/policy/PrivacyPolicy";
import TermsConditions from "./pages/policy/TermsConditions";
import HelpSupport from "./pages/policy/HelpSupport";
import Faqs from "./pages/policy/Faqs";
import Contact from "./pages/contact/Contact";

// User Pages
import LogIn from "./pages/auth/login/LogIn";
import SignUp from "./pages/auth/signup/SignUp";
import EmailVerify from "./pages/auth/emailverification/EmailVerify";
import ResetPassword from "./pages/auth/resetpassword/ResetPassword";
import UserProtectedRoute from "./components/protectedroutes/userProtectedRoute/UserProtectedRoute";
import UserBookings from "./pages/user/bookings/UserBookings";
import Profile from "./pages/user/Profile";

// Live Tracking Pages
import LiveTracking from "./pages/tracking/LiveTracking";
import LiveTrackingVerify from "./pages/tracking/LiveTrackingVerify";

// Admin Pages
import AdminLogin from './pages/admin/auth/adminlogin/AdminLogin';
import AdminRegister from './pages/admin/auth/adminsignup/AdminSignUp';
import AdminDashboard from './pages/admin/admindashboard/AdminDashboard';
import AdminProtectedRoute from "./components/protectedroutes/adminprotectedroute/AdminProtectedRoute";

// Operator Pages
import OperatorLogin from './pages/operator/auth/operatorlogin/OperatorLogin';
import OperatorSignUp from './pages/operator/auth/operatorsignup/OperatorSignUp';
import OperatorDashboard from './pages/operator/operatordashboard/OperatorDashboard';
import OperatorProtectedRoute from "./components/protectedroutes/operatorProtectedRoute/OperatorProtectedRoute";
import OperatorResetPassword from "./pages/operator/auth/operatorresetpassword/OperatorResetPassword";
import OperatorAddBus from "./pages/operator/Bus/addbus/AddBus";
import OperatorManageBus from "./pages/operator/Bus/managebus/ManageBus";
import OperatorManageBusRoutes from "./pages/operator/Bus/manageroutes/ManageRoutes";
import OperatorManageBusSchedules from "./pages/operator/Bus/manageschedules/ManageSchedules";
import ManageBookings from "./pages/operator/Bus/managebookings/ManageBookings";
import OperatorLiveTracking from "./pages/operator/tracking/OperatorLiveTracking";
import OperatorProfile from "./pages/operator/profile/OperatorProfile";

const MainContent = () => {
  const location = useLocation();
  // Check if the current pathname starts with "/admin" or "/operator"
  const hideNavAndFooter =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/operator");

  return (
    <main className="w-full flex flex-col bg-neutral-50 min-h-screen">
      {/* Render Navbar only if not on admin/operator routes */}
      {!hideNavAndFooter && <Navbar />}

      {/* Routing */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/bus-tickets" element={<Ticket />} />

        {/* Policy Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<Faqs />} />

        {/* Live Tracking Routes */}
        <Route path="/live-tracking" element={<LiveTrackingVerify />} />
        <Route path="/live-tracking/:bookingId" element={<LiveTracking />} />

        {/* Protected Bus Ticket User Routes */}
        <Route element={<UserProtectedRoute />}>
          <Route path="/bus-tickets/detail/:busId" element={<Detail />} />
          <Route path="/bus-tickets/checkout" element={<Checkout />} />
          <Route path="/bus-tickets/payment-confirmation" element={<PaymentConfirmation />} />
          <Route path="/bus-tickets/payment" element={<Payment />} />
          <Route path="/bus-tickets/payment-callback" element={<PaymentCallback />} />
          <Route path="/bus-tickets/invoice" element={<Invoice />} />
          <Route path="/bookings" element={<UserBookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* User Auth Routes */}
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/operator-reset-password" element={<OperatorResetPassword />} />

        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/register" element={<AdminRegister />} />
        </Route>

        {/* Operator Routes */}
        <Route path="/operator" element={<OperatorLogin />} />
        <Route path="/operator/login" element={<OperatorLogin />} />
        <Route path="/operator/signup" element={<OperatorSignUp />} />

        {/* Protected Operator Routes */}
        <Route element={<OperatorProtectedRoute />}>
          <Route path="/operator/dashboard" element={<OperatorDashboard />} />
          <Route path="/operator/profile" element={<OperatorProfile />} />
          <Route path="/operator/add-bus" element={<OperatorAddBus />} />
          <Route path="/operator/buses" element={<OperatorManageBus />} />
          <Route path="/operator/bus-routes" element={<OperatorManageBusRoutes />} />
          <Route path="/operator/bus-schedules" element={<OperatorManageBusSchedules />} />
          <Route path="/operator/bookings" element={<ManageBookings />} />
          <Route path="/operator/live-tracking" element={<OperatorLiveTracking />} />
        </Route>
      </Routes>

      {/* Render Footer only if not on admin/operator routes */}
      {!hideNavAndFooter && <Footer />}
    </main>
  );
};

const App = () => {
  return (
    <Router>
      <MainContent />
    </Router>
  );
};

export default App;
