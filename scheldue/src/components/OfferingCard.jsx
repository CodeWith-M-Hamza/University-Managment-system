
import React, { useEffect, useState } from 'react';

const OfferingCard = ({ 
  offering, 
  course, 
  onEdit, 
  onDelete, 
  onView,
  showActions = true,
  showTeacher = true,
  className = "",
  variant = "default"
}) => {
  const data = offering || course;
  
  // Debug: log teacher data specifically
  React.useEffect(() => {
    if (data && showTeacher) {
      console.log('🔍 OFFERINGCARD TEACHER DEBUG:', {
        fullData: data,
        teacherObject: data.teacher,
        teacherName: data.teacher_name,
        teacherInfo: data.teacher_info,
        teacherId: data.teacher_id,
        // Check all teacher-related properties
        teacherKeys: Object.keys(data).filter(key => key.toLowerCase().includes('teacher'))
      });
    }
  }, [data, showTeacher]);

  // If neither prop is provided, show error card
  if (!data) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm">No data provided</p>
        </div>
      </div>
    );
  }

  // Enhanced helper functions
  const getCourseCode = () => {
    const code = data.course?.code || data.code || data.course_code || data.courseCode || data.subject_code;
    return code || "N/A";
  };

  const getCourseName = () => {
    const name = data.course?.name || data.name || data.course_name || data.courseName || data.title || data.subject_name;
    if (typeof name === 'object') {
      return name.display_name || name.full_name || name.title || name.name || "Unnamed Course";
    }
    return name || "No Name Provided";
  };

  const getCourseType = () => {
    const type = data.course?.course_type || data.course_type || data.type || data.courseType || data.subject_type;
    return (type || "theory").toLowerCase();
  };

  const getCourseTypeColor = (courseType) => {
    const type = courseType.toLowerCase();
    const colors = {
      'theory': 'bg-blue-100 text-blue-800 border border-blue-200',
      'lab': 'bg-green-100 text-green-800 border border-green-200',
      'practical': 'bg-orange-100 text-orange-800 border border-orange-200',
      'workshop': 'bg-purple-100 text-purple-800 border border-purple-200',
      'lecture': 'bg-blue-100 text-blue-800 border border-blue-200',
      'tutorial': 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getCreditHours = () => {
    const hours = data.course?.credit_hours || data.credit_hours || data.credits || data.creditHours || data.credit_hour;
    return hours || hours === 0 ? hours : "N/A";
  };

  const getDepartmentName = () => {
    // 1. First check for direct department fields
    if (data.department_name) {
      return data.department_name;
    }
    
    // 2. Check if we have course -> department -> name
    if (data.course?.department?.name) {
      return data.course.department.name;
    }
    
    // 3. Check if we have direct department object with name
    if (data.department?.name) {
      return data.department.name;
    }
    
    // 4. Check if department is a simple string
    if (typeof data.department === 'string') {
      return data.department;
    }
    
    return "No Department";
  };

  // UPDATED: Better teacher name detection
  const getTeacherInfo = () => {
    // Debug current teacher data
    console.log('🔍 getTeacherInfo() - Checking data:', {
      teacher: data.teacher,
      teacher_name: data.teacher_name,
      teacher_info: data.teacher_info,
      teacher_id: data.teacher_id
    });

    // 1. Check if we have teacher_name directly from API
    if (data.teacher_name && data.teacher_name !== "Not Assigned" && data.teacher_name !== "Unknown Teacher") {
      console.log('✅ Using teacher_name:', data.teacher_name);
      const nameParts = data.teacher_name.split(' ');
      return {
        firstName: nameParts[0] || "Teacher",
        lastName: nameParts.slice(1).join(' ') || "",
        employeeId: data.teacher_id || data.teacher?.employee_id || "N/A",
        id: data.teacher_id || data.teacher?.id
      };
    }

    // 2. Check if we have full teacher object with user data
    if (data.teacher && data.teacher.user) {
      console.log('✅ Using teacher.user data:', data.teacher.user);
      const firstName = data.teacher.user.first_name;
      const lastName = data.teacher.user.last_name;
      
      // If names are empty, try to get from email or use fallback
      if (!firstName && !lastName) {
        if (data.teacher.user.email) {
          const emailName = data.teacher.user.email.split('@')[0];
          return {
            firstName: emailName,
            lastName: "",
            employeeId: data.teacher.employee_id || "N/A",
            id: data.teacher.id
          };
        }
      }
      
      return {
        firstName: firstName || "Teacher",
        lastName: lastName || "",
        employeeId: data.teacher.employee_id || "N/A",
        id: data.teacher.id
      };
    }

    // 3. Check if we have teacher_info object
    if (data.teacher_info) {
      console.log('✅ Using teacher_info:', data.teacher_info);
      return {
        firstName: data.teacher_info.first_name || "Teacher",
        lastName: data.teacher_info.last_name || "",
        employeeId: data.teacher_info.employee_id || "N/A",
        id: data.teacher_info.id
      };
    }

    // 4. Check if teacher exists but has minimal data
    if (data.teacher) {
      console.log('✅ Using minimal teacher data:', data.teacher);
      return {
        firstName: data.teacher.first_name || "Teacher",
        lastName: data.teacher.last_name || "",
        employeeId: data.teacher.employee_id || "N/A",
        id: data.teacher.id
      };
    }

    // 5. Check if we have teacher_id but no other data (teacher exists but not loaded)
    if (data.teacher_id) {
      console.log('⚠️ Teacher ID exists but no teacher data');
      return {
        firstName: "Teacher",
        lastName: `#${data.teacher_id}`,
        employeeId: "Loading...",
        id: data.teacher_id
      };
    }

    console.log('❌ No teacher data found');
    return null;
  };

  const getIsCore = () => {
    return data.is_core || data.core || data.is_core_course || data.core_course || false;
  };

  const getId = () => {
    return data.id || data.course_id || data.offering_id || data.subject_id;
  };

  const getSemester = () => {
    const semester = data.semester || data.course?.semester || data.semester_number || data.term;
    return semester || semester === 0 ? semester : "N/A";
  };

  const getAcademicYear = () => {
    const year = data.academic_year || data.course?.academic_year || data.year || data.academic_year_range;
    return year || "N/A";
  };

  const getStatus = () => {
    return (data.status || data.course?.status || "active").toLowerCase();
  };

  const getStatusColor = () => {
    const status = getStatus();
    const colors = {
      'active': 'bg-green-100 text-green-800 border border-green-200',
      'inactive': 'bg-gray-100 text-gray-800 border border-gray-200',
      'draft': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'archived': 'bg-red-100 text-red-800 border border-red-200',
      'published': 'bg-blue-100 text-blue-800 border border-blue-200',
      'pending': 'bg-orange-100 text-orange-800 border border-orange-200'
    };
    return colors[status] || colors.inactive;
  };

  const getSection = () => {
    return data.section || data.section_name || data.section_number || "N/A";
  };

  const teacherInfo = getTeacherInfo();

  // Data validation helper
  const hasValidData = () => {
    return getCourseCode() !== "N/A" && getCourseName() !== "No Name Provided";
  };

  // Format teacher display name
  const getTeacherDisplayName = () => {
    if (!teacherInfo) return "Not assigned";
    
    const { firstName, lastName, employeeId } = teacherInfo;
    const fullName = `${firstName} ${lastName}`.trim();
    
    if (fullName === "Teacher") {
      return employeeId ? `Teacher (${employeeId})` : "Teacher Assigned";
    }
    
    return employeeId ? `${fullName} (${employeeId})` : fullName;
  };

  // Compact variant for dense layouts
  if (variant === "compact") {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-gray-300 ${className} ${
        !hasValidData() ? 'border-yellow-300 bg-yellow-50' : ''
      }`}>
        {!hasValidData() && (
          <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded mb-2 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Incomplete data
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate" title={getCourseCode()}>
              {getCourseCode()}
            </h4>
            <p className="text-xs text-gray-600 truncate" title={getCourseName()}>
              {getCourseName()}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-1 ml-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getCourseTypeColor(getCourseType())}`}>
              {getCourseType().charAt(0).toUpperCase()}
            </span>
            {getIsCore() && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                Core
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
          <span>{getCreditHours()} credits</span>
          <span className="truncate max-w-[100px]" title={getDepartmentName()}>
            {getDepartmentName()}
          </span>
        </div>

        {showTeacher && (
          <div className="text-xs text-gray-600 border-t pt-2">
            <span className={!teacherInfo ? "text-yellow-600 italic" : "text-gray-700"}>
              {getTeacherDisplayName()}
            </span>
          </div>
        )}

        {showActions && (
          <div className="flex justify-end space-x-1 mt-2 pt-2 border-t">
            {onView && (
              <button
                onClick={() => onView(data)}
                className="inline-flex items-center p-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="View details"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(data)}
                className="inline-flex items-center p-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                title="Edit"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(getId())}
                className="inline-flex items-center p-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default and Detailed variants
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300 ${className} ${
      !hasValidData() ? 'border-yellow-300 bg-yellow-50' : ''
    }`}>
      
      {/* Data Warning */}
      {!hasValidData() && (
        <div className="text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          This course has incomplete data
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 truncate" title={getCourseCode()}>
            {getCourseCode()}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2 break-words mt-1" title={getCourseName()}>
            {getCourseName()}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2 ml-3">
          {/* Status Badge */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatus().charAt(0).toUpperCase() + getStatus().slice(1)}
          </span>
          
          <div className="flex flex-col items-end space-y-1">
            {getIsCore() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                Core Course
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCourseTypeColor(getCourseType())}`}>
              {getCourseType().toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Credit Hours:</span>
          <span className="font-semibold text-gray-900">{getCreditHours()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Department:</span>
          <span className="font-semibold text-gray-900 text-right max-w-[160px] truncate" title={getDepartmentName()}>
            {getDepartmentName()}
          </span>
        </div>

        {/* Section Information */}
        <div className="flex justify-between items-center">
          <span className="font-medium">Section:</span>
          <span className="font-semibold text-gray-900">{getSection()}</span>
        </div>
        
        {/* Additional Info for Detailed View */}
        {variant === "detailed" && (
          <>
            <div className="flex justify-between items-center">
              <span className="font-medium">Semester:</span>
              <span className="font-semibold text-gray-900">{getSemester()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Academic Year:</span>
              <span className="font-semibold text-gray-900">{getAcademicYear()}</span>
            </div>
          </>
        )}
      </div>

      {/* Teacher Assignment */}
      {showTeacher && (
        <div className="border-t border-gray-100 pt-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Assigned Teacher:</p>
              <p className="text-sm text-gray-600 truncate">
                {teacherInfo ? (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {getTeacherDisplayName()}
                  </span>
                ) : (
                  <span className="text-yellow-600 italic flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Not assigned
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            {onView && (
              <button
                onClick={() => onView(data)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(data)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(getId())}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferingCard;