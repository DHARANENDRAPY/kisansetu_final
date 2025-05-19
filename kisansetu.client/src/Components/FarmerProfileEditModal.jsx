import { useState, useEffect } from "react";

export default function FarmerProfileEditModal({ isOpen, onClose, farmerData, onSave }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    lastName: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    profile: "",
    gmailId: "",
    accountNumber: "",
    ifsc: "",
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (isOpen && farmerData) {
      setFormData({
        id: farmerData.id || "",
        name: farmerData.name || "",
        lastName: farmerData.lastName || "",
        mobileNumber: farmerData.mobileNumber || "",
        alternateMobileNumber: farmerData.alternateMobileNumber || "",
        profile: farmerData.profile || "",
        gmailId: farmerData.gmailId || "",
        accountNumber: farmerData.accountNumber || "",
        ifsc: farmerData.ifsc || "",
      });
      setPreviewImage(farmerData?.profile || "");
    }
  }, [isOpen, farmerData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({ ...formData, profile: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.id) {
      alert("Farmer ID is missing, update cannot proceed.");
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      alert("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Farmer Profile</h2>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Profile Image Preview */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
            <div className="flex items-center">
              <label className="block w-full">
                <span className="sr-only">Choose profile photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Readonly ID Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
            </div>

            {/* Name and Last Name - Two columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Mobile Numbers - Two columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile</label>
                <input
                  type="text"
                  name="alternateMobileNumber"
                  value={formData.alternateMobileNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email - Non-editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="gmailId"
                value={formData.gmailId}
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
            </div>

            {/* Banking Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifsc"
                value={formData.ifsc}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="border-t px-6 py-4 flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-md text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}