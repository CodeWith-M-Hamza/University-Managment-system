import React, { useEffect, useState } from "react";
import TimeSlotService from "../services/timeslotService";
import FileImportUploader from "./FileImportUploader";

/**
 * TimeSlots Component
 * 
 * This component manages university time slots for scheduling.
 * It provides CRUD operations (Create, Read, Update, Delete) for time slots
 * with a user-friendly interface and proper error handling.
 * 
 * Features:
 * - Add new time slots with day, start time, and end time
 * - Edit existing time slots inline
 * - Delete time slots with confirmation
 * - Filter time slots by day of the week
 * - Responsive grid layout
 * - Loading states and error handling
 * - Bulk import from Excel/CSV/Word files
 */
function TimeSlots() {
  // State Management
  const [timeslots, setTimeSlots] = useState([]); // Array of all time slots
  const [newSlot, setNewSlot] = useState({        // Form data for new time slot
    day: "monday",
    start_time: "",
    end_time: "",
    slot_name: ""
  });
  const [editingSlot, setEditingSlot] = useState(null); // Currently editing time slot
  const [isLoading, setIsLoading] = useState(false);    // Loading state for API calls
  const [error, setError] = useState("");              // Error message display
  const [activeTab, setActiveTab] = useState("add"); // "add" or "import"
  const [filterDay, setFilterDay] = useState("all");   // Filter by day of week

  // Days of week for dropdown and filtering
  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" }
  ];

  /**
   * useEffect Hook
   * 
   * Runs once when component mounts to fetch initial time slots data.
   * Empty dependency array [] means this effect runs only once after initial render.
   */
  useEffect(() => {
    fetchTimeSlots();
  }, []);

  /**
   * Fetches all time slots from the API
   * Handles loading states and error scenarios
   */
  const fetchTimeSlots = async () => {
    try {
      setIsLoading(true);
      const response = await TimeSlotService.getAll();
      setTimeSlots(response.data);
      setError(""); // Clear any previous errors
    } catch (err) {
      setError("Failed to fetch time slots. Please try again.");
      console.error("Error fetching time slots:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form submission for adding a new time slot
   * Validates required fields and makes API call
   */
  const handleAdd = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Validation: Check if required fields are filled
    if (!newSlot.start_time || !newSlot.end_time || !newSlot.slot_name) {
      setError("Start time, end time, and slot name are required");
      return;
    }

    try {
      setIsLoading(true);
      await TimeSlotService.create(newSlot);
      
      // Reset form and fetch updated list
      setNewSlot({
        day: "monday",
        start_time: "",
        end_time: "",
        slot_name: ""
      });
      setError("");
      fetchTimeSlots();
    } catch (err) {
      setError("Failed to create time slot. Please try again.");
      console.error("Error creating time slot:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates an existing time slot
   * @param {Object} slot - The time slot object with updated values
   */
  const handleUpdate = async (slot) => {
    try {
      setIsLoading(true);
      await TimeSlotService.update(slot.id, slot);
      setEditingSlot(null); // Exit editing mode
      setError("");
      fetchTimeSlots();
    } catch (err) {
      setError("Failed to update time slot. Please try again.");
      console.error("Error updating time slot:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a time slot after confirmation
   * @param {number} id - The ID of the time slot to delete
   */
  const handleDelete = async (id) => {
    // Confirm deletion to prevent accidental removes
    if (!window.confirm("Are you sure you want to delete this time slot?")) {
      return;
    }

    try {
      setIsLoading(true);
      await TimeSlotService.delete(id);
      setError("");
      fetchTimeSlots();
    } catch (err) {
      setError("Failed to delete time slot. Please try again.");
      console.error("Error deleting time slot:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enters editing mode for a specific time slot
   * @param {Object} slot - The time slot to edit
   */
  const startEditing = (slot) => {
    setEditingSlot({ ...slot }); // Create a copy to avoid direct state mutation
  };

  /**
   * Cancels editing mode without saving changes
   */
  const cancelEditing = () => {
    setEditingSlot(null);
  };

  /**
   * Handles input changes for the new time slot form
   * Uses computed property name to update the correct field
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSlot(prev => ({
      ...prev,        // Spread previous state
      [name]: value   // Update only the changed field
    }));
  };

  /**
   * Handles input changes for the editing form
   * Similar to handleInputChange but for editing state
   */
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingSlot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Filters time slots based on selected day
   * Returns all slots if "all" is selected
   */
  const filteredSlots = filterDay === "all" 
    ? timeslots 
    : timeslots.filter(slot => slot.day === filterDay);

  /**
   * Formats time for display (removes seconds if present)
   * @param {string} timeString - Time string from API
   * @returns {string} Formatted time without seconds
   */
  const formatTime = (timeString) => {
    if (!timeString) return "";
    // Remove seconds from time format (HH:MM:SS -> HH:MM)
    return timeString.slice(0, 5);
  };

  /**
   * Gets color coding based on day of week for visual distinction
   * @param {string} day - Day of the week
   * @returns {string} Tailwind CSS classes for styling
   */
  const getDayColor = (day) => {
    const colors = {
      monday: 'bg-blue-100 text-blue-800 border-blue-200',
      tuesday: 'bg-green-100 text-green-800 border-green-200',
      wednesday: 'bg-purple-100 text-purple-800 border-purple-200',
      thursday: 'bg-orange-100 text-orange-800 border-orange-200',
      friday: 'bg-red-100 text-red-800 border-red-200',
      saturday: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[day] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Time Slot Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage class schedules and time slots for university timetable
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Time Slot Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Add New Time Slot
              </h2>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("add")}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === "add"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  ➕ One by One
                </button>
                <button
                  onClick={() => setActiveTab("import")}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === "import"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📤 Import File
                </button>
              </div>
              
              {/* Add One by One Tab */}
              {activeTab === "add" && (
              <form onSubmit={handleAdd} className="space-y-4">
                
                {/* Day Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    name="day"
                    value={newSlot.day}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slot Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slot Name *
                  </label>
                  <input
                    type="text"
                    name="slot_name"
                    value={newSlot.slot_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Morning Session, Period 1"
                    required
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={newSlot.start_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={newSlot.end_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Adding Time Slot..." : "Add Time Slot"}
                </button>
              </form>
              )}

              {/* Import from File Tab */}
              {activeTab === "import" && (
                <FileImportUploader
                  importType="timeslots"
                  description="Upload an Excel, CSV, or Word file with time slot data. Required columns: day, start_time, end_time, slot_name"
                  onImportComplete={() => {
                    // Refresh time slots
                    setTimeout(() => {
                      fetchTimeSlots();
                      setActiveTab("add");
                    }, 1000);
                  }}
                />
              )}
            </div>
          </div>

          {/* Time Slots List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              
              {/* List Header with Filter and Refresh */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Time Slots ({filteredSlots.length})
                  </h2>
                  
                  <div className="flex space-x-3">
                    
                    {/* Day Filter */}
                    <select
                      value={filterDay}
                      onChange={(e) => setFilterDay(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Days</option>
                      {daysOfWeek.map(day => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>

                    {/* Refresh Button */}
                    <button
                      onClick={fetchTimeSlots}
                      disabled={isLoading}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Conditional Rendering for Different States */}
              {isLoading && timeslots.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading time slots...</p>
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    {filterDay === "all" 
                      ? "No time slots found. Add your first time slot!" 
                      : `No time slots found for ${daysOfWeek.find(d => d.value === filterDay)?.label}.`
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {filteredSlots.map((slot) => (
                    <div key={slot.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      
                      {editingSlot?.id === slot.id ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <select
                            name="day"
                            value={editingSlot.day || "monday"}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {daysOfWeek.map(day => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                          
                          <input
                            type="text"
                            name="slot_name"
                            value={editingSlot.slot_name || ""}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Slot Name"
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="time"
                              name="start_time"
                              value={formatTime(editingSlot.start_time) || ""}
                              onChange={handleEditInputChange}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="time"
                              name="end_time"
                              value={formatTime(editingSlot.end_time) || ""}
                              onChange={handleEditInputChange}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(editingSlot)}
                              disabled={isLoading}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display Mode */
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* Day Badge */}
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${getDayColor(slot.day)} mb-3`}>
                              {slot.day}
                            </div>
                            
                            {/* Slot Information */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {slot.slot_name}
                            </h3>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => startEditing(slot)}
                              className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors p-1"
                              title="Edit time slot"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition-colors p-1 disabled:opacity-50"
                              title="Delete time slot"
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
    </div>
  );
}

export default TimeSlots;