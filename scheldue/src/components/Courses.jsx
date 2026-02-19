
import React, { useEffect, useState } from "react";
import CourseService from "../services/courseService";
import DepartmentService from "../services/departmentService"; // Import DepartmentService

function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]); // New state for departments
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    credit_hours: "",
    course_type: "theory",
    department: "" // This will now store department ID
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [departmentLoading, setDepartmentLoading] = useState(true); // Loading for departments
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchDepartments(); // Fetch departments on component mount
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await CourseService.getAll();
      const coursesData = Array.isArray(response.data) ? response.data : [];
      setCourses(coursesData);
      setError("");
    } catch (err) {
      setError("Failed to fetch courses. Please try again.");
      console.error("Error fetching courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setDepartmentLoading(true);
      const response = await DepartmentService.getAll();
      const departmentsData = Array.isArray(response.data) ? response.data : [];
      setDepartments(departmentsData);
      console.log('✅ Departments loaded:', departmentsData.length);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments. Please refresh the page.");
    } finally {
      setDepartmentLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCourse.code || !newCourse.name || !newCourse.department) {
      setError("Course code, name, and department are required");
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare data for API - use department_id instead of department
      const apiData = {
        code: newCourse.code,
        name: newCourse.name,
        credit_hours: newCourse.credit_hours ? parseInt(newCourse.credit_hours) : undefined,
        course_type: newCourse.course_type,
        department_id: newCourse.department // Send department_id to API
      };

      console.log('📤 Sending course data:', apiData);
      await CourseService.create(apiData);
      
      // Reset form
      setNewCourse({
        code: "",
        name: "",
        credit_hours: "",
        course_type: "theory",
        department: ""
      });
      setError("");
      fetchCourses();
    } catch (err) {
      console.error("Error creating course:", err);
      if (err.response?.data) {
        setError(`Failed to create course: ${JSON.stringify(err.response.data)}`);
      } else {
        setError("Failed to create course. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (course) => {
    try {
      setIsLoading(true);
      
      // Prepare data for API update
      const apiData = {
        code: course.code,
        name: course.name,
        credit_hours: course.credit_hours ? parseInt(course.credit_hours) : undefined,
        course_type: course.course_type,
        department_id: course.department // Send department_id to API
      };

      console.log('🔄 Updating course with data:', apiData);
      await CourseService.update(course.id, apiData);
      setEditingCourse(null);
      setError("");
      fetchCourses();
    } catch (err) {
      console.error("Error updating course:", err);
      if (err.response?.data) {
        setError(`Failed to update course: ${JSON.stringify(err.response.data)}`);
      } else {
        setError("Failed to update course. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      setIsLoading(true);
      await CourseService.delete(id);
      setError("");
      fetchCourses();
    } catch (err) {
      setError("Failed to delete course. Please try again.");
      console.error("Error deleting course:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (course) => {
    setEditingCourse({ 
      ...course,
      department: course.department?.id || course.department_id || course.department || ""
    });
  };

  const cancelEditing = () => {
    setEditingCourse(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Safe rendering functions
  const renderCourseCode = (course) => {
    if (!course.code) return "N/A";
    return typeof course.code === 'string' ? course.code : JSON.stringify(course.code);
  };

  const renderCourseName = (course) => {
    if (!course.name) return "No Name";
    
    if (typeof course.name === 'object') {
      return course.name.display_name || course.name.full_name || course.name.title || "Unnamed Course";
    }
    
    return course.name;
  };

  const renderCourseType = (course) => {
    if (!course.course_type) return "theory";
    return typeof course.course_type === 'string' ? course.course_type : "theory";
  };

  const renderCreditHours = (course) => {
    if (!course.credit_hours) return null;
    return typeof course.credit_hours === 'number' ? course.credit_hours : parseInt(course.credit_hours);
  };

  const renderDepartment = (course) => {
    if (!course.department) return "No Department";
    
    if (typeof course.department === 'object') {
      return course.department.name || course.department.department_name || "Unknown Department";
    }
    
    // If department is just an ID, find the department name
    if (typeof course.department === 'number' || (typeof course.department === 'string' && course.department)) {
      const dept = departments.find(d => d.id == course.department);
      return dept ? dept.name : `Department ${course.department}`;
    }
    
    return "Unknown Department";
  };

  // Department Select Skeleton Loader
  const DepartmentSelectSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage all courses in the university system
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Course Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Add New Course
              </h2>
              
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={newCourse.code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., CS-101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCourse.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Introduction to Computer Science"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    name="credit_hours"
                    value={newCourse.credit_hours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3"
                    min="1"
                    max="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Type
                  </label>
                  <select
                    name="course_type"
                    value={newCourse.course_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  {departmentLoading ? (
                    <DepartmentSelectSkeleton />
                  ) : (
                    <select
                      name="department"
                      value={newCourse.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || departmentLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Adding Course..." : "Add Course"}
                </button>
              </form>
            </div>
          </div>

          {/* Courses List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    All Courses ({courses.length})
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={fetchDepartments}
                      disabled={departmentLoading}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm"
                    >
                      {departmentLoading ? "Loading..." : "Refresh Depts"}
                    </button>
                    <button
                      onClick={fetchCourses}
                      disabled={isLoading}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {isLoading && courses.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No courses found. Add your first course!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {courses.map((course) => (
                    <div key={course.id} className="p-6 hover:bg-gray-50 transition-colors">
                      {editingCourse?.id === course.id ? (
                        // Edit Form
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              name="code"
                              value={editingCourse.code || ""}
                              onChange={handleEditInputChange}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Course Code"
                            />
                            <input
                              type="text"
                              name="name"
                              value={editingCourse.name || ""}
                              onChange={handleEditInputChange}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Course Name"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              name="credit_hours"
                              value={editingCourse.credit_hours || ""}
                              onChange={handleEditInputChange}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Credit Hours"
                            />
                            <select
                              name="course_type"
                              value={editingCourse.course_type || "theory"}
                              onChange={handleEditInputChange}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="theory">Theory</option>
                              <option value="lab">Lab</option>
                            </select>
                          </div>
                          {!departmentLoading && (
                            <select
                              name="department"
                              value={editingCourse.department || ""}
                              onChange={handleEditInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Department</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name} ({dept.code})
                                </option>
                              ))}
                            </select>
                          )}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(editingCourse)}
                              disabled={isLoading}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Course Display
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {renderCourseCode(course)}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                renderCourseType(course) === 'lab' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {renderCourseType(course)}
                              </span>
                              {renderCreditHours(course) && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {renderCreditHours(course)} credits
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {renderCourseName(course)}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Department: {renderDepartment(course)}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => startEditing(course)}
                              className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                              title="Edit course"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition-colors disabled:opacity-50"
                              title="Delete course"
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

export default Courses;