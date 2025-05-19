import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-8 h-8 text-red-500" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 md:text-3xl">
          403 - Unauthorized
        </h1>
        
        <p className="text-center text-gray-600">
          You do not have permission to view this page.
        </p>
        
        <div className="pt-4">
          <Link 
            to="/" 
            className="block w-full px-4 py-2 text-center text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;