import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../Config/AuthContext";

const YourProductsModal = ({ isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        if (!isOpen || !user?.email) return;
        
        setLoading(true);
        axios.get(`https://localhost:7087/api/Product/getProductDataByEmail?email=${user.email}`)
            .then(response => {
                setProducts(Array.isArray(response.data) ? response.data : [response.data]);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setLoading(false);
            });
    }, [user?.email, isOpen]);

    const handleDelete = (productId) => {
        axios.delete(`https://localhost:7087/api/Product/deleteProduct?id=${productId}`)
            .then(() => {
                setProducts(products.filter(product => product.id !== productId));
            })
            .catch(error => console.error("Error deleting product:", error));
    };

    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditingProduct(prev => ({ ...prev, profile: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = () => {
        axios.put(`https://localhost:7087/api/Product/updateProduct?id=${editingProduct.id}`, editingProduct)
            .then(() => {
                setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
                setEditingProduct(null);
            })
            .catch(error => console.error("Error updating product:", error));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Your Products</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-gray-500">Loading products...</div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500">No products found</p>
                            <p className="text-gray-400 text-sm mt-1">Add products to see them here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map(product => (
                                <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md">
                                    <div className="aspect-video w-full bg-gray-100 overflow-hidden">
                                        <img 
                                            src={product.profile || "/placeholder-product.png"} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-lg text-gray-800 mb-2">{product.name}</h3>
                                        
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Category:</span>
                                                <span className="font-medium">{product.productType}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Normal Price:</span>
                                                <span className="font-medium">₹{product.normalPrice}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Bulk Price:</span>
                                                <span className="font-medium">₹{product.bulkPrice}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Unit:</span>
                                                <span className="font-medium">{product.soldIN}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>In Stock:</span>
                                                <span className="font-medium">{product.remainingStock}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Rating:</span>
                                                <div className="flex items-center">
                                                    <span className="font-medium mr-1">{product.rating}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
                                            <button 
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
                                                onClick={() => handleEditClick(product)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">Edit Product</h2>
                            <button 
                                onClick={() => setEditingProduct(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={editingProduct.name} 
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} 
                                        placeholder="Product Name" 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                                    <select 
                                        name="productType" 
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={editingProduct.productType} 
                                        onChange={(e) => setEditingProduct({ ...editingProduct, productType: e.target.value })}
                                    >
                                        <option value="">Select Product Type</option>
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Fruits">Fruits</option>
                                        <option value="Seeds">Seeds</option>
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Normal Price</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                            value={editingProduct.normalPrice} 
                                            onChange={(e) => setEditingProduct({ ...editingProduct, normalPrice: e.target.value })} 
                                            placeholder="Normal Price" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Price</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                            value={editingProduct.bulkPrice} 
                                            onChange={(e) => setEditingProduct({ ...editingProduct, bulkPrice: e.target.value })} 
                                            placeholder="Bulk Price" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                            value={editingProduct.rating} 
                                            onChange={(e) => setEditingProduct({ ...editingProduct, rating: e.target.value })} 
                                            placeholder="Rating" 
                                            min="0"
                                            max="5"
                                            step="0.1"
                                        />
                                    </div> */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sold In</label>
                                        <select 
                                            name="soldIN" 
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                            value={editingProduct.soldIN} 
                                            onChange={(e) => setEditingProduct({ ...editingProduct, soldIN: e.target.value })}
                                        >
                                            <option value="">Select Unit</option>
                                            <option value="Kg">Kg</option>
                                            <option value="Pieces">Pieces</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Stock</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        value={editingProduct.remainingStock} 
                                        onChange={(e) => setEditingProduct({ ...editingProduct, remainingStock: e.target.value })} 
                                        placeholder="Remaining Stock" 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        {editingProduct.profile && (
                                            <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img 
                                                    src={editingProduct.profile} 
                                                    alt="Product preview" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            <label className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700 text-center">
                                                Choose New Image
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    onChange={handleImageChange} 
                                                    accept="image/*"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end space-x-3">
                            <button 
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                onClick={() => setEditingProduct(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                                onClick={handleSaveEdit}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourProductsModal;