import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CartItem({ product, onUpdate, onRemove }) {
    const [quantity, setQuantity] = useState(product.noOfItems || 1);
    const [isLoading, setIsLoading] = useState(false);
    const [productDetails, setProductDetails] = useState(null);
    const [unitPrice, setUnitPrice] = useState(0);

    useEffect(() => {
        fetchProductDetails();
    }, []);

    useEffect(() => {
        setQuantity(product.noOfItems || 1);
    }, [product.noOfItems]);

    useEffect(() => {
        if (productDetails) {
            updateUnitPrice(quantity);
        }
    }, [quantity, productDetails]);

    const fetchProductDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`https://localhost:7087/api/Product/getProductDataById?Id=${product.productId}`);
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            setProductDetails(data);
            updateUnitPrice(quantity, data); // initialize price
        } catch (error) {
            console.error("Error fetching product details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUnitPrice = (qty, details = productDetails) => {
        if (!details) return;
        const bulkThreshold = details.remainingStock * 0.1;
        const isBulk = qty > bulkThreshold;
        const price = isBulk ? details.bulkPrice : details.normalPrice;
        setUnitPrice(price);

        const newTotal = price * qty;
        if (onUpdate) {
            onUpdate(product.productId, newTotal, qty);
        }
    };

    const handleQuantityChange = (newQty) => {
        const maxStock = productDetails?.remainingStock || 1;
        newQty = Math.max(1, Math.min(newQty, maxStock));
        setQuantity(newQty);
    };

    const handleRemove = async () => {
        try {
            setIsLoading(true);
            // Always use product.productId for consistency with the parent component
            const productIdToDelete = product.productId;
            
            if (onRemove) {
                // Call parent's onRemove function first
                onRemove(productIdToDelete);
            }
        } catch (error) {
            console.error("Error removing item from cart:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle image file selection and convert it to base64
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setProductDetails((prevDetails) => ({
                    ...prevDetails,
                    profile: base64String, // Set the base64 string as profile
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading || !productDetails) {
        return (
            <div className="p-4 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-500">Loading item...</span>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col md:flex-row md:items-center border rounded-lg shadow-sm bg-white mb-4">
            {/* Product Info */}
            <div className="flex items-center w-full md:w-2/5 mb-4 md:mb-0">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    {/* Display image as base64 */}
                    <img
                        src={productDetails.profile || "https://via.placeholder.com/150"}
                        alt={productDetails.name}
                        className="h-full w-full object-cover object-center"
                    />
                </div>
                <div className="ml-4 flex-1">
                    <h3 className="text-base font-medium text-gray-800">{productDetails.name}</h3>
                    <p className="text-sm text-gray-500">Category: {productDetails.productType}</p>
                    <p className="text-sm text-gray-400">Sold In: {productDetails.soldIN}</p>
                    <p className="text-sm text-gray-400">Remaining: {productDetails.remainingStock}</p>
                    <p className="text-sm text-red-500">Normal: ₹{productDetails.normalPrice}</p>
                    <p className="text-sm text-green-600">Bulk: ₹{productDetails.bulkPrice}</p>
                </div>
            </div>

            {/* Unit Price */}
            <div className="w-full md:w-1/5 text-left md:text-center mb-2 md:mb-0">
                <span className="text-sm md:text-base font-medium text-gray-700">
                    ₹{unitPrice.toFixed(2)}
                </span>
            </div>

            {/* Quantity Controls */}
            <div className="w-full md:w-1/5 flex items-center md:justify-center mb-2 md:mb-0">
                <div className="flex border border-gray-200 rounded">
                    <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="1"
                        max={productDetails.remainingStock}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="w-12 text-center border-x border-gray-200 focus:outline-none py-1"
                    />
                    <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Subtotal and Remove */}
            <div className="w-full md:w-1/5 flex items-center justify-between md:justify-end">
                <span className="md:hidden text-sm font-medium text-gray-700">Subtotal:</span>
                <span className="text-sm md:text-base font-medium text-gray-800">
                    ₹{(unitPrice * quantity).toFixed(2)}
                </span>

                <button
                    onClick={handleRemove}
                    className="ml-4 text-red-500 hover:text-red-600"
                    disabled={isLoading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}
