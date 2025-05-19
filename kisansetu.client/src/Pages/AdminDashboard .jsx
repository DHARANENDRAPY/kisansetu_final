
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("customers");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCustomers(),
          fetchFarmers(),
          fetchOrders()
        ]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("https://localhost:7087/api/Customer/getCustomer");
      setCustomers(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch customers:", error);
    }
  };

  const fetchFarmers = async () => {
    try {
      const res = await axios.get("https://localhost:7087/api/Farmer/getFarmerData");
      setFarmers(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch farmers:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://localhost:7087/api/Order/GetAllOrders");
      setOrders(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch orders:", error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      await axios.post("https://localhost:7087/api/Order/UpdateOrderStatus", {
        orderId: orderId,
        status: newStatus
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.orderId === orderId 
          ? { ...order, deliveryStatus: newStatus } 
          : order
      ));
      
      // Show success notification (you can implement a toast notification system)
      alert(`Order #${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("❌ Failed to update order status:", error);
      alert("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleLogout = () => {
    // Here you would implement your logout logic
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminSession");
    
    // Redirect to login page
    window.location.href = "/";
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm) || 
    customer.lastName?.toLowerCase().includes(searchTerm) ||
    customer.gmailId?.toLowerCase().includes(searchTerm) ||
    customer.phoneNumber?.includes(searchTerm)
  );

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name?.toLowerCase().includes(searchTerm) || 
    farmer.lastName?.toLowerCase().includes(searchTerm) ||
    farmer.gmailId?.toLowerCase().includes(searchTerm) ||
    farmer.mobileNumber?.includes(searchTerm)
  );

  const filteredOrders = orders.filter(order =>
    order.orderId?.toString().toLowerCase().includes(searchTerm) ||
    order.customerEmail?.toLowerCase().includes(searchTerm) ||
    order.totalAmount?.toString().includes(searchTerm) ||
    order.deliveryStatus?.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
            >
              <LogoutIcon className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Total Customers" 
            value={customers.length} 
            color="bg-blue-500"
            onClick={() => setActiveTab("customers")}
          />
          <DashboardCard 
            title="Total Farmers" 
            value={farmers.length} 
            color="bg-green-500"
            onClick={() => setActiveTab("farmers")}
          />
          <DashboardCard 
            title="Total Orders" 
            value={orders.length} 
            color="bg-orange-500"
            onClick={() => setActiveTab("orders")}
          />
        </div>

        {/* Search & Tab Navigation */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="tabs flex space-x-2 overflow-x-auto w-full sm:w-auto pb-2">
            <TabButton 
              active={activeTab === "customers"} 
              onClick={() => setActiveTab("customers")}
              label="Customers"
            />
            <TabButton 
              active={activeTab === "farmers"} 
              onClick={() => setActiveTab("farmers")}
              label="Farmers"
            />
            <TabButton 
              active={activeTab === "orders"} 
              onClick={() => setActiveTab("orders")}
              label="Orders"
            />
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : activeTab === "customers" ? (
            <CustomerTable customers={filteredCustomers} />
          ) : activeTab === "farmers" ? (
            <FarmerTable farmers={filteredFarmers} />
          ) : (
            <OrderTable 
              orders={filteredOrders} 
              updateOrderStatus={updateOrderStatus}
              isUpdating={isUpdating}
            />
          )}
        </div>
      </main>
    </div>
  );
};

// Simple logout icon component
const LogoutIcon = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={`h-5 w-5 ${className}`} 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path 
      fillRule="evenodd" 
      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm1 4a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1z" 
      clipRule="evenodd" 
    />
    <path 
      d="M13 7a1 1 0 100 2h3a1 1 0 100-2h-3z" 
    />
  </svg>
);

const DashboardCard = ({ title, value, color, onClick }) => (
  <div 
    className={`${color} text-white rounded-lg shadow p-6 cursor-pointer transition duration-200 hover:opacity-90`}
    onClick={onClick}
  >
    <h2 className="text-lg font-medium">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button
    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
      active 
        ? "bg-blue-600 text-white" 
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Customer responsive card for mobile view
const CustomerCard = ({ customer }) => (
  <div className="bg-white p-4 rounded-lg shadow mb-4 border-l-4 border-blue-500">
    <div className="flex items-center mb-3">
      <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
        <img 
          src={customer.profile || "/api/placeholder/48/48"} 
          alt="Profile" 
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/api/placeholder/48/48";
          }}
        />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{customer.name} {customer.lastName}</h3>
        <p className="text-sm text-gray-500">ID: {customer.id}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-2">
      <InfoRow label="Phone" value={customer.phoneNumber} />
      <InfoRow label="Email" value={customer.gmailId} />
      <InfoRow label="Alt. Number" value={customer.alternativeNumber || "N/A"} />
    </div>
  </div>
);

// Farmer responsive card for mobile view
const FarmerCard = ({ farmer }) => (
  <div className="bg-white p-4 rounded-lg shadow mb-4 border-l-4 border-green-500">
    <div className="flex items-center mb-3">
      <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
        <img 
          src={farmer.profile || "/api/placeholder/48/48"} 
          alt="Profile" 
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/api/placeholder/48/48";
          }}
        />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{farmer.name} {farmer.lastName}</h3>
        <p className="text-sm text-gray-500">ID: {farmer.id}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-2">
      <InfoRow label="Mobile" value={farmer.mobileNumber} />
      <InfoRow label="Email" value={farmer.gmailId} />
      <InfoRow label="Account" value={farmer.accountNumber} />
      <InfoRow label="IFSC" value={farmer.ifsc} />
      <InfoRow label="UPI" value={farmer.upi || "N/A"} />
    </div>
  </div>
);

// Order responsive card for mobile view
const OrderCard = ({ order, updateOrderStatus, isUpdating }) => (
  <div className="bg-white p-4 rounded-lg shadow mb-4 border-l-4 border-orange-500">
    <div className="flex justify-between items-center mb-3">
      <div>
        <h3 className="font-medium text-gray-900">Order #{order.orderId}</h3>
        <p className="text-sm text-gray-500">Customer: {order.customerEmail}</p>
      </div>
      <StatusBadge status={order.deliveryStatus} />
    </div>
    <div className="grid grid-cols-1 gap-2 mb-4">
      <InfoRow label="Amount" value={`₹${order.totalAmount?.toFixed(2)}`} />
      <InfoRow label="Date" value={new Date(order.orderDate).toLocaleDateString()} />
    </div>
    <div className="mt-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Update Status:</label>
      <div className="flex space-x-2">
        <StatusButton 
          status="Processing" 
          currentStatus={order.deliveryStatus} 
          onClick={() => updateOrderStatus(order.orderId, "Processing")}
          disabled={isUpdating}
        />
        <StatusButton 
          status="Shipped" 
          currentStatus={order.deliveryStatus} 
          onClick={() => updateOrderStatus(order.orderId, "Shipped")}
          disabled={isUpdating}
        />
        <StatusButton 
          status="Delivered" 
          currentStatus={order.deliveryStatus} 
          onClick={() => updateOrderStatus(order.orderId, "Delivered")}
          disabled={isUpdating}
        />
        <StatusButton 
          status="Cancelled" 
          currentStatus={order.deliveryStatus} 
          onClick={() => updateOrderStatus(order.orderId, "Cancelled")}
          disabled={isUpdating}
        />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100 text-gray-800";
  
  if (status?.toLowerCase() === "delivered") {
    bgColor = "bg-green-100 text-green-800";
  } else if (status?.toLowerCase() === "processing") {
    bgColor = "bg-blue-100 text-blue-800";
  } else if (status?.toLowerCase() === "shipped") {
    bgColor = "bg-purple-100 text-purple-800";
  } else if (status?.toLowerCase() === "cancelled") {
    bgColor = "bg-red-100 text-red-800";
  } else if (status?.toLowerCase() === "pending") {
    bgColor = "bg-yellow-100 text-yellow-800";
  }
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${bgColor}`}>
      {status}
    </span>
  );
};

const StatusButton = ({ status, currentStatus, onClick, disabled }) => {
  const isActive = status.toLowerCase() === currentStatus?.toLowerCase();
  let buttonClass = "px-2 py-1 text-xs rounded border ";
  
  if (isActive) {
    switch (status.toLowerCase()) {
      case "delivered":
        buttonClass += "bg-green-500 text-white border-green-500";
        break;
      case "processing":
        buttonClass += "bg-blue-500 text-white border-blue-500";
        break;
      case "shipped":
        buttonClass += "bg-purple-500 text-white border-purple-500";
        break;
      case "cancelled":
        buttonClass += "bg-red-500 text-white border-red-500";
        break;
      default:
        buttonClass += "bg-gray-500 text-white border-gray-500";
    }
  } else {
    switch (status.toLowerCase()) {
      case "delivered":
        buttonClass += "border-green-500 text-green-500 hover:bg-green-50";
        break;
      case "processing":
        buttonClass += "border-blue-500 text-blue-500 hover:bg-blue-50";
        break;
      case "shipped":
        buttonClass += "border-purple-500 text-purple-500 hover:bg-purple-50";
        break;
      case "cancelled":
        buttonClass += "border-red-500 text-red-500 hover:bg-red-50";
        break;
      default:
        buttonClass += "border-gray-500 text-gray-500 hover:bg-gray-50";
    }
  }
  
  return (
    <button
      className={`${buttonClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled || isActive}
    >
      {status}
    </button>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-sm text-gray-500">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

const CustomerTable = ({ customers }) => (
  <>
    {/* Mobile view - Cards */}
    <div className="md:hidden p-4 space-y-4">
      {customers.length > 0 ? (
        customers.map(customer => (
          <CustomerCard key={`mobile-${customer.id}`} customer={customer} />
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">No customers found</div>
      )}
    </div>

    {/* Desktop view - Table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <TableHeader>ID</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Phone</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Alt. Number</TableHeader>
            <TableHeader>Profile</TableHeader>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.length > 0 ? (
            customers.map((customer) => (
              <tr key={customer.id}>
                <TableCell>{customer.id}</TableCell>
                <TableCell>
                  {customer.name} {customer.lastName}
                </TableCell>
                <TableCell>{customer.phoneNumber}</TableCell>
                <TableCell>{customer.gmailId}</TableCell>
                <TableCell>{customer.alternativeNumber || "N/A"}</TableCell>
                <TableCell>
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img 
                      src={customer.profile || "/api/placeholder/40/40"} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/40/40";
                      }}
                    />
                  </div>
                </TableCell>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                No customers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
);

const FarmerTable = ({ farmers }) => (
  <>
    {/* Mobile view - Cards */}
    <div className="md:hidden p-4 space-y-4">
      {farmers.length > 0 ? (
        farmers.map(farmer => (
          <FarmerCard key={`mobile-${farmer.id}`} farmer={farmer} />
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">No farmers found</div>
      )}
    </div>

    {/* Desktop view - Table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <TableHeader>ID</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Mobile</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Account</TableHeader>
            <TableHeader>IFSC</TableHeader>
            <TableHeader>UPI</TableHeader>
            <TableHeader>Profile</TableHeader>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {farmers.length > 0 ? (
            farmers.map((farmer) => (
              <tr key={farmer.id}>
                <TableCell>{farmer.id}</TableCell>
                <TableCell>
                  {farmer.name} {farmer.lastName}
                </TableCell>
                <TableCell>{farmer.mobileNumber}</TableCell>
                <TableCell>{farmer.gmailId}</TableCell>
                <TableCell>{farmer.accountNumber}</TableCell>
                <TableCell>{farmer.ifsc}</TableCell>
                <TableCell>{farmer.upi || "N/A"}</TableCell>
                <TableCell>
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img 
                      src={farmer.profile || "/api/placeholder/40/40"} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/40/40";
                      }}
                    />
                  </div>
                </TableCell>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                No farmers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
);

const OrderTable = ({ orders, updateOrderStatus, isUpdating }) => (
  <>
    {/* Mobile view - Cards */}
    <div className="md:hidden p-4 space-y-4">
      {orders.length > 0 ? (
        orders.map(order => (
          <OrderCard 
            key={`mobile-${order.orderId}`} 
            order={order} 
            updateOrderStatus={updateOrderStatus}
            isUpdating={isUpdating}
          />
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">No orders found</div>
      )}
    </div>

    {/* Desktop view - Table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.orderId}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{order.customerEmail}</TableCell>
                <TableCell>₹{order.totalAmount?.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(order.orderDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.deliveryStatus} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <select
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={order.deliveryStatus}
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      disabled={isUpdating}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </TableCell>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
);

// Reusable components
const TableHeader = ({ children }) => (
  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
    {children}
  </td>
);

export default AdminDashboard;