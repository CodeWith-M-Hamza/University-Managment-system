
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   AcademicCapIcon, 
//   UserGroupIcon, 
//   BuildingOfficeIcon, 
//   ClockIcon,
//   CalendarDaysIcon,
//   PlusIcon,
//   PencilIcon,
//   TrashIcon,
//   EyeIcon,
//   ChartBarIcon,
//   UsersIcon,
//   BookOpenIcon,
//   HomeIcon,
//   ArrowPathIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon
// } from '@heroicons/react/24/outline';
// import CourseService from '../services/courseService';
// import TeacherService from '../services/teacherService';
// import DepartmentService from '../services/departmentService';
// import RoomService from '../services/roomService';
// import TimeSlotService from '../services/timeslotService';
// import ScheduleService from '../services/scheduleService';

// const Dashboard = () => {
//   const [stats, setStats] = useState({
//     courses: 0,
//     teachers: 0,
//     departments: 0,
//     rooms: 0,
//     timeslots: 0,
//     schedules: 0
//   });
  
//   const [recentCourses, setRecentCourses] = useState([]);
//   const [recentTeachers, setRecentTeachers] = useState([]);
//   const [recentSchedules, setRecentSchedules] = useState([]);
//   const [upcomingClasses, setUpcomingClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [systemStatus, setSystemStatus] = useState({
//     conflicts: 0,
//     availableRooms: 0,
//     teacherAvailability: 0
//   });

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const [
//         coursesRes, 
//         teachersRes, 
//         departmentsRes, 
//         roomsRes, 
//         timeslotsRes,
//         schedulesRes
//       ] = await Promise.all([
//         CourseService.getAll(),
//         TeacherService.getAll(),
//         DepartmentService.getAll(),
//         RoomService.getAll(),
//         TimeSlotService.getAll(),
//         ScheduleService.getAll()
//       ]);

//       setStats({
//         courses: coursesRes.data.length,
//         teachers: teachersRes.data.length,
//         departments: departmentsRes.data.length,
//         rooms: roomsRes.data.length,
//         timeslots: timeslotsRes.data.length,
//         schedules: schedulesRes.data.length
//       });

//       // Get recent items
//       setRecentCourses(coursesRes.data.slice(-4));
//       setRecentTeachers(teachersRes.data.slice(-4));
//       setRecentSchedules(schedulesRes.data.slice(-5));
      
//       // Generate upcoming classes
//       generateUpcomingClasses(schedulesRes.data);
      
//       // Calculate system status
//       calculateSystemStatus(schedulesRes.data, roomsRes.data, teachersRes.data);

//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

// const generateUpcomingClasses = (schedules) => {
//   // Get current time for realistic upcoming classes
//   const now = new Date();
//   const currentHour = now.getHours();
  
//   console.log('Current hour:', currentHour);
//   console.log('Total schedules:', schedules.length);
  
//   // Filter schedules that are upcoming (simplified logic)
//   const upcoming = schedules
//     .filter(schedule => {
//       // Debug each schedule
//       console.log('Schedule:', schedule);
//       console.log('Time slot:', schedule.time_slot);
      
//       if (!schedule.time_slot?.start_time) {
//         console.log('No start time - filtered out');
//         return false;
//       }
      
//       const scheduleHour = schedule.time_slot.start_time ? 
//         parseInt(schedule.time_slot.start_time.split(':')[0]) : 0;
      
//       console.log('Parsed schedule hour:', scheduleHour);
//       console.log('Should include?', scheduleHour >= currentHour);
      
//       return scheduleHour >= currentHour;
//     })
//     .slice(0, 3) // Take only 3 upcoming classes
//     .map(schedule => ({
//       ...schedule,
//       time: schedule.time_slot ? 
//         `${schedule.time_slot.start_time} - ${schedule.time_slot.end_time}` : 
//         "Time not set",
//       status: "Upcoming"
//     }));
  
//   console.log('Final upcoming classes:', upcoming);
//   setUpcomingClasses(upcoming);
// };

//   const calculateSystemStatus = (schedules, rooms, teachers) => {
//     // Calculate real conflicts
//     const conflicts = calculateScheduleConflicts(schedules);
    
//     // Calculate available rooms (simplified)
//     const availableRooms = calculateAvailableRooms(rooms, schedules);
    
//     // Calculate teacher availability
//     const teacherAvailability = calculateTeacherAvailability(teachers, schedules);

//     setSystemStatus({
//       conflicts,
//       availableRooms,
//       teacherAvailability
//     });
//   };

//   const calculateScheduleConflicts = (schedules) => {
//     if (!schedules || schedules.length === 0) return 0;
    
//     let conflicts = 0;
//     const timeSlotMap = new Map();
    
//     schedules.forEach(schedule => {
//       const timeSlotId = schedule.time_slot?.id;
//       const roomId = schedule.room?.id;
      
//       if (timeSlotId && roomId) {
//         const key = `${timeSlotId}_${roomId}`;
//         if (timeSlotMap.has(key)) {
//           conflicts++;
//         } else {
//           timeSlotMap.set(key, schedule);
//         }
//       }
//     });
    
//     return conflicts;
//   };

//   const calculateAvailableRooms = (rooms, schedules) => {
//     if (!rooms || rooms.length === 0) return 0;
    
//     // Count unique rooms used in schedules
//     const usedRooms = new Set();
//     schedules.forEach(schedule => {
//       if (schedule.room?.id) {
//         usedRooms.add(schedule.room.id);
//       }
//     });
    
//     return Math.max(0, rooms.length - usedRooms.size);
//   };

//   const calculateTeacherAvailability = (teachers, schedules) => {
//     if (!teachers || teachers.length === 0) return 0;
    
//     const MAX_WORKLOAD = 6; // Maximum reasonable workload
    
//     // Count schedules per teacher
//     const teacherScheduleCount = new Map();
//     schedules.forEach(schedule => {
//       const teacherId = schedule.teacher?.id;
//       if (teacherId) {
//         teacherScheduleCount.set(teacherId, (teacherScheduleCount.get(teacherId) || 0) + 1);
//       }
//     });
    
//     // Calculate percentage of teachers with reasonable workload
//     const availableTeachers = teachers.filter(teacher => {
//       const workload = teacherScheduleCount.get(teacher.id) || 0;
//       return workload <= MAX_WORKLOAD;
//     });
    
//     return Math.round((availableTeachers.length / teachers.length) * 100);
//   };

//   const StatCard = ({ title, value, icon: Icon, color, href, description, trend }) => (
//     <Link to={href} className="block group">
//       <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group-hover:border-blue-200">
//         <div className="flex items-center justify-between">
//           <div className="flex-1">
//             <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
//             <p className="text-3xl font-bold text-gray-900">{loading ? '...' : value}</p>
//             {description && (
//               <p className="text-xs text-gray-500 mt-2">{description}</p>
//             )}
//             {trend && (
//               <div className={`inline-flex items-center mt-2 text-xs font-medium ${
//                 trend > 0 ? 'text-green-600' : 'text-red-600'
//               }`}>
//                 {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
//               </div>
//             )}
//           </div>
//           <div className={`p-4 rounded-2xl ${color} transition-transform duration-300 group-hover:scale-110`}>
//             <Icon className="h-7 w-7 text-white" />
//           </div>
//         </div>
//       </div>
//     </Link>
//   );

//   const QuickActionCard = ({ title, description, icon: Icon, href, color }) => (
//     <Link to={href} className="block group">
//       <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group-hover:border-blue-300">
//         <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
//           <Icon className="h-6 w-6 text-white" />
//         </div>
//         <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
//           {title}
//         </h4>
//         <p className="text-sm text-gray-600">{description}</p>
//       </div>
//     </Link>
//   );

//   const RecentItemCard = ({ item, type, onView, onEdit, onDelete }) => {
//     const getItemDetails = () => {
//       // Handle null/undefined items
//       if (!item) {
//         return {
//           title: 'Unknown Item',
//           subtitle: 'No data available',
//           description: 'Please check data connection',
//           icon: ExclamationTriangleIcon,
//           color: 'text-gray-600'
//         };
//       }

//       switch (type) {
//         case 'course':
//           return {
//             title: item.name || 'Unnamed Course',
//             subtitle: item.code || 'No Code',
//             description: `${item.credit_hours || 'N/A'} credits • ${item.course_type || 'Theory'}`,
//             icon: BookOpenIcon,
//             color: 'text-blue-600'
//           };
        
//         case 'teacher':
//   const teacherFirstName = item.user?.username || item.username || '';
//   const teacherDisplayName = `${teacherFirstName}`.trim() || 'Unknown Teacher';
  
//   return {
//     title: teacherDisplayName,
//     subtitle: item.employee_id || 'No ID',
//     description: item.department_name || item.department?.name || 'No department',
//     icon: UserGroupIcon,
//     color: 'text-green-600'
//   };

// case 'schedule':
//   // Course information with multiple fallbacks
//   const courseName = item.course?.name || item.course_name || 'Unknown Course';
//   const courseCode = item.course?.code || 'No Code';
  
//   // Teacher name with multiple fallbacks - CORRECTED
//   let scheduleTeacherName = 'Unknown Teacher';
  
//   // Check multiple possible locations for teacher username
//   if (item.teacher?.user?.username) {
//     // Structure: schedule.teacher.user.username
//     scheduleTeacherName = item.teacher.user.username;
//   } else if (item.teacher?.username) {
//     // Structure: schedule.teacher.username
//     scheduleTeacherName = item.teacher.username;
//   } else if (item.teacher_name) {
//     // Structure: schedule.teacher_name
//     scheduleTeacherName = item.teacher_name;
//   } else if (item.teacher?.user?.first_name) {
//     // Fallback to first name if username not available
//     scheduleTeacherName = item.teacher.user.first_name;
//   } else if (item.teacher?.first_name) {
//     scheduleTeacherName = item.teacher.first_name;
//   }
//           // Room information with fallbacks
//           const roomInfo = item.room?.room_number || item.room_number || 'Unknown Room';
          
//           // Time information with fallbacks
//           let timeInfo = 'No time set';
//           if (item.time_slot) {
//             timeInfo = `${item.time_slot.start_time || ''} - ${item.time_slot.end_time || ''}`.trim();
//           } else if (item.time) {
//             timeInfo = item.time;
//           }
          
//           // Department name with multiple fallbacks
//           const departmentName = item.department?.name || 
//                                 item.course?.department?.name || 
//                                 item.department_name || 
//                                 'No Department';

//           return {
//             title: courseName,
//             subtitle: scheduleTeacherName,
//             description: `${roomInfo} • ${timeInfo} • ${departmentName}`,
//             icon: CalendarDaysIcon,
//             color: 'text-purple-600'
//           };
        
//         default:
//           return { 
//             title: 'Unknown Type', 
//             subtitle: '', 
//             description: '', 
//             icon: ExclamationTriangleIcon, 
//             color: 'text-gray-600' 
//           };
//       }
//     };

//     const details = getItemDetails();
//     const IconComponent = details.icon;

//     return (
//       <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 group">
//         <div className="flex items-start justify-between">
//           <div className="flex items-start space-x-3 flex-1">
//             <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200 ${details.color}`}>
//               <IconComponent className="h-5 w-5" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <h4 className="font-semibold text-gray-900 truncate">{details.title}</h4>
//               <p className="text-sm text-gray-600 mt-1">{details.subtitle}</p>
//               <p className="text-xs text-gray-500 mt-1">{details.description}</p>
//             </div>
//           </div>
//           <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//             <button
//               onClick={() => onView(type, item)}
//               className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
//               title="View"
//             >
//               <EyeIcon className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => onEdit(type, item)}
//               className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
//               title="Edit"
//             >
//               <PencilIcon className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => onDelete(type, item.id)}
//               className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//               title="Delete"
//             >
//               <TrashIcon className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const StatusIndicator = ({ status, message }) => (
//     <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
//       <div className={`w-3 h-3 rounded-full ${
//         status === 'good' ? 'bg-green-500' : 
//         status === 'warning' ? 'bg-yellow-500' : 
//         'bg-red-500'
//       }`}></div>
//       <span className="text-sm text-gray-700">{message}</span>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
//             <p className="text-gray-600 mt-2">Welcome to your timetable management system</p>
//           </div>
//           <button
//             onClick={fetchDashboardData}
//             className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
//           >
//             <ArrowPathIcon className="h-4 w-4 mr-2" />
//             Refresh Data
//           </button>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
//           <StatCard
//             title="Courses"
//             value={stats.courses}
//             icon={BookOpenIcon}
//             color="bg-blue-500"
//             href="/courses"
//             description="Active courses"
//           />
//           <StatCard
//             title="Teachers"
//             value={stats.teachers}
//             icon={UserGroupIcon}
//             color="bg-green-500"
//             href="/teachers"
//             description="Teaching staff"
//           />
//           <StatCard
//             title="Departments"
//             value={stats.departments}
//             icon={BuildingOfficeIcon}
//             color="bg-purple-500"
//             href="/departments"
//             description="Academic departments"
//           />
//           <StatCard
//             title="Rooms"
//             value={stats.rooms}
//             icon={HomeIcon}
//             color="bg-orange-500"
//             href="/rooms"
//             description="Available rooms"
//           />
//           <StatCard
//             title="Timeslots"
//             value={stats.timeslots}
//             icon={ClockIcon}
//             color="bg-indigo-500"
//             href="/timeslots"
//             description="Time periods"
//           />
//           <StatCard
//             title="Schedules"
//             value={stats.schedules}
//             icon={CalendarDaysIcon}
//             color="bg-pink-500"
//             href="/schedule"
//             description="Class schedules"
//           />
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Quick Actions */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <QuickActionCard
//                   title="Manage Schedule"
//                   description="Create and manage class schedules"
//                   icon={CalendarDaysIcon}
//                   href="/schedule"
//                   color="bg-blue-500"
//                 />
//                 <QuickActionCard
//                   title="Add Teacher"
//                   description="Register new teaching staff"
//                   icon={UserGroupIcon}
//                   href="/teachers"
//                   color="bg-green-500"
//                 />
//                 <QuickActionCard
//                   title="Create Course"
//                   description="Add new academic courses"
//                   icon={BookOpenIcon}
//                   href="/courses"
//                   color="bg-purple-500"
//                 />
//                 <QuickActionCard
//                   title="Manage Rooms"
//                   description="View and manage classrooms"
//                   icon={HomeIcon}
//                   href="/rooms"
//                   color="bg-orange-500"
//                 />
//               </div>
//             </div>

//             {/* Recent Activity Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Recent Courses */}
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <h3 className="text-lg font-semibold text-gray-900">Recent Courses</h3>
//                   <Link to="/courses" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
//                     View all <span className="ml-1">→</span>
//                   </Link>
//                 </div>
//                 <div className="p-6 space-y-4">
//                   {recentCourses.length > 0 ? (
//                     recentCourses.map((course) => (
//                       <RecentItemCard
//                         key={course.id}
//                         item={course}
//                         type="course"
//                         onView={() => {}}
//                         onEdit={() => {}}
//                         onDelete={() => {}}
//                       />
//                     ))
//                   ) : (
//                     <p className="text-gray-500 text-center py-4">No courses found</p>
//                   )}
//                 </div>
//               </div>

//               {/* Recent Teachers */}
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <h3 className="text-lg font-semibold text-gray-900">Recent Teachers</h3>
//                   <Link to="/teachers" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
//                     View all <span className="ml-1">→</span>
//                   </Link>
//                 </div>
//                 <div className="p-6 space-y-4">
//                   {recentTeachers.length > 0 ? (
//                     recentTeachers.map((teacher) => (
//                       <RecentItemCard
//                         key={teacher.id}
//                         item={teacher}
//                         type="teacher"
//                         onView={() => {}}
//                         onEdit={() => {}}
//                         onDelete={() => {}}
//                       />
//                     ))
//                   ) : (
//                     <p className="text-gray-500 text-center py-4">No teachers found</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-8">
//             {/* System Status */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-xl font-semibold text-gray-900 mb-6">System Status</h3>
//               <div className="space-y-4">
//                 <StatusIndicator 
//                   status={systemStatus.conflicts === 0 ? 'good' : 'warning'}
//                   message={`${systemStatus.conflicts} schedule conflicts detected`}
//                 />
//                 <StatusIndicator 
//                   status={systemStatus.availableRooms > 2 ? 'good' : 'warning'}
//                   message={`${systemStatus.availableRooms} rooms available`}
//                 />
//                 <StatusIndicator 
//                   status={systemStatus.teacherAvailability > 70 ? 'good' : 'warning'}
//                   message={`${systemStatus.teacherAvailability}% teacher availability`}
//                 />
//                 <StatusIndicator 
//                   status="good"
//                   message="All systems operational"
//                 />
//               </div>
//             </div>

//             {/* Upcoming Classes */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900">Upcoming Classes</h3>
//               </div>
//               <div className="p-6 space-y-4">
//                 {upcomingClasses.length > 0 ? (
//                   upcomingClasses.map((schedule, index) => (
//                     <RecentItemCard
//                       key={schedule.id || index}
//                       item={schedule}
//                       type="schedule"
//                       onView={() => {}}
//                       onEdit={() => {}}
//                       onDelete={() => {}}
//                     />
//                   ))
//                 ) : (
//                   <p className="text-gray-500 text-center py-4">No upcoming classes</p>
//                 )}
//               </div>
//             </div>

//             {/* Recent Schedules */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
//               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                 <h3 className="text-lg font-semibold text-gray-900">Recent Schedules</h3>
//                 <Link to="/schedule" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
//                   View all <span className="ml-1">→</span>
//                 </Link>
//               </div>
//               <div className="p-6 space-y-4">
//                 {recentSchedules.length > 0 ? (
//                   recentSchedules.map((schedule) => (
//                     <RecentItemCard
//                       key={schedule.id}
//                       item={schedule}
//                       type="schedule"
//                       onView={() => {}}
//                       onEdit={() => {}}
//                       onDelete={() => {}}
//                     />
//                   ))
//                 ) : (
//                   <p className="text-gray-500 text-center py-4">No schedules found</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* System Overview Banner */}
//         <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl text-white p-8">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//             <div className="flex-1">
//               <h3 className="text-2xl font-bold mb-3">Timetable System Overview</h3>
//               <p className="text-blue-100 text-lg">
//                 Efficiently manage your academic schedule with our comprehensive system
//               </p>
//               <div className="flex flex-wrap gap-6 mt-6">
//                 <div className="text-center">
//                   <div className="text-3xl font-bold">{stats.courses}</div>
//                   <div className="text-blue-100 text-sm">Courses</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold">{stats.teachers}</div>
//                   <div className="text-blue-100 text-sm">Teachers</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold">{stats.schedules}</div>
//                   <div className="text-blue-100 text-sm">Scheduled Classes</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold">{stats.rooms}</div>
//                   <div className="text-blue-100 text-sm">Available Rooms</div>
//                 </div>
//               </div>
//             </div>
//             <div className="mt-6 lg:mt-0 lg:ml-8">
//               <Link
//                 to="/schedule"
//                 className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
//               >
//                 <CalendarDaysIcon className="h-5 w-5 mr-2" />
//                 Manage Schedule
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;












import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  ClockIcon,
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon,
  HomeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CogIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  DocumentChartBarIcon,
  CpuChipIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import CourseService from '../services/courseService';
import TeacherService from '../services/teacherService';
import DepartmentService from '../services/departmentService';
import RoomService from '../services/roomService';
import TimeSlotService from '../services/timeslotService';
import ScheduleService from '../services/scheduleService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    courses: 0,
    teachers: 0,
    departments: 0,
    rooms: 0,
    timeslots: 0,
    schedules: 0,
    students: 0,
    programs: 0
  });
  
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [recentSchedules, setRecentSchedules] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    conflicts: 0,
    availableRooms: 0,
    teacherAvailability: 0,
    utilization: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        coursesRes, 
        teachersRes, 
        departmentsRes, 
        roomsRes, 
        timeslotsRes,
        schedulesRes
      ] = await Promise.all([
        CourseService.getAll(),
        TeacherService.getAll(),
        DepartmentService.getAll(),
        RoomService.getAll(),
        TimeSlotService.getAll(),
        ScheduleService.getAll()
      ]);

      setStats({
        courses: coursesRes.data?.length || 0,
        teachers: teachersRes.data?.length || 0,
        departments: departmentsRes.data?.length || 0,
        rooms: roomsRes.data?.length || 0,
        timeslots: timeslotsRes.data?.length || 0,
        schedules: schedulesRes.data?.length || 0,
        students: 0, // You can add student service later
        programs: 0  // You can add program service later
      });

      // Get recent items
      setRecentCourses((coursesRes.data || []).slice(-5));
      setRecentTeachers((teachersRes.data || []).slice(-5));
      setRecentSchedules((schedulesRes.data || []).slice(-5));
      
      // Generate upcoming classes
      generateUpcomingClasses(schedulesRes.data || []);
      
      // Calculate system status
      calculateSystemStatus(schedulesRes.data || [], roomsRes.data || [], teachersRes.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUpcomingClasses = (schedules) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    const dayMap = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 
      4: 'thursday', 5: 'friday', 6: 'saturday'
    };
    
    const today = dayMap[currentDay];

    const upcoming = schedules
      .filter(schedule => {
        if (!schedule.time_slot?.start_time || !schedule.time_slot?.day) return false;
        
        const scheduleHour = parseInt(schedule.time_slot.start_time.split(':')[0]);
        const isToday = schedule.time_slot.day.toLowerCase() === today;
        const isFuture = scheduleHour >= currentHour;
        
        return isToday && isFuture;
      })
      .slice(0, 5)
      .map(schedule => ({
        ...schedule,
        time: schedule.time_slot ? 
          `${schedule.time_slot.start_time} - ${schedule.time_slot.end_time}` : 
          "Time not set",
        status: "Upcoming",
        isNow: isClassHappeningNow(schedule)
      }));

    setUpcomingClasses(upcoming);
  };

  const isClassHappeningNow = (schedule) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    if (!schedule.time_slot?.start_time || !schedule.time_slot?.end_time) return false;
    
    const startTime = schedule.time_slot.start_time.split(':');
    const endTime = schedule.time_slot.end_time.split(':');
    
    const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
    
    return currentTime >= startMinutes && currentTime <= endMinutes;
  };

  const calculateSystemStatus = (schedules, rooms, teachers) => {
    const conflicts = calculateScheduleConflicts(schedules);
    const availableRooms = calculateAvailableRooms(rooms, schedules);
    const teacherAvailability = calculateTeacherAvailability(teachers, schedules);
    const utilization = calculateUtilization(schedules, rooms, teachers);

    setSystemStatus({
      conflicts,
      availableRooms,
      teacherAvailability,
      utilization
    });
  };

  const calculateScheduleConflicts = (schedules) => {
    if (!schedules || schedules.length === 0) return 0;
    
    let conflicts = 0;
    const timeSlotMap = new Map();
    
    schedules.forEach(schedule => {
      const timeSlotId = schedule.time_slot?.id;
      const roomId = schedule.room?.id;
      
      if (timeSlotId && roomId) {
        const key = `${timeSlotId}_${roomId}`;
        if (timeSlotMap.has(key)) {
          conflicts++;
        } else {
          timeSlotMap.set(key, schedule);
        }
      }
    });
    
    return conflicts;
  };

  const calculateAvailableRooms = (rooms, schedules) => {
    if (!rooms || rooms.length === 0) return 0;
    
    const usedRooms = new Set();
    schedules.forEach(schedule => {
      if (schedule.room?.id) {
        usedRooms.add(schedule.room.id);
      }
    });
    
    return Math.max(0, rooms.length - usedRooms.size);
  };

  const calculateTeacherAvailability = (teachers, schedules) => {
    if (!teachers || teachers.length === 0) return 0;
    
    const MAX_WORKLOAD = 6;
    const teacherScheduleCount = new Map();
    
    schedules.forEach(schedule => {
      const teacherId = schedule.teacher?.id;
      if (teacherId) {
        teacherScheduleCount.set(teacherId, (teacherScheduleCount.get(teacherId) || 0) + 1);
      }
    });
    
    const availableTeachers = teachers.filter(teacher => {
      const workload = teacherScheduleCount.get(teacher.id) || 0;
      return workload <= MAX_WORKLOAD;
    });
    
    return Math.round((availableTeachers.length / teachers.length) * 100);
  };

  const calculateUtilization = (schedules, rooms, teachers) => {
    const totalPossibleSlots = rooms.length * 40; // Assuming 40 timeslots per week
    const usedSlots = schedules.length;
    
    return Math.min(100, Math.round((usedSlots / totalPossibleSlots) * 100));
  };

  // Modern Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color, href, trend, description }) => (
    <Link to={href} className="group">
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{loading ? '...' : value}</p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center mt-3 text-sm ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}% from last week
          </div>
        )}
      </div>
    </Link>
  );

  // Feature Card Component
  const FeatureCard = ({ title, description, icon: Icon, href, color, action }) => (
    <Link to={href} className="group">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h4>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center text-blue-600 text-sm font-medium">
          {action}
          <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  );

  // Schedule Card Component
  const ScheduleCard = ({ schedule, type = 'upcoming' }) => {
    const getScheduleDetails = () => {
      if (!schedule) return { title: 'Unknown', subtitle: '', details: [] };

      const courseName = schedule.course?.name || schedule.course_name || 'Unknown Course';
      const teacherName = schedule.teacher?.user?.username || schedule.teacher?.username || schedule.teacher_name || 'Unknown Teacher';
      const roomInfo = schedule.room?.room_number || schedule.room_number || 'Unknown Room';
      const timeInfo = schedule.time_slot ? 
        `${schedule.time_slot.start_time} - ${schedule.time_slot.end_time}` : 
        schedule.time || 'Time not set';
      const sectionInfo = schedule.class_section?.name || 'No Section';

      return {
        title: courseName,
        subtitle: teacherName,
        details: [
          { icon: MapPinIcon, text: roomInfo },
          { icon: ClockIcon, text: timeInfo },
          { icon: UsersIcon, text: sectionInfo }
        ]
      };
    };

    const details = getScheduleDetails();
    const isLive = type === 'upcoming' && schedule.isNow;

    return (
      <div className={`bg-white rounded-xl p-4 border-l-4 ${
        isLive ? 'border-green-500 bg-green-50' : 'border-blue-500'
      } hover:shadow-md transition-all duration-200 group`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{details.title}</h4>
              {isLive && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <SignalIcon className="h-3 w-3 mr-1 animate-pulse" />
                  Live Now
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{details.subtitle}</p>
            <div className="space-y-2">
              {details.details.map((detail, index) => (
                <div key={index} className="flex items-center text-sm text-gray-500">
                  <detail.icon className="h-4 w-4 mr-2" />
                  {detail.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <AcademicCapIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome to your timetable management system</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <BellIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <CogIcon className="h-5 w-5" />
              </button>
              <button
                onClick={fetchDashboardData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Courses"
            value={stats.courses}
            icon={BookOpenIcon}
            color="bg-blue-500"
            href="/courses"
            trend={12}
          />
          <StatCard
            title="Teaching Staff"
            value={stats.teachers}
            icon={UserGroupIcon}
            color="bg-green-500"
            href="/teachers"
            trend={8}
          />
          <StatCard
            title="Departments"
            value={stats.departments}
            icon={BuildingOfficeIcon}
            color="bg-purple-500"
            href="/departments"
            trend={5}
          />
          <StatCard
            title="Classrooms"
            value={stats.rooms}
            icon={HomeIcon}
            color="bg-orange-500"
            href="/rooms"
            trend={-2}
          />
          <StatCard
            title="Timeslots"
            value={stats.timeslots}
            icon={ClockIcon}
            color="bg-indigo-500"
            href="/timeslots"
            trend={15}
          />
          <StatCard
            title="Schedules"
            value={stats.schedules}
            icon={CalendarDaysIcon}
            color="bg-pink-500"
            href="/schedule"
            trend={20}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="xl:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                <Link to="/schedule" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  View all <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FeatureCard
                  title="Schedule Manager"
                  description="Create and manage class schedules efficiently"
                  icon={CalendarDaysIcon}
                  href="/schedule"
                  color="bg-blue-500"
                  action="Manage"
                />
                <FeatureCard
                  title="Teacher Portal"
                  description="Add and manage teaching staff"
                  icon={UserGroupIcon}
                  href="/teachers"
                  color="bg-green-500"
                  action="Manage"
                />
                <FeatureCard
                  title="Course Catalog"
                  description="Browse and manage academic courses"
                  icon={BookOpenIcon}
                  href="/courses"
                  color="bg-purple-500"
                  action="Browse"
                />
                <FeatureCard
                  title="Room Management"
                  description="View and manage classroom availability"
                  icon={HomeIcon}
                  href="/rooms"
                  color="bg-orange-500"
                  action="Manage"
                />
              </div>
            </div>

            {/* Upcoming Classes & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Classes */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>
                  <p className="text-sm text-gray-600 mt-1">Upcoming and ongoing classes</p>
                </div>
                <div className="p-6 space-y-4">
                  {upcomingClasses.length > 0 ? (
                    upcomingClasses.map((schedule, index) => (
                      <ScheduleCard key={schedule.id || index} schedule={schedule} type="upcoming" />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No classes scheduled for today</p>
                      <Link to="/schedule" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
                        Create schedule
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-600 mt-1">Latest system updates</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <PlusIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New schedule created</p>
                      <p className="text-xs text-gray-600">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <UserGroupIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Teacher added</p>
                      <p className="text-xs text-gray-600">1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <BookOpenIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Course updated</p>
                      <p className="text-xs text-gray-600">3 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <WrenchScrewdriverIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">System maintenance</p>
                      <p className="text-xs text-gray-600">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* System Health */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">System Health</h3>
              <div className="space-y-4">
                {/* Utilization */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Resource Utilization</span>
                    <span className="text-sm font-bold text-blue-600">{systemStatus.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        systemStatus.utilization > 80 ? 'bg-red-500' : 
                        systemStatus.utilization > 60 ? 'bg-yellow-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${systemStatus.utilization}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">All Systems Operational</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-900">{systemStatus.conflicts} Conflicts</span>
                    </div>
                    <Link to="/schedule" className="text-blue-600 hover:text-blue-800 text-sm">
                      Resolve
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <HomeIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{systemStatus.availableRooms} Rooms Available</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">{systemStatus.teacherAvailability}% Teacher Availability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-xl text-white p-6">
              <h3 className="text-lg font-bold mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Weekly Utilization</span>
                  <span className="font-bold">{systemStatus.utilization}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Active Classes</span>
                  <span className="font-bold">{upcomingClasses.filter(c => c.isNow).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">System Uptime</span>
                  <span className="font-bold">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Response Time</span>
                  <span className="font-bold">{"<"} 200ms</span>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <Link to="/help" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Documentation</span>
                </Link>
                <Link to="/support" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <CogIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">System Settings</span>
                </Link>
                <Link to="/tutorials" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <DocumentChartBarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Video Tutorials</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl text-white p-8 mt-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">Timetable System Overview</h3>
              <p className="text-blue-100 text-lg mb-6">
                Efficiently manage your academic schedule with our comprehensive system
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.courses}</div>
                  <div className="text-blue-100 text-sm">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.teachers}</div>
                  <div className="text-blue-100 text-sm">Teachers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.schedules}</div>
                  <div className="text-blue-100 text-sm">Scheduled Classes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.rooms}</div>
                  <div className="text-blue-100 text-sm">Available Rooms</div>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <Link
                to="/schedule"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                Manage Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;