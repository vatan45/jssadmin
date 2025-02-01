import React, { useState, useEffect } from 'react';
import { Bell, Package, Clock, Settings, Menu, X, User, ChevronDown, Search, TrendingUp, AlertCircle, MapPin } from 'lucide-react';

const API_URL = 'http://localhost:5000/api'; // Change this to your backend URL

// Add this StatusBadge component before the AdminDashboard component
const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyles()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('new');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [notifications, setNotifications] = useState(3);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Fetch orders from backend
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('https://products.jogisuperstore.com/api/user/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            console.log('Raw API response:', data);

            // Transform the API data to match our component's expected format
            const transformedOrders = data.map(order => ({
                id: order._id,
                customer: order.customerName || 'No Name',
                phone: order.customerPhone || 'No Phone',
                address: order.deliveryAddress ? 
                    `${order.deliveryAddress.flatNo}, ${order.deliveryAddress.society}, ${order.deliveryAddress.area}` 
                    : 'No Address',
                customerLocation: order.customerLocation || null,
                items: order.orderItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice
                })),
                total: order.orderTotal?.total || 
                    order.orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
                status: order.orderStatus?.toLowerCase() || 'pending',
                time: order.orderDate || order.createdAt
            }));
            
            console.log('Transformed orders:', transformedOrders);
            setOrders(transformedOrders);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load orders. Please try again.');
            showToastMessage('Error loading orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchOrders();
        // Set up polling for new orders every 30 seconds
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setLoading(true);
            const response = await fetch(`https://products.jogisuperstore.com/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update order status');
            }

            // Refresh orders after update
            await fetchOrders();
            showToastMessage('Order status updated successfully!', 'success');
        } catch (err) {
            console.error('Update error:', err);
            showToastMessage('Failed to update order status', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        } catch (err) {
            showToastMessage('Error logging out', 'error');
        }
    };

    // Toast message handler
    const showToastMessage = (message, type = 'success') => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Format price in Indian Rupees
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Filter orders based on search and active tab
    const filterOrders = () => {
        return orders.filter(order => {
            const matchesSearch = searchTerm === '' ||
                order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.address.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTab = activeTab === 'all' ||
                (activeTab === 'new' && order.status === 'pending') ||
                (activeTab === 'in-progress' && order.status === 'in-progress') ||
                (activeTab === 'completed' && order.status === 'completed');

            return matchesSearch && matchesTab;
        });
    };

    // Calculate stats
    const stats = {
        pending: orders.filter(o => o.status === 'pending').length,
        inProgress: orders.filter(o => o.status === 'in-progress').length,
        completed: orders.filter(o => o.status === 'completed').length,
        totalSales: orders.reduce((sum, order) => sum + order.total, 0)
    };

    // Loading component
    const LoadingSpinner = () => (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    // Error component
    const ErrorMessage = ({ message }) => (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
            <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{message}</p>
                <button
                    onClick={fetchOrders}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    // Toast component
    const Toast = ({ message, type }) => (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
            {type === 'error' ? (
                <AlertCircle className="h-5 w-5" />
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            )}
            <span>{message}</span>
        </div>
    );

    // Helper function to create Google Maps link
    const createGoogleMapsLink = (latitude, longitude) => {
        return `https://www.google.com/maps?q=${latitude},${longitude}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center justify-between px-4 md:px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 hidden md:block">Grocery Dashboard</h1>
                        <h1 className="text-lg font-bold text-gray-800 md:hidden">Dashboard</h1>
                    </div>

                    <div className="flex items-center space-x-3 md:space-x-6">
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-48 md:w-64 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                        </div>

                        <button
                            className="p-2 rounded-lg hover:bg-gray-100 relative"
                            onClick={() => setNotifications(0)}
                        >
                            <Bell size={20} />
                            {notifications > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {notifications}
                                </span>
                            )}
                        </button>

                        <div className="relative">
                            <button
                                className="flex items-center space-x-2 md:space-x-3 p-2 rounded-lg hover:bg-gray-100"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    <User size={20} />
                                </div>
                                <span className="font-medium hidden md:block">Admin</span>
                                <ChevronDown size={16} className="hidden md:block" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                        onClick={() => alert('Profile clicked')}
                                    >
                                        Profile
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                        onClick={() => alert('Settings clicked')}
                                    >
                                        Settings
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="px-4 pb-4 md:hidden">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-73px)]">
                {/* Sidebar - Mobile Overlay */}
                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out`}>
                    <nav className="p-4 h-full overflow-y-auto">
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveTab('new')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'new'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Package size={20} />
                                <div className="flex justify-between items-center w-full">
                                    <span>New Orders</span>
                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                        {stats.pending}
                                    </span>
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTab('in-progress')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'in-progress'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Clock size={20} />
                                <div className="flex justify-between items-center w-full">
                                    <span>In Progress</span>
                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                        {stats.inProgress}
                                    </span>
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'completed'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Settings size={20} />
                                <div className="flex justify-between items-center w-full">
                                    <span>Completed</span>
                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                        {stats.completed}
                                    </span>
                                </div>
                            </button>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="text-blue-600" size={20} />
                                <h3 className="font-medium text-blue-600">Today's Sales</h3>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-gray-800">
                                {formatPrice(stats.totalSales)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                From {orders.length} orders
                            </p>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-50 w-full">
                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {filterOrders().map(order => (
                                <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-4 md:p-6 border-b">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-base md:text-lg font-bold text-gray-800">
                                                    {order.customer}
                                                </h3>
                                                <p className="text-gray-600 text-xs md:text-sm mt-1">
                                                    {order.phone}
                                                </p>
                                            </div>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        
                                        {/* Address and Location Section */}
                                        <div className="space-y-2">
                                            <p className="text-gray-600 text-xs md:text-sm flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {order.address}
                                            </p>
                                            
                                            {/* Google Maps Link */}
                                            {order.customerLocation && (
                                                <a
                                                    href={createGoogleMapsLink(order.customerLocation.latitude, order.customerLocation.longitude)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-600 hover:text-blue-700 text-xs md:text-sm"
                                                >
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    Open in Google Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 md:p-6">
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-gray-600">Order Items:</h4>
                                            <ul className="space-y-2">
                                                {order.items.map((item, index) => (
                                                    <li key={index} className="flex items-center justify-between text-gray-600 text-sm">
                                                        <div className="flex items-center">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                            {item.name}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">x{item.quantity}</span>
                                                            <span className="ml-2 text-gray-500">₹{item.totalPrice}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-6 pt-6 border-t">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center text-gray-600">
                                                    <Clock size={16} className="mr-1" />
                                                    <span className="text-sm">
                                                        {new Date(order.time).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-xl text-gray-800">
                                                    ₹{order.total}
                                                </p>
                                            </div>

                                            {/* Order action buttons */}
                                            <div className="flex justify-end">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, 'in-progress')}
                                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        Accept Order
                                                    </button>
                                                )}
                                                {order.status === 'in-progress' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Mark Completed
                                                    </button>
                                                )}
                                                {order.status === 'completed' && (
                                                    <div className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-center">
                                                        Order Completed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filterOrders().length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center p-8 md:p-12 bg-white rounded-xl">
                                    <Package size={32} className="text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
                                    <p className="text-gray-500 text-center mt-2">
                                        {searchTerm
                                            ? "No orders match your search criteria"
                                            : `No ${activeTab} orders at the moment`}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Toast Notifications */}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {showToast && (
                    <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{toastMessage}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;