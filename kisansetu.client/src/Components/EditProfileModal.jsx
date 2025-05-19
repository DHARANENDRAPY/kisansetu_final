import { useState, useEffect } from "react";
import { FaUser, FaPhone, FaRegEnvelope, FaImage } from "react-icons/fa";

export default function EditProfileModal({ isOpen, onClose, customerData, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phoneNumber: "",
    gmailId: "",
    profile: "",
    alternativeNumber: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Set initial form data when customerData changes
  useEffect(() => {
    if (customerData) {
      setFormData({
        id: customerData.id || "",
        name: customerData.name || "",
        lastName: customerData.lastName || "",
        phoneNumber: customerData.phoneNumber || "",
        alternativeNumber: customerData.alternativeNumber || "",
        gmailId: customerData.gmailId || "",
        profile: customerData.profile || ""
      });
      
      // Set preview image if profile exists
      if (customerData.profile) {
        setPreviewImage(customerData.profile);
      }
    }
  }, [customerData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
  
    if (type === "file") {
      const file = e.target.files[0];
      if (file) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("Image size should be less than 5MB");
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
      alert("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Call the onSave function passed from parent
      await onSave(formData);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 sm:p-5 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Profile</h2>
              <p className="text-blue-100 text-sm">Update your personal information</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 focus:outline-none"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Form - Scrollable content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer ID (hidden) */}
            {formData.id && (
              <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Customer ID:</span>
                  <span className="text-sm text-gray-700">{formData.id}</span>
                </div>
              </div>
            )}
            
            {/* Personal Information Section */}
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>
            
            {/* Contact Information Section */}
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Contact Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <FaPhone />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Phone (Optional)</label>
                  <input
                    type="tel"
                    name="alternativeNumber"
                    value={formData.alternativeNumber}
                    onChange={handleChange}
                    placeholder="Alternative Phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>
            
            {/* Account Information */}
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Account Information</h3>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FaRegEnvelope />
                  </div>
                  <input
                    type="email"
                    name="gmailId"
                    value={formData.gmailId}
                    readOnly
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            
            {/* Profile Image Section */}
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Profile Image</h3>
              
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 w-full">
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 h-32">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile Preview" 
                        className="h-24 w-24 object-cover rounded-full border border-gray-300"
                      />
                    ) : (
                      <>
                        <FaImage className="text-3xl text-gray-400 mb-2" />
                        <p className="text-sm text-center text-gray-500">
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
            
            {/* Action buttons */}
            <div className="pt-4 pb-2 border-t border-gray-200">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg text-white font-medium ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}