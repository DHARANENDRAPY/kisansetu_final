import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Config/AuthContext";

const AddProductModal = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [productData, setProductData] = useState({
    id: "",
    farmermail: user?.email || "",
    name: "",
    profile: "",
    normalPrice: "",
    productType: "",
    bulkPrice: "",
    soldIN: "",
    remainingStock: ""
  });

  useEffect(() => {
    if (user?.email) {
      setProductData((prevData) => ({ ...prevData, farmermail: user.email }));
    }
    
    // Prevent body scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setProductData((prevData) => ({ ...prevData, profile: reader.result }));
      };
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://localhost:7087/api/Product/postProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        console.log("Product added successfully!");
        onClose();
      } else {
        console.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-2 overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto transform transition-all my-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Add New Product</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form content - Make this scrollable */}
        <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {/* Farmer Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Email</label>
              <input 
                type="text" 
                name="farmermail" 
                value={productData.farmermail} 
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                readOnly 
              />
            </div>
            
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter product name" 
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                onChange={handleChange} 
              />
            </div>
            
            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-3 py-4 bg-white text-green-500 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span className="mt-1 text-xs text-gray-500">Select product image</span>
                  <input 
                    type="file" 
                    name="profile" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                </label>
              </div>
              {productData.profile && (
                <div className="mt-2 flex justify-center">
                  <img 
                    src={productData.profile} 
                    alt="Product preview" 
                    className="h-16 w-16 object-cover rounded-md" 
                  />
                </div>
              )}
            </div>
            
            {/* Two-column layout for price fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Normal Price</label>
                <input 
                  type="number" 
                  name="normalPrice" 
                  placeholder="0.00" 
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Price</label>
                <input 
                  type="number" 
                  name="bulkPrice" 
                  placeholder="0.00" 
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <select 
                name="productType" 
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                onChange={handleChange}
              >
                <option value="">Select Product Type</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Seeds">Seeds</option>
              </select>
            </div>
            
            {/* Two-column layout for unit and stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sold In</label>
                <select 
                  name="soldIN" 
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  onChange={handleChange}
                >
                  <option value="">Select Unit</option>
                  <option value="Kg">Kg</option>
                  <option value="Pieces">Pieces</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Stock</label>
                <input 
                  type="number" 
                  name="remainingStock" 
                  placeholder="0" 
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with action buttons */}
        <div className="border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row-reverse gap-2">
          <button 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" 
            onClick={handleSubmit}
          >
            Add Product
          </button>
          <button 
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" 
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;