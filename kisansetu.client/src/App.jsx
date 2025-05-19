import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Config/AuthContext";
import ProtectedRoute from "./Config/ProtectedRoute";
import Navbar from "./Components/Navbar";
import Product from "./Pages/Product";
import Landing from "./Pages/Landing";
import Cart from "./Pages/Cart";
import FarmerDetails from "./Pages/FarmerDetails";
import Customer from "./Pages/Customer";
import Unauthorized from "./Pages/Unauthorized";
import { useContext } from "react";
import { AuthContext } from "./Config/AuthContext";
import AdminDashboard from "./Pages/AdminDashboard ";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

function Layout() {
  const { user } = useContext(AuthContext);

  return (
    <>
   
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/farmer" element={<ProtectedRoute element={<FarmerDetails/>} allowedRoles={["farmer"]} />} />
        <Route path="/customerDetails" element={<ProtectedRoute element={<Customer/>} allowedRoles={["customer"]} />} />
        <Route path="/cart" element={<ProtectedRoute element={<Cart />} allowedRoles={["customer"]} />} />
        <Route path="/products" element={<ProtectedRoute element={<Product />} allowedRoles={["customer"]} />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard/>} allowedRoles={["admin"]} />}/>
        
      </Routes>
    </>
  );
}

export default App;
