import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

import Navbar from "../Components/Navbar";
import SingleProduct from "../Components/SingleProduct";

function Product() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter products whenever search term or products array changes
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredProducts(products);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = products.filter(
                product => 
                    product.name?.toLowerCase().includes(term) || 
                    product.description?.toLowerCase().includes(term)
            );
            setFilteredProducts(filtered);
        }
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get("https://localhost:7087/api/Product/getProductData");
            setProducts(response.data);
            setFilteredProducts(response.data); // Initialize filtered products with all products
            setLoading(false);
        } catch (error) {
            toast.error(`Failed to load products: ${error.message}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 flex flex-col">
            <Navbar />
            <ToastContainer />

            <div className="container mx-auto px-4 py-8 flex-grow">
          

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <input
                            type="search"
                            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Search products by name.."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
                            <p className="text-gray-700 font-medium">Loading products...</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-16">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <p className="mt-4 text-lg text-gray-600">No products available at the moment.</p>
                        <button 
                            onClick={fetchProducts}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Refresh
                        </button>
                    </div>
                )}

                {/* No Search Results State */}
                {!loading && products.length > 0 && filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="mt-4 text-xl text-gray-700">No matching products found</p>
                        <p className="text-gray-500">Try adjusting your search term</p>
                        <button 
                            onClick={() => setSearchTerm("")}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Clear Search
                        </button>
                    </div>
                )}

                {/* Product Grid */}
                {!loading && filteredProducts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="h-full">
                                <SingleProduct product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-4 px-6 text-center text-sm">
                <p>© {new Date().getFullYear()} Kisan Setu. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Product;