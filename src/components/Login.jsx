import React, { useState } from 'react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Hardcoded credentials - replace with your desired username/password
        const validUsername = 'admin';
        const validPassword = 'admin123';

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            if (username === validUsername && password === validPassword) {
                // Store a dummy token
                localStorage.setItem('authToken', 'dummy-token-12345');
                window.location.href = '/admin';
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            alert('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 space-y-2">
                        <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
                        <p className="text-center text-gray-600">Enter your credentials to access your account</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Username Field */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 block">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 block">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Remember me</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="px-6 pb-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;