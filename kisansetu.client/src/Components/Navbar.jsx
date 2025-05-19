import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Config/AuthContext";
import { 
  Home, 
  ShoppingCart, 
  User, 
  LayoutDashboard, 
  Menu, 
  X,
  Leaf,
  MessageCircle 
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useContext(AuthContext); // Get the actual user from context
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="relative z-20">
      {/* Main Navbar */}
      <div className="w-full bg-gradient-to-r from-green-700 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {user && user.role === "customer" && (
                <>
                  <Link to="/products" className="flex items-center text-white hover:text-green-200 transition-colors">
                    <Home className="h-5 w-5" />
                    <span className="ml-2 font-medium">Home</span>
                  </Link>
                  <Link to="/cart" className="flex items-center text-white hover:text-green-200 transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="ml-2 font-medium">Cart</span>
                  </Link>
                  <Link to="/customerDetails" className="flex items-center text-white hover:text-green-200 transition-colors">
                    <User className="h-5 w-5" />
                    <span className="ml-2 font-medium">Profile</span>
                  </Link>
                </>
              )}

              {user && user.role === "farmer" && (
                <>
                  <Link to="/farmer" className="flex items-center text-white hover:text-green-200 transition-colors">
                    <User className="h-5 w-5" />
                    <span className="ml-2 font-medium">Profile</span>
                  </Link>
                </>
              )}

              {user && user.role === "admin" && (
                <>
                  <Link to="/admin" className="flex items-center text-white hover:text-green-200 transition-colors">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="ml-2 font-medium">Dashboard</span>
                  </Link>
                </>
              )}
              
              {/* WhatsApp Support Link */}
              <a 
                href="https://wa.me/916363263063?text=Hello!%20Anyone%20available%20to%20help%20%3F%20" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-white hover:text-green-200 transition-colors"
              >
                <div className="bg-green-500 rounded-full p-1">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 font-medium">Support</span>
              </a>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white p-2 focus:outline-none rounded-full hover:bg-indigo-800 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? 
                <X className="h-6 w-6" /> : 
                <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-indigo-800 shadow-lg absolute w-full">
          <div className="container mx-auto py-2">
            <div className="flex flex-col">
              {user && user.role === "customer" && (
                <>
                  <Link 
                    to="/products" 
                    className="flex items-center text-white hover:bg-indigo-900 transition-colors p-4"
                    onClick={toggleMobileMenu}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    <span className="font-medium">Home</span>
                  </Link>
                  <Link 
                    to="/cart" 
                    className="flex items-center text-white hover:bg-indigo-900 transition-colors p-4"
                    onClick={toggleMobileMenu}
                  >
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    <span className="font-medium">Cart</span>
                  </Link>
                  <Link 
                    to="/customerDetails" 
                    className="flex items-center text-white hover:bg-indigo-900 transition-colors p-4"
                    onClick={toggleMobileMenu}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span className="font-medium">Profile</span>
                  </Link>
                </>
              )}

              {user && user.role === "farmer" && (
                <>
                  <Link 
                    to="/farmer" 
                    className="flex items-center text-white hover:bg-indigo-900 transition-colors p-4"
                    onClick={toggleMobileMenu}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span className="font-medium">Profile</span>
                  </Link>
                </>
              )}

              {user && user.role === "admin" && (
                <>
                  <Link 
                    to="/admin" 
                    className="flex items-center text-white hover:bg-indigo-900 transition-colors p-4"
                    onClick={toggleMobileMenu}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-3" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </>
              )}
              
              {/* WhatsApp Support Link in Mobile Menu */}
              <a 
                href="https://wa.me/916363263063?text=Hello!%20Anyone%20available%20to%20help%20%3F%20" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-white hover:bg-indigo-900 transition-colors p-4"
                onClick={toggleMobileMenu}
              >
                <div className="bg-green-500 rounded-full p-1 mr-2">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">Support</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}