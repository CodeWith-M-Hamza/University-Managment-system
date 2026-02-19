import React, { useEffect, useState } from "react";
import RoomService, { testRoomServiceConnection, testRoomCreation } from "../services/roomService";
import DepartmentService from "../services/departmentService";
import FileImportUploader from "./FileImportUploader";

function Room() {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    room_number: "",
    room_type: "classroom",
    capacity: "",
    department: ""
  });
  const [editingRoom, setEditingRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showDebug, setShowDebug] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add"); // "add" or "import"

  useEffect(() => {
    fetchRooms();
    fetchAllDepartments();
  }, []);

  // Fetch all departments from Department API
  const fetchAllDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      console.log('📋 Fetching all departments from API...');
      const response = await DepartmentService.getAll();
      console.log('✅ Departments fetched:', response.data);
      
      // Extract department names from the response
      const departmentNames = response.data.map(dept => dept.name);
      setAvailableDepartments(departmentNames.sort());
      
    } catch (err) {
      console.error('❌ Error fetching departments:', err);
      // Fallback: try to extract from existing rooms
      extractDepartmentsFromRooms();
      setError("Failed to load departments. Using available room departments.");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Extract unique departments from existing rooms (fallback)
  const extractDepartmentsFromRooms = () => {
    const departments = new Set();
    rooms.forEach(room => {
      if (room.department && typeof room.department === 'object') {
        departments.add(room.department.name);
      } else if (room.department && typeof room.department === 'string') {
        departments.add(room.department);
      }
    });
    const extractedDepartments = Array.from(departments).sort();
    setAvailableDepartments(extractedDepartments);
    console.log('📋 Extracted departments from rooms:', extractedDepartments);
  };

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await RoomService.getAll();
      setRooms(response.data);
      setError("");
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to fetch rooms. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingRoom(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle department selection from dropdown
  const handleDepartmentSelect = (department) => {
    setNewRoom(prev => ({
      ...prev,
      department: department
    }));
    setShowDepartmentDropdown(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newRoom.room_number.trim()) {
      setError("Room number is required");
      return;
    }
    
    if (!newRoom.capacity || parseInt(newRoom.capacity) <= 0) {
      setError("Valid capacity is required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      
      // Prepare data for backend with SlugRelatedField
      const roomData = {
        room_number: newRoom.room_number.trim(),
        room_type: newRoom.room_type,
        capacity: parseInt(newRoom.capacity),
        // Only include department if it's not empty
        ...(newRoom.department.trim() && { department: newRoom.department.trim() })
      };
      
      console.log('📦 Sending room data:', roomData);
      
      const response = await RoomService.create(roomData);
      console.log('✅ Room created successfully:', response.data);
      
      // Reset form
      setNewRoom({
        room_number: "",
        room_type: "classroom",
        capacity: "",
        department: ""
      });
      
      setSuccess("Room created successfully!");
      fetchRooms(); // Refresh the list
      
    } catch (err) {
      console.error('❌ Error creating room:', err);
      
      let errorMessage = "Failed to create room. ";
      
      if (err.response?.data) {
        const serverError = err.response.data;
        console.log('🔍 Server validation errors:', serverError);
        
        // Handle specific field errors
        if (serverError.room_number) {
          errorMessage += `Room number: ${Array.isArray(serverError.room_number) ? serverError.room_number[0] : serverError.room_number}`;
        } else if (serverError.capacity) {
          errorMessage += `Capacity: ${Array.isArray(serverError.capacity) ? serverError.capacity[0] : serverError.capacity}`;
        } else if (serverError.department) {
          errorMessage += `Department: ${Array.isArray(serverError.department) ? serverError.department[0] : serverError.department}`;
        } else if (serverError.non_field_errors) {
          errorMessage += Array.isArray(serverError.non_field_errors) ? serverError.non_field_errors[0] : serverError.non_field_errors;
        } else if (typeof serverError === 'string') {
          errorMessage += serverError;
        } else if (serverError.detail) {
          errorMessage += serverError.detail;
        } else {
          // Show all errors
          const errorDetails = Object.entries(serverError)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
            .join(', ');
          errorMessage += errorDetails || "Please check the form and try again.";
        }
      } else if (err.request) {
        errorMessage += "No response from server. Please check your connection.";
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (room) => {
    try {
      setIsLoading(true);
      setError("");
      
      // Prepare data for backend with SlugRelatedField
      const roomData = {
        room_number: room.room_number,
        room_type: room.room_type,
        capacity: parseInt(room.capacity),
        // Only include department if it's not empty
        ...(room.department && room.department.trim() && { department: room.department.trim() })
      };
      
      await RoomService.update(room.id, roomData);
      setEditingRoom(null);
      setSuccess("Room updated successfully!");
      fetchRooms();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to update room. Please try again.";
      setError(errorMessage);
      console.error("Update error details:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      setIsLoading(true);
      await RoomService.delete(id);
      setSuccess("Room deleted successfully!");
      fetchRooms();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to delete room. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (room) => {
    setEditingRoom({ 
      ...room,
      // Ensure department is a string for editing
      department: renderDepartment(room)
    });
  };

  const cancelEditing = () => {
    setEditingRoom(null);
  };

  // Filter rooms by type
  const filteredRooms = filterType === "all" 
    ? rooms 
    : rooms.filter(room => room.room_type === filterType);

  // Safe rendering functions
  const renderRoomNumber = (room) => {
    if (!room.room_number) return "N/A";
    return typeof room.room_number === 'string' ? room.room_number : JSON.stringify(room.room_number);
  };

  const renderRoomType = (room) => {
    if (!room.room_type) return "classroom";
    return typeof room.room_type === 'string' ? room.room_type : "classroom";
  };

  const renderCapacity = (room) => {
    if (!room.capacity) return "N/A";
    return typeof room.capacity === 'number' ? room.capacity : parseInt(room.capacity);
  };

  const renderDepartment = (room) => {
    if (!room.department) return "";
    
    // Handle SlugRelatedField response (could be string or object)
    if (typeof room.department === 'object') {
      return room.department.name || room.department.department_name || "";
    }
    
    return room.department;
  };

  const getRoomTypeColor = (roomType) => {
    switch (roomType) {
      case 'lab':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'classroom':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoomTypeIcon = (roomType) => {
    switch (roomType) {
      case 'lab':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'classroom':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDepartmentDropdown && !event.target.closest('.department-dropdown-container')) {
        setShowDepartmentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDepartmentDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Room Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage all rooms and laboratories in the university
              </p>
              <p className="mt-1 text-xs text-orange-600">
                💡 Department must match existing department names in the system
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                {showDebug ? "Hide Debug" : "Show Debug"}
              </button>
              <button
                onClick={testRoomServiceConnection}
                className="px-3 py-2 text-xs bg-orange-200 text-orange-700 rounded-md hover:bg-orange-300 transition-colors"
              >
                Test Connection
              </button>
              <button
                onClick={fetchAllDepartments}
                className="px-3 py-2 text-xs bg-green-200 text-green-700 rounded-md hover:bg-green-300 transition-colors"
              >
                Refresh Departments
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
                <button
                  onClick={clearMessages}
                  className="ml-auto pl-3"
                >
                  <svg className="h-4 w-4 text-green-600 hover:text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={clearMessages}
                  className="ml-auto pl-3"
                >
                  <svg className="h-4 w-4 text-red-600 hover:text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {showDebug && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-yellow-800">Debug Information</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Development
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-yellow-600">Rooms Count:</span> {rooms.length}
                </div>
                <div>
                  <span className="text-yellow-600">Loading:</span> {isLoading.toString()}
                </div>
                <div>
                  <span className="text-yellow-600">Departments Loading:</span> {departmentsLoading.toString()}
                </div>
                <div>
                  <span className="text-yellow-600">CSRF Token:</span> {document.cookie.includes('csrftoken') ? '✅ Present' : '❌ Missing'}
                </div>
                <div>
                  <span className="text-yellow-600">Filter:</span> {filterType}
                </div>
                <div className="col-span-2">
                  <span className="text-yellow-600">Available Departments:</span> {availableDepartments.length}
                  {availableDepartments.length > 0 && (
                    <div className="mt-1 text-yellow-700">
                      {availableDepartments.slice(0, 3).join(', ')}
                      {availableDepartments.length > 3 && `... and ${availableDepartments.length - 3} more`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Room Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add New Room</h2>
                  <p className="text-sm text-gray-500">Create a new room or laboratory</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("add")}
                  className={`px-4 py-3 font-medium transition-colors ${
                    activeTab === "add"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  ➕ Add One by One
                </button>
                <button
                  onClick={() => setActiveTab("import")}
                  className={`px-4 py-3 font-medium transition-colors ${
                    activeTab === "import"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📤 Import from File
                </button>
              </div>

              {/* Add One by One Tab */}
              {activeTab === "add" && (
              <form onSubmit={handleAdd} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    name="room_number"
                    value={newRoom.room_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., A-101, LAB-201"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <select
                    name="room_type"
                    value={newRoom.room_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="lab">Laboratory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={newRoom.capacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 30"
                    min="1"
                    max="500"
                    required
                  />
                </div>

                <div className="relative department-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                    <span className="ml-1 text-xs text-gray-500">(Must match existing department)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="department"
                      value={newRoom.department}
                      onChange={handleInputChange}
                      onFocus={() => setShowDepartmentDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                      placeholder={
                        departmentsLoading 
                          ? "Loading departments..." 
                          : availableDepartments.length > 0 
                            ? "Select or type department" 
                            : "No departments available"
                      }
                      disabled={departmentsLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                      disabled={departmentsLoading || availableDepartments.length === 0}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {departmentsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Department Dropdown */}
                  {showDepartmentDropdown && availableDepartments.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
                          Available Departments ({availableDepartments.length})
                        </div>
                        {availableDepartments.map((department, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDepartmentSelect(department)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-700">{department}</span>
                            {newRoom.department === department && (
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {departmentsLoading ? (
                    <p className="mt-1 text-xs text-blue-500">
                      Loading departments from database...
                    </p>
                  ) : availableDepartments.length > 0 ? (
                    <p className="mt-1 text-xs text-gray-500">
                      {availableDepartments.length} departments available. Click the dropdown to select.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-red-500">
                      No departments found. Please add departments first in the Department section.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Room...
                    </div>
                  ) : (
                    "Add Room"
                  )}
                </button>
              </form>
              )}

              {/* Import from File Tab */}
              {activeTab === "import" && (
                <FileImportUploader
                  importType="rooms"
                  description="Upload an Excel, CSV, or Word file with room data. Required columns: room_number, room_type, capacity, department"
                  onImportComplete={() => {
                    // Refresh rooms list after successful import
                    setTimeout(() => fetchRooms(), 1000);
                  }}
                />
              )}
            </div>
          </div>

          {/* Rooms List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        All Rooms ({filteredRooms.length})
                      </h2>
                      <p className="text-sm text-gray-500">
                        {filterType === 'all' ? 'All room types' : `${filterType === 'lab' ? 'Laboratories' : 'Classrooms'} only`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {/* Filter Buttons */}
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setFilterType("all")}
                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          filterType === "all" 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterType("classroom")}
                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          filterType === "classroom" 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Classrooms
                      </button>
                      <button
                        onClick={() => setFilterType("lab")}
                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          filterType === "lab" 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Labs
                      </button>
                    </div>

                    <button
                      onClick={fetchRooms}
                      disabled={isLoading}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center"
                    >
                      <svg className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {isLoading && rooms.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading rooms...</p>
                  <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filterType === "all" 
                      ? "No rooms found" 
                      : `No ${filterType === "lab" ? "laboratories" : "classrooms"} found`
                    }
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {filterType === "all" 
                      ? "Get started by adding your first room to the system." 
                      : `Try changing the filter or add a new ${filterType === "lab" ? "laboratory" : "classroom"}.`
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {filteredRooms.map((room) => (
                    <div 
                      key={room.id} 
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group"
                    >
                      {editingRoom?.id === room.id ? (
                        // Edit Form
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              name="room_number"
                              value={editingRoom.room_number || ""}
                              onChange={handleEditInputChange}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                              placeholder="Room Number"
                            />
                            <input
                              type="number"
                              name="capacity"
                              value={editingRoom.capacity || ""}
                              onChange={handleEditInputChange}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                              placeholder="Capacity"
                            />
                          </div>
                          <select
                            name="room_type"
                            value={editingRoom.room_type || "classroom"}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            <option value="classroom">Classroom</option>
                            <option value="lab">Laboratory</option>
                          </select>
                          <input
                            type="text"
                            name="department"
                            value={editingRoom.department || ""}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            placeholder="Department (optional)"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(editingRoom)}
                              disabled={isLoading}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Room Display
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getRoomTypeColor(renderRoomType(room))}`}>
                                {getRoomTypeIcon(renderRoomType(room))}
                                <span className="capitalize">{renderRoomType(room)}</span>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {renderCapacity(room)} seats
                              </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                              Room {renderRoomNumber(room)}
                            </h3>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>Department: {renderDepartment(room) || "Not assigned"}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => startEditing(room)}
                              className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-all duration-200 p-2 hover:bg-blue-50"
                              title="Edit room"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(room.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg transition-all duration-200 p-2 hover:bg-red-50 disabled:opacity-50"
                              title="Delete room"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Room;
