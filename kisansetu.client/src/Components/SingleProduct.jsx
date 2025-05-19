import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../Config/AuthContext";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import the styles

function SingleProduct({ product }) {
    const { user } = useContext(AuthContext);
    const [userEmail, setUserEmail] = useState(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [base64Image, setBase64Image] = useState("");

    useEffect(() => {
        if (user?.email) {
            setUserEmail(user.email);
            checkIfInCart(user.email);
        }
        if (product?.profile) {
            convertImageToBase64(product.profile);
        }
    }, [user?.email, product?.id, product?.profile]);

    const checkIfInCart = async (email) => {
        try {
            const allCartsResponse = await axios.get("https://localhost:7087/api/Cart/GetCart");
            
            const userCartItems = Array.isArray(allCartsResponse.data) ? 
                allCartsResponse.data.filter(item => 
                    item.customerMail?.toLowerCase() === email.toLowerCase()
                ) : [];
            
            const existingCartItem = userCartItems.find(item => 
                item.productId === product.id
            );
            
            setIsInCart(!!existingCartItem);
        } catch (error) {
            console.error("Error checking cart:", error);
        }
    };

    const convertImageToBase64 = (imageUrl) => {
        axios.get(imageUrl, { responseType: 'arraybuffer' })
            .then(response => {
                const base64String = Buffer.from(response.data, 'binary').toString('base64');
                setBase64Image(`data:image/jpeg;base64,${base64String}`);
            })
            .catch(error => {
                console.error("Error converting image to Base64:", error);
            });
    };

    const handleAddToCart = async () => {
        if (!userEmail) {
            toast.error("You need to log in to add items to the cart.");
            return;
        }

        if (isInCart) {
            toast.info("This item is already in your cart.");
            return;
        }

        // Stock validation: Check if product is out of stock
        if (product.remainingStock <= 0) {
            toast.error("This item is out of stock.");
            return;
        }

        setIsAddingToCart(true);

        try {
            const newCartItem = {
                ProductId: product.id,
                CustomerMail: userEmail, 
                NoOfItems: 1,
                TotalAmount: product.normalPrice
            };
            
            const addResponse = await axios.post(
                "https://localhost:7087/api/Cart/InsertCart",
                newCartItem
            );
            
            toast.success("Item added to cart successfully!");
            setIsInCart(true);
            
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Failed to update cart. Please try again.");
        } finally {
            setIsAddingToCart(false);
        }
    };

    if (!product) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl">
                <div className="text-gray-500 font-medium">Product not available</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
                {/* Product Image */}
                <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                    <img
                        src={base64Image || product.profile}  // Use Base64 if available
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    {product.remainingStock <= 0 && (
                        <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                            Sold Out
                        </div>
                    )}
                    {product.remainingStock < 10 && product.remainingStock > 0 && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                            Low Stock: {product.remainingStock}
                        </div>
                    )}
                </div>
                
                {/* Product Content */}
                <div className="p-4 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
                            {product.name}
                        </h2>
                        {/* <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                            <span className="mr-1">⭐</span>
                            <span>{product.rating}</span>
                        </div> */}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                        {product.productType}
                    </p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div className="flex items-center">
                            <span className="text-gray-500 mr-1">Sold In:</span>
                            <span className="font-medium">{product.soldIN}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-500 mr-1">Stock:</span>
                            <span className="font-medium">{product.remainingStock}</span>
                        </div>
                    </div>
                    
                    {/* Price Section */}
                    <div className="mt-auto">
                        <div className="flex justify-between mb-3">
                            <div>
                                <p className="text-xs text-gray-500">Normal Price</p>
                                <p className="text-lg font-bold text-gray-800">₹{product.normalPrice}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Bulk Price</p>
                                <p className="text-lg font-medium text-green-600">₹{product.bulkPrice}</p>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                                className={`px-4 py-2 rounded-lg text-white font-medium ${isInCart ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} ${isAddingToCart ? 'opacity-75' : ''}`}
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                            >
                                {isAddingToCart ? 'Adding...' : isInCart ? 'In Cart' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SingleProduct;
