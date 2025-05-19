import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";
import { FaUser, FaPhone, FaRegEnvelope, FaImage } from "react-icons/fa";

export default function CustomerDetailsModal({ onClose, isEdit = false }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    lastName: "",
    phoneNumber: "",
    gmailId: "",
    profile: "",
    alternativeNumber: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Function to extract email from token
  const getEmailFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return "";

    try {
      const decoded = jwtDecode(token);
      return (
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || 
        decoded.email || 
        decoded.upn || 
        decoded.preferred_username || 
        ""
      );
    } catch (error) {
      console.error("Invalid token", error);
      return "";
    }
  };

  // Fetch customer details when component loads
  useEffect(() => {
    const email = getEmailFromToken();
    setFormData(prevState => ({
      ...prevState,
      gmailId: email
    }));
    
    if (email) {
      fetchCustomerDetails(email);
    }
  }, []);

  // Fetch customer details function
  const fetchCustomerDetails = async (email) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://localhost:7087/api/Customer/getCustomerByEmail?Email=${encodeURIComponent(email)}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update form data
        setFormData({
          id: data.id || "",
          name: data.name || "",
          lastName: data.lastName || "",
          phoneNumber: data.phoneNumber || "",
          alternativeNumber: data.alternativeNumber || "",
          gmailId: data.gmailId || email,
          profile: data.profile || ""
        });
        
        // Set preview image if profile exists
        if (data.profile) {
          setPreviewImage(data.profile);
        }
      } else if (response.status !== 404) {
        // Only show error if not a "not found" response (which is expected for new users)
        toast.error("Failed to fetch customer details");
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Something went wrong while loading your profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
  
    if (type === "file") {
      const file = e.target.files[0];
      if (file) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }
        
        // Preview image
        setPreviewImage(URL.createObjectURL(file));
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setFormData((prevState) => ({
            ...prevState,
            profile: reader.result,
          }));
          toast.success("Image uploaded successfully");
        };
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.lastName || !formData.phoneNumber) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving your details...");

    try {
      // Determine if we're creating or updating based on whether we have an ID
      const url = formData.id 
        ? `https://localhost:7087/api/Customer/updateCustomer?Id=${formData.id}`
        : "https://localhost:7087/api/Customer/postCustomerData";
      
      const method = formData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData),
      });

      toast.dismiss(loadingToast);
      
      if (response.ok) {
        toast.success(`Customer details ${formData.id ? "updated" : "saved"} successfully!`);
        setTimeout(() => {
          onClose();
          navigate("/products");
        }, 1500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${formData.id ? "update" : "save"} details`);
      }
    } catch (error) {
      console.error(`Error ${formData.id ? "updating" : "saving"} details:`, error);
      toast.error("Something went wrong. Please try again.");
      toast.dismiss(loadingToast);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 sm:p-5 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {formData.id ? "Update Customer Profile" : "Customer Profile Setup"}
              </h2>
              <p className="text-green-100 text-sm">
                {formData.id ? "Edit your profile information" : "Please complete your profile to continue"}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-green-200 focus:outline-none"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-300">Loading your details...</p>
            </div>
          </div>
        )}
        
        {/* Form - Scrollable content */}
        {!isLoading && (
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer ID (hidden) */}
              {formData.id && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer ID:</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formData.id}</span>
                  </div>
                </div>
              )}
              
              {/* Personal Information Section */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Personal Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                        <FaUser />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="First Name"
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Contact Information Section */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Contact Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Phone <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                        <FaPhone />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alternative Phone (Optional)</label>
                    <input
                      type="tel"
                      name="alternativeNumber"
                      value={formData.alternativeNumber}
                      onChange={handleChange}
                      placeholder="Alternative Phone"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Account & Profile Section */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Account & Profile</h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                        <FaRegEnvelope />
                      </div>
                      <input
                        type="email"
                        name="gmailId"
                        value={formData.gmailId}
                        readOnly
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Image</label>
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="flex-1 w-full">
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 h-32">
                          {previewImage ? (
                            <img 
                              src={previewImage} 
                              alt="Profile Preview" 
                              className="h-24 w-24 object-cover rounded-full border border-gray-300 dark:border-gray-500"
                            />
                          ) : (
                            <>
                              <FaImage className="text-3xl text-gray-400 dark:text-gray-500 mb-2" />
                              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                                Click to upload profile image
                                <br />
                                <span className="text-xs">SVG, PNG, JPG or GIF (Max 5MB)</span>
                              </p>
                            </>
                          )}
                          <input
                            type="file"
                            name="profile"
                            onChange={handleChange}
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons - Make sticky at bottom */}
              <div className="sticky bottom-0 pt-4 pb-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg text-white font-medium ${
                      isSubmitting
                        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                    } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : formData.id ? "Update Profile" : "Complete Profile"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}