

// // In your LoginForm handleSubmit, after successful login:
// const handleSubmit = async (e) => {
//   e.preventDefault();
  
//   if (!validateForm()) return;

//   setIsLoading(true);
  
//   try {
//     // Get CSRF token
//     const csrfToken = getCookie('csrftoken');
    
//     console.log('🚀 Starting login process...');
    
//     // Single login call to your custom endpoint
//     const response = await fetch('http://localhost:8000/api/auth/login/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-CSRFToken': csrfToken || '',
//       },
//       credentials: 'include',
//       body: JSON.stringify({
//         username: formData.username,
//         password: formData.password
//       }),
//     });

//     console.log('📨 Login response status:', response.status);

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Login failed');
//     }

//     const data = await response.json();
//     console.log('✅ Login successful - Full response:', data);

//     // Extract data with proper field names based on your Django response
//     const userData = data.user;
//     const accessToken = data.access_token; // From your Django response
//     const refreshToken = data.refresh_token; // From your Django response

//     console.log('🔍 Extracted - userData:', userData);
//     console.log('🔍 Extracted - accessToken:', !!accessToken);
//     console.log('🔍 Extracted - refreshToken:', !!refreshToken);

//     if (!userData || !userData.username) {
//       throw new Error('Invalid user data received from server');
//     }

//     // Clear any previous auth data
//     localStorage.removeItem('user');
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');

//     // Store new authentication data
//     localStorage.setItem('user', JSON.stringify(userData));
    
//     if (accessToken) {
//       localStorage.setItem('accessToken', accessToken);
//     }
    
//     if (refreshToken) {
//       localStorage.setItem('refreshToken', refreshToken);
//     }

//     console.log('💾 Storage updated - user:', !!localStorage.getItem('user'));
//     console.log('💾 Storage updated - accessToken:', !!localStorage.getItem('accessToken'));
//     console.log('💾 Storage updated - refreshToken:', !!localStorage.getItem('refreshToken'));

//     // Call onLogin BEFORE navigation
//     if (onLogin) {
//       console.log('🔄 Calling onLogin callback...');
//       onLogin(userData, {
//         access: accessToken,
//         refresh: refreshToken
//       });
//     }

//     // Wait a bit to ensure state updates
//     await new Promise(resolve => setTimeout(resolve, 50));

//     console.log('🎯 Navigating to dashboard...');
    
//     // Navigate to dashboard
//     navigate('/dashboard', { replace: true });

//   } catch (error) {
//     console.error('❌ Login error:', error);
//     setErrors(prev => ({ 
//       ...prev, 
//       general: error.message || 'Login failed. Please check your credentials and try again.' 
//     }));
    
//     // Clear storage on error
//     localStorage.removeItem('user');
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//   } finally {
//     setIsLoading(false);
//   }
// };


//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//           Sign in to your account
//         </h2>
//         <p className="mt-2 text-center text-sm text-gray-600">
//           Use your username to sign in
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {errors.general && (
//               <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
//                 {errors.general}
//               </div>
//             )}

//             {/* Username */}
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//                 Username
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="username"
//                   name="username"
//                   type="text"
//                   autoComplete="username"
//                   required
//                   value={formData.username}
//                   onChange={handleChange}
//                   className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.username ? 'border-red-300' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter your username"
//                 />
//                 {errors.username && (
//                   <p className="mt-2 text-sm text-red-600">{errors.username}</p>
//                 )}
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete="current-password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.password ? 'border-red-300' : 'border-gray-300'
//                   }`}
//                   placeholder="Enter your password"
//                 />
//                 {errors.password && (
//                   <p className="mt-2 text-sm text-red-600">{errors.password}</p>
//                 )}
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
//               >
//                 {isLoading ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Signing in...
//                   </>
//                 ) : (
//                   'Sign in'
//                 )}
//               </button>
//             </div>

//             {/* Register Link Section */}
//             <div className="text-center">
//               <p className="text-sm text-gray-600">
//                 Don't have an account?{' '}
//                 <Link 
//                   to="/register" 
//                   className="font-medium text-blue-600 hover:text-blue-500 transition duration-150"
//                 >
//                   Sign up here
//                 </Link>
//               </p>
//             </div>
//           </form>

//           {/* Alternative: Button style register link */}
//           <div className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300" />
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-gray-500">Or</span>
//               </div>
//             </div>

//             <div className="mt-6">
//               <Link 
//                 to="/register"
//                 className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
//               >
//                 Create new account
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// export default LoginForm;





import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function to get CSRF token from cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Get CSRF token
      const csrfToken = getCookie('csrftoken');
      
      console.log('🚀 Starting login process...');
      
      // Single login call to your custom endpoint
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      console.log('📨 Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful - Full response:', data);

      // Extract data with proper field names based on your Django response
      const userData = data.user;
      const accessToken = data.access_token; // From your Django response
      const refreshToken = data.refresh_token; // From your Django response

      console.log('🔍 Extracted - userData:', userData);
      console.log('🔍 Extracted - accessToken:', !!accessToken);
      console.log('🔍 Extracted - refreshToken:', !!refreshToken);

      if (!userData || !userData.username) {
        throw new Error('Invalid user data received from server');
      }

      // Clear any previous auth data
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Store new authentication data
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      console.log('💾 Storage updated - user:', !!localStorage.getItem('user'));
      console.log('💾 Storage updated - accessToken:', !!localStorage.getItem('accessToken'));
      console.log('💾 Storage updated - refreshToken:', !!localStorage.getItem('refreshToken'));

      // Call onLogin BEFORE navigation
      if (onLogin) {
        console.log('🔄 Calling onLogin callback...');
        onLogin(userData, {
          access: accessToken,
          refresh: refreshToken
        });
      }

      // Wait a bit to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 50));

      console.log('🎯 Navigating to dashboard...');
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error('❌ Login error:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: error.message || 'Login failed. Please check your credentials and try again.' 
      }));
      
      // Clear storage on error
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use your username to sign in
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Register Link Section */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition duration-150"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>

          {/* Alternative: Button style register link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <Link 
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;