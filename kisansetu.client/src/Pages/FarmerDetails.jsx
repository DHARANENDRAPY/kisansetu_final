import React, { useState, useEffect, useContext } from "react";
import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import FarmerProfileEditModal from "../Components/FarmerProfileEditModal";
import AddProductModal from "../Components/AddProductModal";
import { AuthContext } from "../Config/AuthContext";
import YourProductsModal from "../Components/YourProductsModal";
import FarmerOrdersModal from "../Components/FarmerOrdersModal";



const FarmerDetails = () => {
  const { user } = useContext(AuthContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [farmerData, setFarmerData] = useState(null);
  const [isProductsModalOpen, setProductsModalOpen] = useState(false);
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [isOrdersModalOpen, setOrdersModalOpen] = useState(false);

  
  useEffect(() => {
    if (!user?.email) return;
    
    axios
      .get(`https://localhost:7087/api/Farmer/getFarmerByEmail?email=${user.email}`, {
        headers: { Authorization: `Bearer ${user.token}`},
      })
      .then((response) => {
        setFarmerData(response.data[0]);
      })
      .catch((error) => {
        console.error("Error fetching farmer data:", error);
      });
  }, [user]);

  const handleAddProduct = (newProduct) => {
    console.log("New Product Added:", newProduct);
    setAddProductModalOpen(false);
  };

  const handleSave = (updatedData) => {
    if (!farmerData?.id) {
      alert("Farmer ID not found. Cannot update profile.");
      return;
    }

    axios.put(`https://localhost:7087/api/Farmer/updateFarmer?Id=${farmerData.id}`, updatedData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    })
    .then((response) => {
      alert("Profile updated successfully!");
      setFarmerData((prevData) => ({
        ...prevData,
        ...updatedData,
      }));
      setModalOpen(false);
    })
    .catch((error) => {
      console.error("Error updating profile:", error.response?.data || error.message);
      alert("Failed to update profile.");
    });
  };

  if (!farmerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-lg font-medium text-green-800">Loading...</div>
      </div>
    );
  }
// At the beginning of your component, add:
console.log('Current user role:', user?.role);
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar/Profile Section */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Profile Header */}
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-20 w-20 bg-green-50 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                      <img 
                        src={farmerData.profile || "/default-profile.png"} 
                        alt="Farmer" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-center sm:items-start">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {farmerData.name} {farmerData.lastName}
                      </h2>
                      <p className="text-gray-500 text-sm">{farmerData.gmailId}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Farmer Details */}
                <div className="p-4 md:p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Farmer Details</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID</span>
                      <span className="font-medium text-gray-800">{farmerData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-gray-800">{farmerData.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Alternate</span>
                      <span className="font-medium text-gray-800">{farmerData.alternateMobileNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account No.</span>
                      <span className="font-medium text-gray-800">{farmerData.accountNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">IFSC</span>
                      <span className="font-medium text-gray-800">{farmerData.ifsc || 'N/A'}</span>
                    </div>
                  </div>

                  <Link to="/">
                    <button className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg shadow-sm transition-colors">
                      Log Out
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 h-full">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard</h2>
                  <p className="text-gray-600 mb-6">Manage your products and orders</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setProductsModalOpen(true)}
                      className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                    >
                      <span className="text-2xl mb-2">📦</span>
                      <span className="font-medium">Your Products</span>
                    </button>
                    
                    <button 
                      onClick={() => setAddProductModalOpen(true)}
                      className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors"
                    >
                      <span className="text-2xl mb-2">➕</span>
                      <span className="font-medium">Add Products</span>
                    </button>
                    
                    <button 
  onClick={() => setOrdersModalOpen(true)}
  className="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-xl transition-colors"
>
  <span className="text-2xl mb-2">🛒</span>
  <span className="font-medium">Your Orders</span>
</button>

                  </div>
                </div>
                
                {/* Additional content can go here */}
                {/* <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
                  <div className="text-gray-500 text-center py-8">
                    No recent activity to display
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FarmerProfileEditModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        farmerData={farmerData}  
        onSave={handleSave}
      />

      <AddProductModal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setAddProductModalOpen(false)} 
        onSave={handleAddProduct} 
      />

      <YourProductsModal 
        isOpen={isProductsModalOpen} 
        onClose={() => setProductsModalOpen(false)} 
      />
      <FarmerOrdersModal 
  isOpen={isOrdersModalOpen} 
  onClose={() => setOrdersModalOpen(false)} 
  farmerEmail={user?.email}
  token={user?.token}
/>

    </div>
  );
};

export default FarmerDetails;