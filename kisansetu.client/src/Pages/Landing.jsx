import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUserShield, FaShoppingBasket, FaBars, FaTimes, FaWhatsapp } from "react-icons/fa";
import { Leaf } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import CustomerDetailsModal from "../Components/CustomerDetailsModal";
import FarmerDetailsModal from "../Components/FarmerDetailsModal";
import AuthForm from "../Components/AuthForm";

function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [role, setRole] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Welcome to FarmFresh Market!");
    }, 1500);
  }, []);
  
  const handleAuthSuccess = (userRole, isNewUser) => {
    toast.loading("Processing your request...");
    
    setTimeout(() => {
      toast.dismiss();
      setShowAuth(false);
      setRole(null);
    
      if (isNewUser) {
        toast.success(`Welcome new ${userRole}! Please complete your profile.`);
        if (userRole === "customer") {
          setShowCustomerModal(true);
        } else if (userRole === "farmer") {
          setShowFarmerModal(true);
        }
      } else {
        toast.success(`Welcome back! Redirecting to your dashboard.`);
        if (userRole === "customer") {
          navigate("/products");
        } else if (userRole === "farmer") {
          navigate("/farmer");
        } else if (userRole === "admin") {
          navigate("/admin");
        }
      }
    }, 1000);
  };

  // Add this function to close the auth modal
  const handleCloseAuth = () => {
    setShowAuth(false);
    setRole(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openWhatsAppHelp = () => {
    window.open("https://wa.me/916363263063?text=Hello!%20Anyone%20available%20to%20help%20%3F%20", "_blank");
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading FarmFresh Market</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full md:h-screen overflow-hidden bg-gray-50">
      {/* Toast notifications */}
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
      
      {/* Background video with overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-opacity-50 z-10"></div>
        <video className="absolute top-0 left-0 w-full h-full object-cover overflow-hidden" autoPlay loop muted>
          <source src="/landing.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Header with logo and admin button */}
      <header className="relative z-20 flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Updated Logo Component */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center bg-white rounded-lg p-1 shadow-md">
            <div className="bg-green-600 rounded-md p-1 mr-2">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="pr-2">
              <span className="text-green-700 text-xl font-extrabold tracking-tight">KISAN</span>
              <span className="text-indigo-700 text-xl font-extrabold tracking-tight">SETU</span>
            </div>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="block sm:hidden text-white p-2"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
        
        {/* Desktop admin button */}
        <button 
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-900 transition"
          onClick={() => {
            setRole("admin");
            setShowAuth(true);
          }}
        >
          <FaUserShield className="text-xl" /> Admin Portal
        </button>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="relative z-30 sm:hidden bg-opacity-95 p-4 mt-2 mx-4 rounded-lg shadow-lg">
          <button 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition mb-2"
            onClick={() => {
              setRole("admin");
              setShowAuth(true);
              setMobileMenuOpen(false);
            }}
          >
            <FaUserShield className="text-xl" /> Admin Portal
          </button>
        </div>
      )}

      {!showAuth && (
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="text-center mb-8 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Connect Farm to Table
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 px-4">
              The marketplace where farmers and customers meet for the freshest produce
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-stretch">
            {/* Customer Card */}
            <div className="w-full md:w-2/5 bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-blue-600 h-2"></div>
              <div className="p-6 sm:p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FaShoppingBasket className="text-blue-600 text-xl" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">For Customers</h2>
                <p className="text-gray-600 mb-6 sm:mb-8">
                  Get farm-fresh vegetables delivered to your doorstep. Order now for the freshest picks from local farmers.
                </p>
                <button
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
                  onClick={() => { 
                    setRole("customer"); 
                    setShowAuth(true); 
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>

            {/* Farmer Card */}
            <div className="w-full md:w-2/5 bg-white rounded-2xl shadow-xl overflow-hidden mt-6 md:mt-0">
              <div className="bg-green-600 h-2"></div>
              <div className="p-6 sm:p-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="text-green-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">For Farmers</h2>
                <p className="text-gray-600 mb-6 sm:mb-8">
                  Sell your fresh vegetables online. Reach more customers and grow your business with our digital marketplace.
                </p>
                <button
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-green-700 transition"
                  onClick={() => { 
                    setRole("farmer"); 
                    setShowAuth(true); 
                  }}
                >
                  Start Selling
                </button>
              </div>
            </div>
          </div>
          
          {/* Help Button - Added WhatsApp Help Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={openWhatsAppHelp}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg transition-all"
            >
              <FaWhatsapp className="text-xl" /> Need Help? Chat with Us
            </button>
          </div>
          
          {/* Mobile footer - only visible on smaller screens */}
          <div className="mt-12 text-center text-white text-sm ">
            <p>© 2025 kisan setu</p>
            <p className="mt-1">Designed and Developed by <span className="text-green-500" > DIGITAL FARMERS</span></p>
          </div>
        </div>
      )}
       
      {/* Auth Form Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 mx-4 relative">
            {/* Close button for the modal */}
            <button 
              onClick={handleCloseAuth}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
              aria-label="Close form"
            >
              <FaTimes size={20} />
            </button>
            <AuthForm defaultRole={role} onAuthSuccess={handleAuthSuccess} />
            
            {/* Help button inside auth modal */}
            <div className="mt-4 text-center">
              <button
                onClick={openWhatsAppHelp}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <FaWhatsapp /> Having trouble? Get help
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <CustomerDetailsModal onClose={() => setShowCustomerModal(false)} />
            
            {/* Help button inside customer modal */}
            <div className="px-6 pb-6 text-center">
              <button
                onClick={openWhatsAppHelp}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <FaWhatsapp /> Need help? Chat with us
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Details Modal */}
      {showFarmerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <FarmerDetailsModal onClose={() => setShowFarmerModal(false)} />
            
            {/* Help button inside farmer modal */}
            <div className="px-6 pb-6 text-center">
              <button
                onClick={openWhatsAppHelp}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <FaWhatsapp /> Need help? Chat with us
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Fixed WhatsApp help button at bottom right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openWhatsAppHelp}
          className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all"
          aria-label="Get help via WhatsApp"
        >
          <FaWhatsapp className="text-2xl" />
        </button>
      </div>
    </div>
  );
}

export default Landing;