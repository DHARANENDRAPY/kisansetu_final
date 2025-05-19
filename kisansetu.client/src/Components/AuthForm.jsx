import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../Config/AuthContext";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaLock, FaUserCircle } from "react-icons/fa";

export default function AuthForm({ defaultRole, onAuthSuccess }) {
  const { login } = useContext(AuthContext);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const role = defaultRole;

  useEffect(() => {
    if (role === "admin") {
      setIsSignup(false); // Disable signup for admin
    }
  }, [role]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const endpoint = isSignup
        ? `https://localhost:7087/api/auth/register`
        : `https://localhost:7087/api/auth/login`;

      const payload = isSignup ? { email, password, role } : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if the user's role matches the expected role
        if (data.role !== role) {
          toast.error(`Access denied. This login portal is for ${role}s only.`);
          setIsLoading(false);
          return;
        }
        
        toast.success(isSignup ? "Account created successfully!" : "Login successful!");
        login(data.token, data.role);
        onAuthSuccess(data.role, isSignup || data.isNewUser);
        setIsSignup(false);
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return "👑";
      case 'farmer':
        return "🌱";
      case 'customer':
        return "🛒";
      default:
        return "👤";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-white text-2xl mb-2">
            {getRoleIcon()}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {isSignup ? "Sign up" : "Sign in"} as {role}
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleAuth} className="flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FaEnvelope />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full p-3 pl-10 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FaLock />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full p-3 pl-10 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 text-white font-medium rounded-lg ${
                isLoading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
              } transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </span>
              ) : (
                isSignup ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {role !== "admin" && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}