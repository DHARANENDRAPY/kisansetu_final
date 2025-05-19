import React, { useState, useEffect } from "react";
import axios from "axios";

const FarmerOrdersModal = ({ isOpen, onClose, farmerEmail }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, farmerEmail]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://localhost:7087/api/Order/GetFarmerOrders?email=${farmerEmail}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h3 className="text-xl md:text-2xl font-bold">Your Orders</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-4 text-gray-600">No orders found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.orderId} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <div className="p-4 md:p-5 bg-white">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900"># {order.orderId}</h4>
                        <p className="text-sm text-gray-600">Customer: {order.customerEmail}</p>
                        <p className="text-sm text-gray-600">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-2 md:mt-0 md:text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md 
                    ${order.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
                         order.deliveryStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                         order.deliveryStatus === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.deliveryStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                        {order.deliveryStatus || "Pending"}
                    </span>
                        <p className="mt-1 text-lg font-semibold text-gray-900">₹{order.totalAmount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 p-4 md:p-5">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Products</h5>
                    <ul className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <li key={item.productId} className="py-3 flex justify-between items-center">
                          <div className="flex items-center">
                            {item.productImage ? (
                              <img src={`data:image/jpeg;base64,${item.productImage}`} alt={item.productName} className="w-10 h-10 object-cover rounded-md mr-3" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-800">{item.productName}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-medium">₹{item.totalAmount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4 text-right">
          <button 
            onClick={onClose} 
            className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerOrdersModal;