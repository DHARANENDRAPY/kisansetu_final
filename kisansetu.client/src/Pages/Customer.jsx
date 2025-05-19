import React, { useState, useEffect, useContext } from "react";
import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";
import axios from "axios";
import EditProfileModal from "../Components/EditProfileModal";
import { AuthContext } from "../Config/AuthContext";

const Customer = () => {
    const { user } = useContext(AuthContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [showOrders, setShowOrders] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;
    
        setIsLoading(true);
        axios.get(`https://localhost:7087/api/Customer/getCustomerByEmail?email=${user.email}`, {
            headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((response) => {
            if (response.data && response.data.id) {
                setCustomerData(response.data);
            } else {
                console.error("Customer ID not found in API response.");
            }
        })
        .catch((error) => {
            console.error("Error fetching customer data:", error);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, [user]);

    const fetchOrders = async () => {
        if (!user?.email) {
            console.warn("❌ User email missing. Skipping order fetch.");
            return;
        }
    
        setIsLoading(true);
        try {
            const response = await axios.get(
                `https://localhost:7087/api/Order/GetCustomerOrders?email=${user.email}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );
            
            console.log("✅ API Response:", response.data);
            setOrders(response.data);
            setShowOrders(true);
        } catch (error) {
            console.error("❌ Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = (updatedData) => {
        if (!customerData?.id) {
            alert("Customer ID not found. Cannot update profile.");
            return;
        }

        setIsLoading(true);
        axios.put(
            `https://localhost:7087/api/Customer/updateCustomer?id=${customerData.id}`, 
            updatedData, 
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            }
        )
        .then(() => {
            alert("Profile updated successfully!");
            setCustomerData((prevData) => ({
                ...prevData,
                ...updatedData,
            }));
            setModalOpen(false);
        })
        .catch((error) => {
            console.error("Error updating profile:", error.response?.data || error.message);
            alert("Failed to update profile.");
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    if (isLoading && !customerData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    // Add this component to your Customer.jsx file


    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="h-24 w-24 bg-blue-50 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                                        <img 
                                            src={customerData?.profile || "/default-profile.png"} 
                                            alt="Customer" 
                                            className="h-full w-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex flex-col items-center sm:items-start">
                                        <h2 className="text-xl font-semibold">{customerData?.name} {customerData?.lastName}</h2>
                                        <button
                                            onClick={() => setModalOpen(true)}
                                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Contact Information</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-gray-700">{customerData?.gmailId}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span className="text-gray-700">{customerData?.phoneNumber || "Not provided"}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <Link to="/">
                                    <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                                        Log Out
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Orders Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">Your Orders</h2>
                                    <button 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        onClick={fetchOrders}
                                    >
                                        {showOrders ? "Refresh Orders" : "Load Orders"}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                {isLoading && (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full mx-auto mb-3"></div>
                                        <p className="text-gray-600">Loading orders...</p>
                                    </div>
                                )}
                                
                                {!isLoading && showOrders && (
                                    <div className="space-y-6">
                                        {orders.length === 0 ? (
                                            <div className="text-center py-12">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                <p className="text-gray-500 text-lg">No orders found.</p>
                                                <p className="text-gray-400 text-sm">Your order history will appear here once you make a purchase.</p>
                                            </div>
                                        ) : (
                                            orders.map((order) => (
                                                <div key={order.orderId} className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                                                  {/* Existing order header code ... */}
                                                    <div className="bg-gray-50 px-6 py-4">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-medium">Order #{order.orderId}</h3>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(order.orderDate).toLocaleDateString(undefined, { 
                                                                        year: 'numeric', 
                                                                        month: 'long', 
                                                                        day: 'numeric' 
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <div className="mt-2 sm:mt-0">
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
      ${
        order.deliveryStatus === 'Delivered'
          ? 'bg-green-100 text-green-800'
          : order.deliveryStatus === 'Processing'
          ? 'bg-blue-100 text-blue-800'
          : order.deliveryStatus === 'Shipped'
          ? 'bg-purple-100 text-purple-800'
          : order.deliveryStatus === 'Cancelled'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800'
      }`}
  >
    {order.deliveryStatus}
  </span>
</div>

                                                        </div>
                                                    </div>
                                                    
                                                    <div className="divide-y divide-gray-100">
                                                        {order.items?.map((item) => (
                                                            <div key={item.productId} className="flex flex-col sm:flex-row gap-4 p-4">
                                                                <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden shadow-sm flex-shrink-0">
                                                                    <img 
                                                                        src={item.productImage 
                                                                            ? `data:image/jpeg;base64,${item.productImage}` 
                                                                            : "/default-product.png"
                                                                        }
                                                                        alt={item.productName}
                                                                        className="h-full w-full object-cover" 
                                                                    />
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <h4 className="font-medium">{item.productName}</h4>
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                                        <p className="text-sm font-medium">₹{item.totalAmount}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">Total Amount</span>
                                                        <span className="text-lg font-medium">₹{order.totalAmount}</span>
                                                    </div>
                                                  
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                
                                {!showOrders && !isLoading && (
                                    <div className="text-center py-12">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">Click "Load Orders" to view your order history</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                customerData={customerData}
                onSave={handleSave}
            />
        </div>
    );
};

export default Customer;