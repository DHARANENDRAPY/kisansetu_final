import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../Config/AuthContext";
import { useNavigate } from "react-router-dom"; // Add this import
import Navbar from "../Components/Navbar";
import CartItem from "../Components/CartItem";
import { toast } from "react-toastify"; // Add this import

export default function Cart() {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [processingPayment, setProcessingPayment] = useState(false);
    const navigate = useNavigate(); // Initialize navigate
    

    const fetchCartItems = async () => {
        if (!user?.email) {
            console.warn("User email missing. Skipping cart fetch.");
            setLoading(false);
            return;
        }
    
        const apiUrl = `https://localhost:7087/api/Cart/GetCartbyMail?Mail=${user.email}`;
        
        try {
            setLoading(true);
            const response = await axios.get(apiUrl);
            setCartItems(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to load cart items:", err);
            setError("Failed to load cart items. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, [user?.email]);

    useEffect(() => {
        calculateTotalPrice();
    }, [cartItems]);

    const calculateTotalPrice = () => {
        const newTotalPrice = cartItems.reduce((acc, item) => acc + item.totalAmount, 0);
        setTotalPrice(newTotalPrice);
    };

    const handleRemoveItem = async (productId) => {
        setError(""); // Clear previous error
    
        try {
            // Make the API call 
            await axios.delete(
                `https://localhost:7087/api/Cart/DeleteCartByProductId`,
                { params: { productId } }
            );
    
            // Update local state immediately on success
            setCartItems(currentItems =>
                currentItems.filter(item => item.productId !== productId)
            );
        } catch (err) {
            console.error("Failed to remove item from cart:", err);
            setError("Failed to remove item. Please try again.");
        }
    };

    
    const handleItemUpdate = async (productId, newTotalAmount, newQuantity) => {
        setError(""); // Clear previous error
        
        // Update the item in the local state first
        setCartItems((currentItems) => 
            currentItems.map((item) =>
                item.productId === productId ? { 
                    ...item, 
                    totalAmount: newTotalAmount,
                    noOfItems: newQuantity 
                } : item
            )
        );
    
        // Find the updated item to send to API
        const updatedItem = cartItems.find(item => item.productId === productId);
        if (updatedItem) {
            // Call the API to update the cart item
            await updateCartItem(updatedItem, newTotalAmount, newQuantity);
        }
    };
    
    

    const updateCartItem = async (item) => {
        try {
            const response = await axios.put(
                `https://localhost:7087/api/Cart/UpdateCart?ID=${item.id}`,
                {
                    id: item.id,
                    productId: item.productId,
                    noOfItems: item.noOfItems,
                    customerMail: user.email,
                    totalAmount: item.totalAmount
                }
            );
            console.log("Cart item updated:", response.data);
        } catch (err) {
            console.error("Failed to update cart item:", err);
            // If update fails, refresh cart to get current state
            fetchCartItems();
        }
    };

    const handleCheckout = async () => {
        if (!user?.email) {
            alert("User not logged in. Please log in to continue.");
            return;
        }
    
        setProcessingPayment(true);
    
        const orderDetails = {
            customerEmail: user.email,
            totalAmount: totalPrice,
            cartItems: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.noOfItems,
                totalAmount: item.totalAmount
            })),
        };
    
        try {
            // Log request before making the API call
            console.log("🚀 Sending to backend:", orderDetails);
    
            const response = await axios.post('https://localhost:7087/api/Order/InitiatePayment', orderDetails);
            const { order_id, amount, currency } = response.data;
    
            const options = {
                key: "rzp_test_oDRdyrqNCDM1W4",
                amount: amount,
                currency: currency,
                order_id: order_id,
                name: "Kisan_Setux",
                description: "Order Payment",
                handler: async function(paymentResponse) {
                    try {
                        // Step 2: Verify payment and create order
                        const verificationData = {
                            RazorpayPaymentId: paymentResponse.razorpay_payment_id,
                            RazorpayOrderId: paymentResponse.razorpay_order_id,
                            RazorpaySignature: paymentResponse.razorpay_signature,
                            Email: user.email,
                            Amount: amount / 100,
                            Currency: currency
                        };
                
                        // Step 3: Send verification to backend to create order
                        const verificationResponse = await axios.post(
                            "https://localhost:7087/api/Order/VerifyAndCreateOrder", 
                            verificationData
                        );
                        
                        if (verificationResponse.data.success) {
                            // Step 4: Clear cart after successful verification and order creation
                            await clearCart();
                            
                            // Step 5: Show toast notification and navigate to profile
                            toast.success("Order placed successfully!", {
                                position: "top-center",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true
                            });
                            
                            // Navigate to customer profile after a brief delay to ensure toast is visible
                            setTimeout(() => {
                                navigate("/customerDetails"); // Navigate to profile page
                            }, 1000);
                        } else {
                            toast.error("Payment verification failed. Please contact support.");
                        }
                    } catch (error) {
                        console.error("Failed during payment processing:", error);
                        toast.error("There was an issue processing your payment. Please contact support.");
                    } finally {
                        setProcessingPayment(false);
                    }
                },
                prefill: {
                    email: user.email,
                    name: user.name || "Customer",
                    contact: user.phone || "",
                },
                theme: { color: "#22c55e" },
                modal: {
                    ondismiss: function() {
                        console.log("Payment cancelled by user");
                        setProcessingPayment(false);
                    }
                }
            };
    
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Payment initialization failed:", error);
            toast.error("Failed to initialize payment. Please try again.");
            setProcessingPayment(false);
        }
    };

    const clearCart = async () => {
        try {
            // Make the DELETE request to the API
            const response = await axios.delete(`https://localhost:7087/api/Cart/DeleteCartByMail?Mail=${user.email}`);
            
            if (response.status === 200) {
                // Clear the cart items from local state
                setCartItems([]); // Clear local state immediately
                setTotalPrice(0);
                console.log("Cart cleared successfully.");
                return true;
            } else {
                console.log("Failed to clear cart. Server response:", response);
                return false;
            }
        } catch (err) {
            console.error("Failed to clear cart:", err);
            return false;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Your Shopping Cart</h1>
                    
                    {cartItems.length > 0 && (
                        <p className="text-sm text-gray-500 mt-2 md:mt-0">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading your cart items...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
                            <p className="font-medium">{error}</p>
                        </div>
                        <button 
                            onClick={fetchCartItems}
                            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="w-24 h-24 mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
                        <button 
                            onClick={() => window.location.href = '/products'}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="w-full lg:w-2/3">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="border-b border-gray-100 p-4 hidden md:flex">
                                    <div className="w-2/5 font-medium text-gray-600">Product</div>
                                    <div className="w-1/5 text-center font-medium text-gray-600">Price</div>
                                    <div className="w-1/5 text-center font-medium text-gray-600">Quantity</div>
                                    <div className="w-1/5 text-right font-medium text-gray-600">Subtotal</div>
                                </div>
                                
                                <div className="divide-y divide-gray-100">
                                    {cartItems.map((item) => (
                                        <CartItem 
                                            key={item.id} 
                                            product={item} 
                                            onUpdate={handleItemUpdate} 
                                            onRemove={handleRemoveItem} 
                                        />
                                    ))}
                                </div>

                                <div className="p-4 bg-gray-50 flex justify-between items-center">
                                    <button 
                                        onClick={() => window.location.href = '/products'}
                                        className="text-green-600 font-medium hover:text-green-700 flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5" />
                                        </svg>
                                        Continue Shopping
                                    </button>
                                    <div className="font-medium text-lg text-gray-800">Total: ₹{totalPrice}</div>
                                </div>
                            </div>
                        </div>

                        {/* Checkout */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
                                <div className="flex justify-between text-gray-600 mb-4">
                                    <span>Items:</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    disabled={processingPayment || cartItems.length === 0}
                                    className={`w-full py-3 rounded-lg text-white ${processingPayment ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {processingPayment ? 'Processing Payment...' : 'Proceed to Checkout'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}