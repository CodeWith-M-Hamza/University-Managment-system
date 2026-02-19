
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { timetableService } from '../services/timetableService';
import departmentService from '../services/departmentService';
import teacherService from '../services/teacherService';
import courseService from '../services/courseService';
import classSectionAPI from '../services/classSectionAPI';
import roomService from '../services/roomService';
import { academicSessionAPI } from '../services/academicSessionAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  MapPin, 
  Filter, 
  RefreshCw,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  X,
  Zap
} from 'lucide-react';

const MasterTimetableView = () => {
  const [schedules, setSchedules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View state
  const [viewMode, setViewMode] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [hiddenSections, setHiddenSections] = useState(new Set());
  const [showConflicts, setShowConflicts] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    department: '',
    class_section: '',
    academic_session: '',
    course_type: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const timetableRef = useRef();

  // Enhanced time configuration - 1.5 hour slots
  const timeSlots = useMemo(() => [
    '08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00'
  ], []);

  const daysOfWeek = useMemo(() => [
    { value: 'monday', label: 'Mon', full: 'Monday' },
    { value: 'tuesday', label: 'Tue', full: 'Tuesday' },
    { value: 'wednesday', label: 'Wed', full: 'Wednesday' },
    { value: 'thursday', label: 'Thu', full: 'Thursday' },
    { value: 'friday', label: 'Fri', full: 'Friday' },
    { value: 'saturday', label: 'Sat', full: 'Saturday' }
  ], []);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [
        schedulesData,
        departmentsData,
        teachersData,
        coursesData,
        sectionsData,
        roomsData,
        sessionsData
      ] = await Promise.all([
        timetableService.getAllSchedules(),
        departmentService.getAll().catch(() => []),
        teacherService.getAll().catch(() => []),
        courseService.getAll().catch(() => []),
        classSectionAPI.getAllSections().catch(() => []),
        roomService.getAll().catch(() => []),
        academicSessionAPI.getAll().catch(() => [])
      ]);

      // Safe array handling
      const safeArray = (data) => {
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (data?.results && Array.isArray(data.results)) return data.results;
        return [];
      };

      setSchedules(safeArray(schedulesData));
      setDepartments(safeArray(departmentsData));
      setTeachers(safeArray(teachersData));
      setCourses(safeArray(coursesData));
      setSections(safeArray(sectionsData));
      setRooms(safeArray(roomsData));
      setSessions(safeArray(sessionsData));

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load timetable data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions - Define these BEFORE they're used in useMemo hooks
  const getTeacherName = (teacher) => {
    if (!teacher) return 'TBA';
    
    if (teacher.teacher_name) {
      return teacher.teacher_name;
    }
    
    if (teacher.name) {
      return teacher.name;
    }
    
    if (teacher.user && typeof teacher.user === 'object') {
      const firstName = teacher.user.first_name || '';
      const lastName = teacher.user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) return fullName;
    }
    
    if (teacher.username) {
      return teacher.username;
    }
    
    return 'TBA';
  };

  const getCourseName = (course) => {
    if (!course) return 'Unknown';
    return course.name || course.course_name || 'Unknown';
  };

  const getRoomNumber = (room) => {
    if (!room) return 'TBA';
    return room.room_number || room.name || 'TBA';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return timeString.slice(0, 5);
    } catch {
      return timeString;
    }
  };

  // Filter and process data - This must come BEFORE detectConflicts
  const { filteredSchedules, filteredSections, schedulesByDayAndSection } = useMemo(() => {
    const safeArray = (arr) => Array.isArray(arr) ? arr : [];
    
    // Filter sections
    let filteredSections = safeArray(sections);
    if (filters.department) {
      filteredSections = filteredSections.filter(section => 
        section.department?.id == filters.department
      );
    }
    if (filters.academic_session) {
      filteredSections = filteredSections.filter(section => 
        section.academic_session?.id == filters.academic_session
      );
    }

    // Filter schedules
    const filteredSchedules = safeArray(schedules).filter(schedule => {
      if (!schedule) return false;
      
      const matchesFilter = (
        (!filters.department || schedule.department?.id == filters.department) &&
        (!filters.class_section || schedule.class_section?.id == filters.class_section) &&
        (!filters.academic_session || schedule.academic_session?.id == filters.academic_session) &&
        (!filters.course_type || schedule.course?.course_type === filters.course_type)
      );

      if (!matchesFilter) return false;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          getCourseName(schedule.course).toLowerCase().includes(searchLower) ||
          getTeacherName(schedule.teacher).toLowerCase().includes(searchLower) ||
          getRoomNumber(schedule.room).toLowerCase().includes(searchLower) ||
          (schedule.class_section?.name || '').toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Group schedules by day and section
    const schedulesByDayAndSection = {};
    daysOfWeek.forEach(day => {
      schedulesByDayAndSection[day.value] = {};
      filteredSections.forEach(section => {
        if (!hiddenSections.has(section.id)) {
          schedulesByDayAndSection[day.value][section.id] = filteredSchedules
            .filter(schedule => 
              schedule.time_slot?.day === day.value && 
              schedule.class_section?.id === section.id
            )
            .sort((a, b) => (a.time_slot?.start_time || '').localeCompare(b.time_slot?.start_time || ''));
        }
      });
    });

    return { filteredSchedules, filteredSections, schedulesByDayAndSection };
  }, [schedules, sections, filters, searchTerm, hiddenSections, daysOfWeek, getCourseName, getTeacherName, getRoomNumber]);

  // Enhanced conflict detection - This comes AFTER filteredSchedules is defined
  const detectConflicts = useMemo(() => {
    const conflicts = [];
    const teacherTimeSlots = {};
    const roomTimeSlots = {};
    const sectionTimeSlots = {};

    filteredSchedules.forEach(schedule => {
      if (!schedule.time_slot) return;

      const day = schedule.time_slot.day;
      const startTime = schedule.time_slot.start_time;
      const endTime = schedule.time_slot.end_time;
      const teacherId = schedule.teacher?.id;
      const roomId = schedule.room?.id;
      const sectionId = schedule.class_section?.id;

      // Teacher conflict
      if (teacherId) {
        const key = `${teacherId}-${day}-${startTime}`;
        if (teacherTimeSlots[key]) {
          conflicts.push({
            type: 'teacher',
            message: `${getTeacherName(schedule.teacher)} is scheduled for multiple classes at the same time`,
            schedule1: teacherTimeSlots[key],
            schedule2: schedule
          });
        } else {
          teacherTimeSlots[key] = schedule;
        }
      }

      // Room conflict
      if (roomId) {
        const key = `${roomId}-${day}-${startTime}`;
        if (roomTimeSlots[key]) {
          conflicts.push({
            type: 'room',
            message: `${getRoomNumber(schedule.room)} is double-booked at the same time`,
            schedule1: roomTimeSlots[key],
            schedule2: schedule
          });
        } else {
          roomTimeSlots[key] = schedule;
        }
      }

      // Section conflict
      if (sectionId) {
        const key = `${sectionId}-${day}-${startTime}`;
        if (sectionTimeSlots[key]) {
          conflicts.push({
            type: 'section',
            message: `${schedule.class_section?.name} has overlapping classes`,
            schedule1: sectionTimeSlots[key],
            schedule2: schedule
          });
        } else {
          sectionTimeSlots[key] = schedule;
        }
      }
    });

    return conflicts;
  }, [filteredSchedules, getTeacherName, getRoomNumber]);

  // Rest of helper functions
  const calculatePosition = (startTime, endTime) => {
    const start = timeSlots.indexOf(startTime?.slice(0, 5));
    const end = timeSlots.indexOf(endTime?.slice(0, 5));
    if (start === -1 || end === -1) return { row: 1, span: 1 };
    
    return {
      row: start + 1,
      span: Math.max(1, end - start)
    };
  };

  const toggleSectionVisibility = (sectionId) => {
    setHiddenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      class_section: '',
      academic_session: '',
      course_type: ''
    });
    setSearchTerm('');
    setHiddenSections(new Set());
  };

  // Enhanced class card with conflict highlighting
  const ClassCard = ({ schedule, hasConflict = false }) => {
    const isConflict = hasConflict || detectConflicts.some(conflict => 
      conflict.schedule1?.id === schedule.id || conflict.schedule2?.id === schedule.id
    );

    return (
      <div
        className={`p-2 rounded-lg border-l-4 text-xs transition-all duration-200 hover:shadow-md ${
          schedule.course?.course_type === 'lab'
            ? `bg-gradient-to-r from-green-50 to-green-100 border-green-400 ${isConflict ? 'animate-pulse' : ''}`
            : `bg-gradient-to-r from-blue-50 to-blue-100 border-blue-400 ${isConflict ? 'animate-pulse' : ''}`
        } ${isConflict ? 'ring-2 ring-red-400' : ''}`}
      >
        {isConflict && (
          <div className="flex justify-end mb-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
          </div>
        )}
        <div className="font-semibold text-gray-900 truncate">
          {getCourseName(schedule.course)}
        </div>
        <div className="text-gray-600 truncate flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {getTeacherName(schedule.teacher)}
        </div>
        <div className="text-gray-500 truncate flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          {getRoomNumber(schedule.room)} • {schedule.class_section?.name}
        </div>
        <div className="text-gray-400 text-xs mt-1 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {formatTime(schedule.time_slot?.start_time)}-{formatTime(schedule.time_slot?.end_time)}
        </div>
      </div>
    );
  };

  // PRINT FUNCTIONALITY
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Academic Timetable - ${new Date().toLocaleDateString()}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .print-header h1 { 
              margin: 0; 
              color: #1f2937;
              font-size: 28px;
            }
            .print-header p { 
              margin: 5px 0 0 0; 
              color: #6b7280;
            }
            .print-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
            }
            .theory { background-color: #dbeafe; }
            .lab { background-color: #dcfce7; }
            .course-type {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            }
            .theory-badge { background-color: #bfdbfe; color: #1e40af; }
            .lab-badge { background-color: #bbf7d0; color: #166534; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Academic Timetable</h1>
            <p>Master Schedule - Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="print-info">
            <div><strong>Total Classes:</strong> ${filteredSchedules.length}</div>
            <div><strong>Date Range:</strong> Week of ${currentDate.toLocaleDateString()}</div>
            <div><strong>Active Sections:</strong> ${filteredSections.length}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Course</th>
                <th>Instructor</th>
                <th>Room</th>
                <th>Section</th>
                <th>Type</th>
                <th>Day</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSchedules.map(schedule => `
                <tr class="${schedule.course?.course_type === 'lab' ? 'lab' : 'theory'}">
                  <td>${formatTime(schedule.time_slot?.start_time)} - ${formatTime(schedule.time_slot?.end_time)}</td>
                  <td>
                    <strong>${getCourseName(schedule.course)}</strong><br>
                    <small>${schedule.course?.code || ''}</small>
                  </td>
                  <td>${getTeacherName(schedule.teacher)}</td>
                  <td>${getRoomNumber(schedule.room)}</td>
                  <td>${schedule.class_section?.name} (Sem ${schedule.class_section?.semester || 'N/A'})</td>
                  <td>
                    <span class="course-type ${schedule.course?.course_type === 'lab' ? 'lab-badge' : 'theory-badge'}">
                      ${schedule.course?.course_type || 'theory'}
                    </span>
                  </td>
                  <td class="capitalize">${schedule.time_slot?.day}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
            Generated by Academic Timetable System
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // EXPORT FUNCTIONALITY
  const handleExport = (format = 'csv') => {
    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'json') {
      exportToJSON();
    }
  };

  const exportToCSV = () => {
    const headers = ['Day', 'Time', 'Course Code', 'Course Name', 'Instructor', 'Room', 'Section', 'Semester', 'Type'];
    
    const csvData = filteredSchedules.map(schedule => [
      schedule.time_slot?.day || '',
      `${formatTime(schedule.time_slot?.start_time)}-${formatTime(schedule.time_slot?.end_time)}`,
      schedule.course?.code || '',
      getCourseName(schedule.course),
      getTeacherName(schedule.teacher),
      getRoomNumber(schedule.room),
      schedule.class_section?.name || '',
      schedule.class_section?.semester || '',
      schedule.course?.course_type || 'theory'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `timetable_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const exportData = {
      generated: new Date().toISOString(),
      filters: filters,
      stats: {
        totalClasses: filteredSchedules.length,
        theoryClasses: filteredSchedules.filter(s => s.course?.course_type === 'theory').length,
        labSessions: filteredSchedules.filter(s => s.course?.course_type === 'lab').length,
        activeSections: filteredSections.length
      },
      schedules: filteredSchedules.map(schedule => ({
        day: schedule.time_slot?.day,
        time: {
          start: schedule.time_slot?.start_time,
          end: schedule.time_slot?.end_time
        },
        course: {
          code: schedule.course?.code,
          name: getCourseName(schedule.course),
          type: schedule.course?.course_type || 'theory'
        },
        instructor: getTeacherName(schedule.teacher),
        room: getRoomNumber(schedule.room),
        section: {
          name: schedule.class_section?.name,
          semester: schedule.class_section?.semester
        },
        department: schedule.department?.name
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `timetable_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Enhanced print for weekly view
  const handlePrintWeeklyView = () => {
    const printWindow = window.open('', '_blank');
    
    const weeklyViewContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Weekly Timetable - ${new Date().toLocaleDateString()}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .print-header h1 { 
              margin: 0; 
              color: #1f2937;
              font-size: 28px;
            }
            .weekly-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .weekly-table th, .weekly-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
              vertical-align: top;
            }
            .weekly-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .time-slot {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .class-cell {
              margin: 2px 0;
              padding: 4px;
              border-radius: 4px;
              font-size: 11px;
              text-align: left;
            }
            .theory { background-color: #dbeafe; border-left: 3px solid #3b82f6; }
            .lab { background-color: #dcfce7; border-left: 3px solid #10b981; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Weekly Academic Timetable</h1>
            <p>Week of ${currentDate.toLocaleDateString()} | ${filteredSchedules.length} Total Classes</p>
          </div>

          <table class="weekly-table">
            <thead>
              <tr>
                <th style="width: 80px;">Time</th>
                ${daysOfWeek.map(day => `
                  <th>${day.full}</th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${timeSlots.map(time => `
                <tr>
                  <td class="time-slot">${time}</td>
                  ${daysOfWeek.map(day => {
                    const hourSchedules = filteredSchedules.filter(schedule => {
                      if (schedule.time_slot?.day !== day.value) return false;
                      const scheduleStart = schedule.time_slot?.start_time?.slice(0, 5);
                      return scheduleStart === time;
                    });

                    return `
                      <td>
                        ${hourSchedules.map(schedule => `
                          <div class="class-cell ${schedule.course?.course_type === 'lab' ? 'lab' : 'theory'}">
                            <strong>${getCourseName(schedule.course)}</strong><br>
                            ${getRoomNumber(schedule.room)} | ${schedule.class_section?.name}<br>
                            <small>${getTeacherName(schedule.teacher)}</small>
                          </div>
                        `).join('')}
                        ${hourSchedules.length === 0 ? '&nbsp;' : ''}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
            Generated by Academic Timetable System
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(weeklyViewContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" ref={timetableRef}>
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Academic Timetable
                </h1>
                <p className="text-gray-600 text-sm">Smart schedule management with conflict detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Print Button with Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={handlePrint}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    Print List View
                  </button>
                  <button
                    onClick={handlePrintWeeklyView}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                  >
                    Print Weekly View
                  </button>
                </div>
              </div>

              {/* Export Button with Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls Bar */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-gray-200/50 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
                {[
                  { mode: 'weekly', icon: Grid, label: 'Weekly' },
                  { mode: 'daily', icon: Calendar, label: 'Daily' },
                  { mode: 'list', icon: List, label: 'List' }
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      viewMode === mode
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Week Navigation */}
              {viewMode === 'weekly' && (
                <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm ring-1 ring-gray-200">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center px-3 py-1 bg-blue-50 rounded-md">
                    Week of {currentDate.toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 bg-white/80 backdrop-blur-sm transition-all duration-200"
                />
              </div>
              
              {/* Conflict Toggle */}
              <button
                onClick={() => setShowConflicts(!showConflicts)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  showConflicts 
                    ? 'bg-red-100 text-red-700 ring-1 ring-red-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  {showConflicts ? 'Hide Conflicts' : 'Show Conflicts'}
                </span>
                {detectConflicts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {detectConflicts.length}
                  </span>
                )}
              </button>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  showFilters ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:shadow-md'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters</span>
              </button>

              <button
                onClick={loadMasterData}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>

          {/* Enhanced Filters */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <select
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Session</label>
                  <select
                    name="academic_session"
                    value={filters.academic_session}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Sessions</option>
                    {sessions.map(session => (
                      <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Type</label>
                  <select
                    name="course_type"
                    value={filters.course_type}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Types</option>
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>

                <div className="flex items-end space-x-3">
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-2.5 rounded-xl hover:shadow-md transition-all duration-200 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conflict Alert Banner */}
      {showConflicts && detectConflicts.length > 0 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <span className="font-semibold text-red-800">
                    {detectConflicts.length} schedule conflict{detectConflicts.length > 1 ? 's' : ''} detected
                  </span>
                  <p className="text-red-600 text-sm">
                    Check overlapping classes for teachers, rooms, or sections
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConflicts(false)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />
        )}

        {/* Enhanced Section Visibility Controls */}
        {viewMode === 'weekly' && filteredSections.length > 0 && (
          <div className="mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Section Visibility</h3>
                <span className="bg-blue-100 text-blue-700 text-sm px-2.5 py-1 rounded-full">
                  {filteredSections.length - hiddenSections.size} visible
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setHiddenSections(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Show All
                </button>
                <button
                  onClick={() => setHiddenSections(new Set(filteredSections.map(s => s.id)))}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
                >
                  Hide All
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {filteredSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => toggleSectionVisibility(section.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm border transition-all duration-200 ${
                    hiddenSections.has(section.id)
                      ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:shadow-md'
                  }`}
                >
                  {hiddenSections.has(section.id) ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="font-medium">{section.name}</span>
                  <span className="text-xs opacity-75">Sem {section.semester}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Weekly Timetable View */}
        {viewMode === 'weekly' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <th className="w-24 p-4 border-r border-gray-200/60 text-sm font-semibold text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Time</span>
                      </div>
                    </th>
                    {daysOfWeek.map(day => {
                      const dayClasses = filteredSchedules.filter(s => s.time_slot?.day === day.value);
                      const conflictCount = detectConflicts.filter(conflict => 
                        conflict.schedule1?.time_slot?.day === day.value || 
                        conflict.schedule2?.time_slot?.day === day.value
                      ).length;

                      return (
                        <th key={day.value} className="p-4 border-r border-gray-200/60 last:border-r-0">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-gray-900">{day.full}</div>
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mt-1">
                              <span>{dayClasses.length} classes</span>
                              {conflictCount > 0 && (
                                <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs">
                                  {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={time} className="border-t border-gray-200/60 hover:bg-gray-50/50 transition-colors">
                      <td className="w-24 p-4 border-r border-gray-200/60 bg-gradient-to-b from-gray-50 to-white">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900">{time}</div>
                          <div className="text-xs text-gray-500 mt-1">1.5 hrs</div>
                        </div>
                      </td>
                      {daysOfWeek.map(day => {
                        const hourSchedules = filteredSchedules.filter(schedule => {
                          if (schedule.time_slot?.day !== day.value) return false;
                          const scheduleStart = schedule.time_slot?.start_time?.slice(0, 5);
                          return scheduleStart === time;
                        });

                        return (
                          <td key={day.value} className="p-2 border-r border-gray-200/60 last:border-r-0 align-top">
                            <div className="min-h-[100px] space-y-2">
                              {hourSchedules.map((schedule, index) => (
                                <ClassCard 
                                  key={index} 
                                  schedule={schedule}
                                  hasConflict={showConflicts && detectConflicts.some(conflict => 
                                    conflict.schedule1?.id === schedule.id || conflict.schedule2?.id === schedule.id
                                  )}
                                />
                              ))}
                              {hourSchedules.length === 0 && (
                                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                                  No class
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredSchedules.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes scheduled</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Try adjusting your filters or search terms. You can also check if all sections are visible.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Daily View */}
        {viewMode === 'daily' && (
          <div className="space-y-6">
            {daysOfWeek.map(day => {
              const daySchedules = filteredSchedules.filter(s => s.time_slot?.day === day.value);
              const dayConflicts = detectConflicts.filter(conflict => 
                conflict.schedule1?.time_slot?.day === day.value || 
                conflict.schedule2?.time_slot?.day === day.value
              );

              if (daySchedules.length === 0 && filters.day_of_week && filters.day_of_week !== day.value) {
                return null;
              }

              return (
                <div key={day.value} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{day.full}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-gray-600 text-sm">{daySchedules.length} classes scheduled</p>
                            {dayConflicts.length > 0 && (
                              <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{dayConflicts.length} conflict{dayConflicts.length > 1 ? 's' : ''}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-400 rounded-full ring-2 ring-blue-200"></div>
                          <span>Theory</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full ring-2 ring-green-200"></div>
                          <span>Lab</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {daySchedules.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes scheduled for {day.full}</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        There are no classes matching your current filters for this day.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="space-y-4">
                        {daySchedules.map((schedule, index) => {
                          const hasConflict = showConflicts && detectConflicts.some(conflict => 
                            conflict.schedule1?.id === schedule.id || conflict.schedule2?.id === schedule.id
                          );

                          return (
                            <div
                              key={index}
                              className={`p-5 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                                schedule.course?.course_type === 'lab'
                                  ? `bg-gradient-to-r from-green-50 to-green-100 border-green-400 ${hasConflict ? 'ring-2 ring-red-400' : ''}`
                                  : `bg-gradient-to-r from-blue-50 to-blue-100 border-blue-400 ${hasConflict ? 'ring-2 ring-red-400' : ''}`
                              } ${hasConflict ? 'animate-pulse' : ''}`}
                            >
                              {hasConflict && (
                                <div className="flex justify-between items-start mb-3">
                                  <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Schedule Conflict</span>
                                  </span>
                                  <div className="text-right">
                                    <div className="font-semibold text-gray-900 text-lg">
                                      {formatTime(schedule.time_slot?.start_time)} - {formatTime(schedule.time_slot?.end_time)}
                                    </div>
                                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                                      schedule.course?.course_type === 'lab'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {schedule.course?.course_type || 'theory'}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {!hasConflict && (
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg">
                                      {getCourseName(schedule.course)}
                                    </h4>
                                    <p className="text-gray-600 text-sm">{schedule.course?.code}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-gray-900 text-lg">
                                      {formatTime(schedule.time_slot?.start_time)} - {formatTime(schedule.time_slot?.end_time)}
                                    </div>
                                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                                      schedule.course?.course_type === 'lab'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {schedule.course?.course_type || 'theory'}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center text-gray-600 bg-white/50 p-3 rounded-lg">
                                  <Users className="h-4 w-4 mr-3 text-blue-500" />
                                  <div>
                                    <div className="font-medium text-gray-900">Instructor</div>
                                    <div className="truncate">{getTeacherName(schedule.teacher)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-600 bg-white/50 p-3 rounded-lg">
                                  <MapPin className="h-4 w-4 mr-3 text-green-500" />
                                  <div>
                                    <div className="font-medium text-gray-900">Room</div>
                                    <div className="truncate">{getRoomNumber(schedule.room)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-600 bg-white/50 p-3 rounded-lg">
                                  <BookOpen className="h-4 w-4 mr-3 text-purple-500" />
                                  <div>
                                    <div className="font-medium text-gray-900">Section</div>
                                    <div className="truncate">{schedule.class_section?.name}</div>
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-600 bg-white/50 p-3 rounded-lg">
                                  <Calendar className="h-4 w-4 mr-3 text-orange-500" />
                                  <div>
                                    <div className="font-medium text-gray-900">Semester</div>
                                    <div className="truncate">Sem {schedule.class_section?.semester || 'N/A'}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Conflict Details */}
                              {hasConflict && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                  <div className="text-sm text-red-700">
                                    <strong>Conflict Details:</strong>
                                    {detectConflicts
                                      .filter(conflict => 
                                        conflict.schedule1?.id === schedule.id || conflict.schedule2?.id === schedule.id
                                      )
                                      .map((conflict, idx) => (
                                        <div key={idx} className="mt-1">
                                          {conflict.message}
                                        </div>
                                      ))
                                    }
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty State for Daily View when no filters match */}
            {filteredSchedules.length === 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-12 text-center">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No classes found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  No classes match your current filters. Try adjusting your search terms or filter criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced List View */}
        {viewMode === 'list' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            {/* List View Header */}
            <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <List className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Class List View</h3>
                    <p className="text-gray-600 text-sm">
                      {filteredSchedules.length} classes • {filteredSections.length} sections • {detectConflicts.length} conflicts
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {detectConflicts.length > 0 && (
                    <button
                      onClick={() => setShowConflicts(!showConflicts)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        showConflicts 
                          ? 'bg-red-100 text-red-700 ring-1 ring-red-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>{showConflicts ? 'Hide Conflicts' : 'Show Conflicts'}</span>
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {detectConflicts.length}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Time</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {filteredSchedules.map((schedule, index) => {
                    const hasConflict = showConflicts && detectConflicts.some(conflict => 
                      conflict.schedule1?.id === schedule.id || conflict.schedule2?.id === schedule.id
                    );

                    return (
                      <tr 
                        key={index} 
                        className={`transition-all duration-200 ${
                          hasConflict 
                            ? 'bg-red-50/50 hover:bg-red-100/50 animate-pulse' 
                            : 'hover:bg-gray-50/50'
                        } ${hasConflict ? 'ring-1 ring-red-200' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatTime(schedule.time_slot?.start_time)} - {formatTime(schedule.time_slot?.end_time)}
                          </div>
                          <div className="text-xs text-gray-500">1.5 hours</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              schedule.course?.course_type === 'lab' ? 'bg-green-400' : 'bg-blue-400'
                            }`}></div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {getCourseName(schedule.course)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {schedule.course?.code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {getTeacherName(schedule.teacher)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {getRoomNumber(schedule.room)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {schedule.class_section?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Sem {schedule.class_section?.semester || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            schedule.course?.course_type === 'lab' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {schedule.course?.course_type || 'theory'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 capitalize font-medium">
                            {schedule.time_slot?.day}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {hasConflict ? (
                            <div className="flex items-center space-x-2 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-xs font-medium">Conflict</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-xs font-medium">OK</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredSchedules.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <List className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No classes found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  No classes match your current filters. Try adjusting your search terms or filter criteria.
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => setViewMode('weekly')}
                    className="px-6 py-3 bg-white text-gray-700 rounded-xl border border-gray-300 hover:shadow-lg transition-all duration-200"
                  >
                    Switch to Weekly View
                  </button>
                </div>
              </div>
            )}

            {/* List View Footer */}
            {filteredSchedules.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200/60 bg-gray-50/50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Showing {filteredSchedules.length} classes</span>
                    {detectConflicts.length > 0 && (
                      <span className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{detectConflicts.length} schedule conflict{detectConflicts.length > 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Lab: {filteredSchedules.filter(s => s.course?.course_type === 'lab').length}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Theory: {filteredSchedules.filter(s => s.course?.course_type === 'theory').length}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Summary Stats */}
        {filteredSchedules.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="text-3xl font-bold">{filteredSchedules.length}</div>
              <div className="text-blue-100 text-sm">Total Classes</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="text-3xl font-bold">
                {filteredSchedules.filter(s => s.course?.course_type === 'theory').length}
              </div>
              <div className="text-green-100 text-sm">Theory Classes</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="text-3xl font-bold">
                {filteredSchedules.filter(s => s.course?.course_type === 'lab').length}
              </div>
              <div className="text-purple-100 text-sm">Lab Sessions</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="text-3xl font-bold">{filteredSections.length}</div>
              <div className="text-orange-100 text-sm">Active Sections</div>
            </div>
            <div className={`p-6 rounded-2xl text-white shadow-lg ${
              detectConflicts.length > 0 
                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                : 'bg-gradient-to-br from-green-500 to-green-600'
            }`}>
              <div className="text-3xl font-bold flex items-center space-x-2">
                <span>{detectConflicts.length}</span>
                {detectConflicts.length === 0 ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
              <div className="text-opacity-90 text-sm">
                {detectConflicts.length === 0 ? 'No Conflicts' : 'Schedule Conflicts'}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={loadMasterData}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="font-medium">Refresh Data</span>
          </button>
          
          <div className="flex items-center space-x-2 bg-white rounded-xl p-2 shadow-sm ring-1 ring-gray-200">
            {['weekly', 'daily', 'list'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === mode 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)} View
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Data Last Updated */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/60">
            <Zap className="h-4 w-4 text-green-500" />
            <p className="text-sm text-gray-600">
              Data last updated: <span className="font-medium">{new Date().toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterTimetableView;
