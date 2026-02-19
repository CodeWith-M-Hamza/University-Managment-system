

// import React, { useState, useEffect } from 'react';
// import studentAPI from '../services/studentAPI';
// import FileImportUploader from './FileImportUploader';
// import { 
//   GraduationCap, 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Search, 
//   Users, 
//   BookOpen, 
//   Calendar,
//   Filter,
//   Download,
//   Upload,
//   MoreVertical,
//   Eye,
//   Mail,
//   Phone,
//   MapPin,
//   ChevronDown,
//   ChevronUp,
//   X,
//   Loader
// } from 'lucide-react';

// const Students = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("add"); // "add" or "import"
//   const [showForm, setShowForm] = useState(false);
//   const [editingStudent, setEditingStudent] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [expandedStudent, setExpandedStudent] = useState(null);
//   const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
//   const [showFilters, setShowFilters] = useState(false);
  
//   const [classSections, setClassSections] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [academicSessions, setAcademicSessions] = useState([]);
//   const [dropdownLoading, setDropdownLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     roll_number: '',
//     class_section: '',
//     department: '',
//     academic_session: '',
//     admission_date: new Date().toISOString().split('T')[0]
//   });

//   const [filters, setFilters] = useState({
//     department: '',
//     class_section: '',
//     academic_session: ''
//   });

//   useEffect(() => {
//     loadStudents();
//     loadDropdownData();
//   }, []);

//   const loadStudents = async () => {
//     setLoading(true);
//     try {
//       const response = await studentAPI.getAll();
//       console.log('Raw students data:', response.data);
      
//       const transformedStudents = response.data.map(student => ({
//         id: student.id,
//         user: student.user_details?.first_name + ' ' + student.user_details?.last_name || 
//               student.user?.first_name + ' ' + student.user?.last_name || 
//               'Unknown Student',
//         email: student.user_details?.email || student.user?.email || 'No email',
//         phone: student.user_details?.phone || student.user?.phone || 'Not provided',
//         roll_number: student.roll_number || 'N/A',
//         class_section: student.class_section_details?.name || student.class_section_name || 'Not assigned',
//         department: student.department_details?.name || student.department_name || 'Not assigned',
//         academic_session: student.academic_session_details?.name || student.academic_session_name || 'Not assigned',
//         admission_date: student.admission_date,
//         class_section_id: student.class_section,
//         department_id: student.department,
//         academic_session_id: student.academic_session,
//         user_id: student.user,
//         semester: student.class_section_details?.semester || 'N/A'
//       }));
      
//       setStudents(transformedStudents);
//     } catch (error) {
//       console.error('Error loading students:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadDropdownData = async () => {
//     setDropdownLoading(true);
//     try {
//       const [sectionsRes, deptsRes, sessionsRes] = await Promise.all([
//         studentAPI.getClassSections(),
//         studentAPI.getDepartments(),
//         studentAPI.getAcademicSessions()
//       ]);
      
//       setClassSections(sectionsRes.data);
//       setDepartments(deptsRes.data);
//       setAcademicSessions(sessionsRes.data);
      
//     } catch (error) {
//       console.error('Error loading dropdown data:', error);
//       setClassSections([]);
//       setDepartments([]);
//       setAcademicSessions([]);
//     } finally {
//       setDropdownLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       console.log('📤 Form data:', formData);
      
//       if (!formData.roll_number || !formData.class_section || 
//           !formData.department || !formData.academic_session) {
//         alert('Please fill all required fields');
//         return;
//       }

//       const studentData = {
//         roll_number: formData.roll_number,
//         class_section: parseInt(formData.class_section),
//         department: parseInt(formData.department),
//         academic_session: parseInt(formData.academic_session),
//         admission_date: formData.admission_date
//       };

//       console.log('🎓 Creating student with data:', studentData);

//       if (editingStudent) {
//         await studentAPI.update(editingStudent.id, studentData);
//       } else {
//         await studentAPI.create(studentData);
//       }
      
//       setShowForm(false);
//       resetForm();
//       loadStudents();
//     } catch (error) {
//       console.error('❌ Error saving student:', error);
      
//       if (error.response?.data) {
//         const errors = error.response.data;
//         let errorMessage = 'Please fix the following errors:\n';
//         Object.keys(errors).forEach(field => {
//           const errorMsg = Array.isArray(errors[field]) ? errors[field].join(', ') : errors[field];
//           errorMessage += `• ${field}: ${errorMsg}\n`;
//         });
//         alert(errorMessage);
//       } else {
//         alert('Error saving student. Please check the console for details.');
//       }
//     }
//   };

//   const handleEdit = (student) => {
//     console.log('Editing student:', student);
//     setEditingStudent(student);
//     setFormData({
//       roll_number: student.roll_number || '',
//       class_section: student.class_section_id?.toString() || '',
//       department: student.department_id?.toString() || '',
//       academic_session: student.academic_session_id?.toString() || '',
//       admission_date: student.admission_date || new Date().toISOString().split('T')[0]
//     });
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this student?')) {
//       try {
//         await studentAPI.delete(id);
//         loadStudents();
//       } catch (error) {
//         console.error('Error deleting student:', error);
//         alert('Error deleting student');
//       }
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       roll_number: '',
//       class_section: '',
//       department: '',
//       academic_session: '',
//       admission_date: new Date().toISOString().split('T')[0]
//     });
//     setEditingStudent(null);
//   };

//   const clearFilters = () => {
//     setFilters({
//       department: '',
//       class_section: '',
//       academic_session: ''
//     });
//     setSearchTerm('');
//   };

//   const filteredStudents = students.filter(student => {
//     const searchLower = searchTerm.toLowerCase();
//     const matchesSearch = (
//       student.roll_number?.toLowerCase().includes(searchLower) ||
//       student.user?.toLowerCase().includes(searchLower) ||
//       student.email?.toLowerCase().includes(searchLower) ||
//       student.class_section?.toLowerCase().includes(searchLower) ||
//       student.department?.toLowerCase().includes(searchLower) ||
//       student.academic_session?.toLowerCase().includes(searchLower)
//     );

//     const matchesFilters = (
//       (!filters.department || student.department_id == filters.department) &&
//       (!filters.class_section || student.class_section_id == filters.class_section) &&
//       (!filters.academic_session || student.academic_session_id == filters.academic_session)
//     );

//     return matchesSearch && matchesFilters;
//   });

//   // Enhanced stats calculation
//   const stats = {
//     total: students.length,
//     departments: [...new Set(students.map(s => s.department).filter(Boolean))].length,
//     sections: [...new Set(students.map(s => s.class_section).filter(Boolean))].length,
//     active: students.length, // You can add active/inactive logic
//     newThisMonth: students.filter(s => {
//       const admissionDate = new Date(s.admission_date);
//       const now = new Date();
//       return admissionDate.getMonth() === now.getMonth() && 
//              admissionDate.getFullYear() === now.getFullYear();
//     }).length
//   };

//   const StudentCard = ({ student }) => (
//     <div className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 group">
//       <div className="p-6">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-center space-x-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
//               <GraduationCap className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <h3 className="font-bold text-gray-900 text-lg leading-tight">
//                 {student.user}
//               </h3>
//               <p className="text-orange-600 font-semibold text-sm">
//                 {student.roll_number}
//               </p>
//             </div>
//           </div>
//           <div className="relative">
//             <button 
//               onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <MoreVertical className="h-4 w-4 text-gray-400" />
//             </button>
//           </div>
//         </div>

//         {/* Quick Info */}
//         <div className="space-y-3 mb-4">
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-gray-500">Class</span>
//             <span className="font-medium text-gray-900">{student.class_section}</span>
//           </div>
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-gray-500">Department</span>
//             <span className="font-medium text-gray-900">{student.department}</span>
//           </div>
//           <div className="flex items-center justify-between text-sm">
//             <span className="text-gray-500">Session</span>
//             <span className="font-medium text-gray-900">{student.academic_session}</span>
//           </div>
//         </div>

//         {/* Expanded Details */}
//         {expandedStudent === student.id && (
//           <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
//             <div className="flex items-center space-x-2 text-sm text-gray-600">
//               <Mail className="h-4 w-4" />
//               <span>{student.email}</span>
//             </div>
//             <div className="flex items-center space-x-2 text-sm text-gray-600">
//               <Calendar className="h-4 w-4" />
//               <span>Admitted: {new Date(student.admission_date).toLocaleDateString()}</span>
//             </div>
//             <div className="flex items-center space-x-2 text-sm text-gray-600">
//               <BookOpen className="h-4 w-4" />
//               <span>Semester: {student.semester}</span>
//             </div>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className={`flex space-x-2 ${expandedStudent === student.id ? 'mt-4' : ''}`}>
//           <button
//             onClick={() => handleEdit(student)}
//             className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-100 transition-colors text-sm font-medium"
//           >
//             <Edit className="h-4 w-4" />
//             <span>Edit</span>
//           </button>
//           <button
//             onClick={() => handleDelete(student.id)}
//             className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors text-sm font-medium"
//           >
//             <Trash2 className="h-4 w-4" />
//             <span>Delete</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   const StudentRow = ({ student }) => (
//     <div className="bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all duration-200">
//       <div className="p-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4 flex-1">
//             <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
//               <GraduationCap className="h-6 w-6 text-white" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center space-x-3 mb-1">
//                 <h3 className="font-bold text-gray-900 text-lg truncate">
//                   {student.user}
//                 </h3>
//                 <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
//                   {student.roll_number}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-4 text-sm text-gray-600">
//                 <span className="flex items-center space-x-1">
//                   <BookOpen className="h-4 w-4" />
//                   <span>{student.class_section}</span>
//                 </span>
//                 <span className="flex items-center space-x-1">
//                   <Users className="h-4 w-4" />
//                   <span>{student.department}</span>
//                 </span>
//                 <span className="flex items-center space-x-1">
//                   <Calendar className="h-4 w-4" />
//                   <span>{student.academic_session}</span>
//                 </span>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => handleEdit(student)}
//               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//               title="Edit student"
//             >
//               <Edit className="h-4 w-4" />
//             </button>
//             <button
//               onClick={() => handleDelete(student.id)}
//               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//               title="Delete student"
//             >
//               <Trash2 className="h-4 w-4" />
//             </button>
//             <button 
//               onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
//               className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
//             >
//               {expandedStudent === student.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//             </button>
//           </div>
//         </div>

//         {expandedStudent === student.id && (
//           <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//             <div>
//               <span className="text-gray-500">Email</span>
//               <p className="font-medium text-gray-900">{student.email}</p>
//             </div>
//             <div>
//               <span className="text-gray-500">Phone</span>
//               <p className="font-medium text-gray-900">{student.phone}</p>
//             </div>
//             <div>
//               <span className="text-gray-500">Admission Date</span>
//               <p className="font-medium text-gray-900">{new Date(student.admission_date).toLocaleDateString()}</p>
//             </div>
//             <div>
//               <span className="text-gray-500">Semester</span>
//               <p className="font-medium text-gray-900">{student.semester}</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   if (loading && students.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading students...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
//       {/* Header */}
//       <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
//         <div className="max-w-7xl mx-auto px-6 py-8">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-2xl shadow-lg">
//                 <GraduationCap className="h-8 w-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent">
//                   Student Management
//                 </h1>
//                 <p className="text-gray-600 mt-1">Manage student records, enrollments, and academic information</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3">
//               <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
//                 <Download className="h-4 w-4" />
//                 <span>Export</span>
//               </button>
//               <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
//                 <Upload className="h-4 w-4" />
//                 <span>Import</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         {/* Enhanced Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-orange-100 text-sm font-medium">Total Students</p>
//                 <p className="text-3xl font-bold mt-2">{stats.total}</p>
//               </div>
//               <Users className="h-8 w-8 opacity-90" />
//             </div>
//             <div className="mt-4 flex items-center space-x-1 text-orange-100 text-sm">
//               <span>All enrolled students</span>
//             </div>
//           </div>
          
//           <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-blue-100 text-sm font-medium">Departments</p>
//                 <p className="text-3xl font-bold mt-2">{stats.departments}</p>
//               </div>
//               <BookOpen className="h-8 w-8 opacity-90" />
//             </div>
//             <div className="mt-4 flex items-center space-x-1 text-blue-100 text-sm">
//               <span>Active departments</span>
//             </div>
//           </div>
          
//           <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-green-100 text-sm font-medium">Class Sections</p>
//                 <p className="text-3xl font-bold mt-2">{stats.sections}</p>
//               </div>
//               <Calendar className="h-8 w-8 opacity-90" />
//             </div>
//             <div className="mt-4 flex items-center space-x-1 text-green-100 text-sm">
//               <span>Active sections</span>
//             </div>
//           </div>
          
//           <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-purple-100 text-sm font-medium">New This Month</p>
//                 <p className="text-3xl font-bold mt-2">{stats.newThisMonth}</p>
//               </div>
//               <Plus className="h-8 w-8 opacity-90" />
//             </div>
//             <div className="mt-4 flex items-center space-x-1 text-purple-100 text-sm">
//               <span>Recent admissions</span>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Controls Bar */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
//           <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
//             {/* Search */}
//             <div className="flex-1 w-full">
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search students by name, roll number, email, or department..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base bg-gray-50/50"
//                 />
//               </div>
//             </div>

//             {/* View Controls */}
//             <div className="flex items-center space-x-3 w-full lg:w-auto">
//               <div className="flex bg-gray-100 rounded-xl p-1">
//                 <button
//                   onClick={() => setViewMode('grid')}
//                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                     viewMode === 'grid' 
//                       ? 'bg-white text-orange-600 shadow-sm' 
//                       : 'text-gray-600 hover:text-gray-900'
//                   }`}
//                 >
//                   Grid
//                 </button>
//                 <button
//                   onClick={() => setViewMode('list')}
//                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                     viewMode === 'list' 
//                       ? 'bg-white text-orange-600 shadow-sm' 
//                       : 'text-gray-600 hover:text-gray-900'
//                   }`}
//                 >
//                   List
//                 </button>
//               </div>

//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
//                   showFilters 
//                     ? 'bg-orange-600 text-white shadow-lg' 
//                     : 'bg-white text-gray-700 border border-gray-300 hover:shadow-md'
//                 }`}
//               >
//                 <Filter className="h-4 w-4" />
//                 <span>Filters</span>
//               </button>

//               <button
//                 onClick={() => setShowForm(true)}
//                 className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:shadow-xl transition-all duration-200 shadow-lg"
//               >
//                 <Plus className="h-5 w-5" />
//                 <span className="font-semibold">New Student</span>
//               </button>
//             </div>
//           </div>

//           {/* Enhanced Filters */}
//           {showFilters && (
//             <div className="mt-6 pt-6 border-t border-gray-200">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
//                   <select
//                     value={filters.department}
//                     onChange={(e) => setFilters(prev => ({...prev, department: e.target.value}))}
//                     className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-orange-500"
//                   >
//                     <option value="">All Departments</option>
//                     {departments.map(dept => (
//                       <option key={dept.id} value={dept.id}>{dept.name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Class Section</label>
//                   <select
//                     value={filters.class_section}
//                     onChange={(e) => setFilters(prev => ({...prev, class_section: e.target.value}))}
//                     className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-orange-500"
//                   >
//                     <option value="">All Sections</option>
//                     {classSections.map(section => (
//                       <option key={section.id} value={section.id}>{section.name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Session</label>
//                   <select
//                     value={filters.academic_session}
//                     onChange={(e) => setFilters(prev => ({...prev, academic_session: e.target.value}))}
//                     className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-orange-500"
//                   >
//                     <option value="">All Sessions</option>
//                     {academicSessions.map(session => (
//                       <option key={session.id} value={session.id}>{session.name}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="flex justify-end mt-4">
//                 <button
//                   onClick={clearFilters}
//                   className="text-sm text-orange-600 hover:text-orange-700 font-medium"
//                 >
//                   Clear all filters
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Results Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900">
//               {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''} Found
//             </h2>
//             <p className="text-gray-600 text-sm">
//               {searchTerm && `Search results for "${searchTerm}"`}
//               {!searchTerm && Object.values(filters).some(f => f) && 'Filtered results'}
//             </p>
//           </div>
//         </div>

//         {/* Students Grid/List */}
//         {viewMode === 'grid' ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//             {filteredStudents.map((student) => (
//               <StudentCard key={student.id} student={student} />
//             ))}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredStudents.map((student) => (
//               <StudentRow key={student.id} student={student} />
//             ))}
//           </div>
//         )}

//         {/* Empty State */}
//         {filteredStudents.length === 0 && (
//           <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
//             <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
//               <GraduationCap className="h-10 w-10 text-gray-400" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-3">
//               {searchTerm || Object.values(filters).some(f => f) ? 'No students found' : 'No students yet'}
//             </h3>
//             <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
//               {searchTerm 
//                 ? `No students match "${searchTerm}". Try adjusting your search terms.` 
//                 : 'Get started by adding your first student to the system.'
//               }
//             </p>
//             {!searchTerm && (
//               <button
//                 onClick={() => setShowForm(true)}
//                 className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3.5 rounded-xl flex items-center space-x-3 hover:shadow-xl transition-all duration-200 mx-auto text-lg font-semibold"
//               >
//                 <Plus className="h-5 w-5" />
//                 <span>Add First Student</span>
//               </button>
//             )}
//           </div>
//         )}

//         {/* Enhanced Form Modal */}
//         {showForm && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//               {/* Header */}
//               <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-3xl p-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-xl">
//                       <GraduationCap className="h-6 w-6 text-white" />
//                     </div>
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-900">
//                         {editingStudent ? 'Edit Student' : 'Enroll New Student'}
//                       </h2>
//                       <p className="text-gray-600">
//                         {editingStudent ? 'Update student information' : 'Add a new student to the system'}
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setShowForm(false);
//                       resetForm();
//                     }}
//                     className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//                   >
//                     <X className="h-5 w-5 text-gray-500" />
//                   </button>
//                 </div>
//               </div>
              
//               {/* Form */}
//               <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-3">
//                       Roll Number *
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={formData.roll_number}
//                       onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
//                       className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
//                       placeholder="e.g., 2024-CS-001"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-3">
//                       Admission Date
//                     </label>
//                     <input
//                       type="date"
//                       value={formData.admission_date}
//                       onChange={(e) => setFormData({...formData, admission_date: e.target.value})}
//                       className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-3">
//                       Class Section *
//                     </label>
//                     <select
//                       required
//                       value={formData.class_section}
//                       onChange={(e) => setFormData({...formData, class_section: e.target.value})}
//                       className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
//                     >
//                       <option value="">Select Class Section</option>
//                       {classSections.map((section) => (
//                         <option key={section.id} value={section.id}>
//                           {section.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-3">
//                       Department *
//                     </label>
//                     <select
//                       required
//                       value={formData.department}
//                       onChange={(e) => setFormData({...formData, department: e.target.value})}
//                       className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
//                     >
//                       <option value="">Select Department</option>
//                       {departments.map((dept) => (
//                         <option key={dept.id} value={dept.id}>
//                           {dept.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     Academic Session *
//                   </label>
//                   <select
//                     required
//                     value={formData.academic_session}
//                     onChange={(e) => setFormData({...formData, academic_session: e.target.value})}
//                     className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
//                   >
//                     <option value="">Select Academic Session</option>
//                     {academicSessions.map((session) => (
//                       <option key={session.id} value={session.id}>
//                         {session.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="flex space-x-4 pt-6">
//                   <button
//                     type="submit"
//                     className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-xl hover:shadow-xl transition-all duration-200 font-semibold text-base"
//                   >
//                     {editingStudent ? 'Update Student' : 'Enroll Student'}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowForm(false);
//                       resetForm();
//                     }}
//                     className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-base"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Students;








import React, { useState, useEffect } from 'react';
import studentAPI from '../services/studentAPI';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users, 
  BookOpen, 
  Calendar,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Loader
} from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [classSections, setClassSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const [formData, setFormData] = useState({
    roll_number: '',
    class_section: '',
    department: '',
    academic_session: '',
    admission_date: new Date().toISOString().split('T')[0],
    user_id: '' // Added user_id field for student creation
  });

  const [filters, setFilters] = useState({
    department: '',
    class_section: '',
    academic_session: ''
  });

  useEffect(() => {
    loadStudents();
    loadDropdownData();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getAll();
      console.log('Raw students data:', response.data);
      
      const transformedStudents = response.data.map(student => ({
        id: student.id,
        user_id: student.user,
        user: student.student_name || 'Unknown Student',
        email: student.email || 'No email',
        username: student.username || 'No username',
        roll_number: student.roll_number || 'N/A',
        class_section: student.section_name || 'Not assigned',
        department: student.department_name || 'Not assigned',
        academic_session: student.academic_session_name || 'Not assigned',
        admission_date: student.admission_date,
        class_section_id: student.class_section,
        department_id: student.department,
        academic_session_id: student.academic_session,
      }));
      
      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    setDropdownLoading(true);
    try {
      const [sectionsRes, deptsRes, sessionsRes] = await Promise.all([
        studentAPI.getClassSections(),
        studentAPI.getDepartments(),
        studentAPI.getAcademicSessions()
      ]);
      
      setClassSections(sectionsRes.data);
      setDepartments(deptsRes.data);
      setAcademicSessions(sessionsRes.data);
      
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      setClassSections([]);
      setDepartments([]);
      setAcademicSessions([]);
    } finally {
      setDropdownLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📤 Form data:', formData);
      
      if (!formData.roll_number || !formData.class_section || 
          !formData.department || !formData.academic_session) {
        alert('Please fill all required fields');
        return;
      }

      // Prepare data according to your serializer
      const studentData = {
        roll_number: formData.roll_number,
        class_section: parseInt(formData.class_section),
        department: parseInt(formData.department),
        academic_session: parseInt(formData.academic_session),
        admission_date: formData.admission_date
      };

      // Add user_id only for creation, not for updates
      if (!editingStudent) {
        if (!formData.user_id) {
          alert('Please select a user for the student');
          return;
        }
        studentData.user_id = parseInt(formData.user_id);
      }

      console.log('🎓 Saving student with data:', studentData);

      if (editingStudent) {
        await studentAPI.update(editingStudent.id, studentData);
      } else {
        await studentAPI.create(studentData);
      }
      
      setShowForm(false);
      resetForm();
      loadStudents();
    } catch (error) {
      console.error('❌ Error saving student:', error);
      
      if (error.response?.data) {
        const errors = error.response.data;
        let errorMessage = 'Please fix the following errors:\n';
        Object.keys(errors).forEach(field => {
          const errorMsg = Array.isArray(errors[field]) ? errors[field].join(', ') : errors[field];
          errorMessage += `• ${field}: ${errorMsg}\n`;
        });
        alert(errorMessage);
      } else {
        alert('Error saving student. Please check the console for details.');
      }
    }
  };

  const handleEdit = (student) => {
    console.log('Editing student:', student);
    setEditingStudent(student);
    setFormData({
      roll_number: student.roll_number || '',
      class_section: student.class_section_id?.toString() || '',
      department: student.department_id?.toString() || '',
      academic_session: student.academic_session_id?.toString() || '',
      admission_date: student.admission_date || new Date().toISOString().split('T')[0],
      user_id: student.user_id?.toString() || '' // Keep user_id for reference
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(id);
        loadStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      roll_number: '',
      class_section: '',
      department: '',
      academic_session: '',
      admission_date: new Date().toISOString().split('T')[0],
      user_id: ''
    });
    setEditingStudent(null);
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      class_section: '',
      academic_session: ''
    });
    setSearchTerm('');
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      student.roll_number?.toLowerCase().includes(searchLower) ||
      student.user?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.username?.toLowerCase().includes(searchLower) ||
      student.class_section?.toLowerCase().includes(searchLower) ||
      student.department?.toLowerCase().includes(searchLower) ||
      student.academic_session?.toLowerCase().includes(searchLower)
    );

    const matchesFilters = (
      (!filters.department || student.department_id == filters.department) &&
      (!filters.class_section || student.class_section_id == filters.class_section) &&
      (!filters.academic_session || student.academic_session_id == filters.academic_session)
    );

    return matchesSearch && matchesFilters;
  });

  // Stats calculation
  const stats = {
    total: students.length,
    departments: [...new Set(students.map(s => s.department).filter(Boolean))].length,
    sections: [...new Set(students.map(s => s.class_section).filter(Boolean))].length,
    newThisMonth: students.filter(s => {
      const admissionDate = new Date(s.admission_date);
      const now = new Date();
      return admissionDate.getMonth() === now.getMonth() && 
             admissionDate.getFullYear() === now.getFullYear();
    }).length
  };

  const StudentCard = ({ student }) => (
    <div className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                {student.user}
              </h3>
              <p className="text-orange-600 font-semibold text-sm">
                {student.roll_number}
              </p>
              <p className="text-gray-500 text-xs">
                @{student.username}
              </p>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Class</span>
            <span className="font-medium text-gray-900">{student.class_section}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Department</span>
            <span className="font-medium text-gray-900">{student.department}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Session</span>
            <span className="font-medium text-gray-900">{student.academic_session}</span>
          </div>
        </div>

        {/* Expanded Details */}
        {expandedStudent === student.id && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Admitted: {new Date(student.admission_date).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex space-x-2 ${expandedStudent === student.id ? 'mt-4' : ''}`}>
          <button
            onClick={() => handleEdit(student)}
            className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleDelete(student.id)}
            className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  const StudentRow = ({ student }) => (
    <div className="bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="font-bold text-gray-900 text-lg truncate">
                  {student.user}
                </h3>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                  {student.roll_number}
                </span>
                <span className="text-gray-500 text-sm">
                  @{student.username}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{student.class_section}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{student.department}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{student.academic_session}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(student)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit student"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(student.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete student"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
              className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {expandedStudent === student.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {expandedStudent === student.id && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Email</span>
              <p className="font-medium text-gray-900">{student.email}</p>
            </div>
            <div>
              <span className="text-gray-500">Username</span>
              <p className="font-medium text-gray-900">{student.username}</p>
            </div>
            <div>
              <span className="text-gray-500">Admission Date</span>
              <p className="font-medium text-gray-900">{new Date(student.admission_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">User ID</span>
              <p className="font-medium text-gray-900">{student.user_id}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent">
                  Student Management
                </h1>
                <p className="text-gray-600 mt-1">Manage student records, enrollments, and academic information</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 opacity-90" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold mt-2">{stats.departments}</p>
              </div>
              <BookOpen className="h-8 w-8 opacity-90" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Class Sections</p>
                <p className="text-3xl font-bold mt-2">{stats.sections}</p>
              </div>
              <Calendar className="h-8 w-8 opacity-90" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">New This Month</p>
                <p className="text-3xl font-bold mt-2">{stats.newThisMonth}</p>
              </div>
              <Plus className="h-8 w-8 opacity-90" />
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name, roll number, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base bg-gray-50/50"
                />
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
                  showFilters 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:shadow-md'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:shadow-xl transition-all duration-200 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span className="font-semibold">New Student</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({...prev, department: e.target.value}))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class Section</label>
                  <select
                    value={filters.class_section}
                    onChange={(e) => setFilters(prev => ({...prev, class_section: e.target.value}))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Sections</option>
                    {classSections.map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Session</label>
                  <select
                    value={filters.academic_session}
                    onChange={(e) => setFilters(prev => ({...prev, academic_session: e.target.value}))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Sessions</option>
                    {academicSessions.map(session => (
                      <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''} Found
            </h2>
            <p className="text-gray-600 text-sm">
              {searchTerm && `Search results for "${searchTerm}"`}
              {!searchTerm && Object.values(filters).some(f => f) && 'Filtered results'}
            </p>
          </div>
        </div>

        {/* Students Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || Object.values(filters).some(f => f) ? 'No students found' : 'No students yet'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
              {searchTerm 
                ? `No students match "${searchTerm}". Try adjusting your search terms.` 
                : 'Get started by adding your first student to the system.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3.5 rounded-xl flex items-center space-x-3 hover:shadow-xl transition-all duration-200 mx-auto text-lg font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span>Add First Student</span>
              </button>
            )}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-3xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-xl">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {editingStudent ? 'Edit Student' : 'Enroll New Student'}
                      </h2>
                      <p className="text-gray-600">
                        {editingStudent ? 'Update student information' : 'Add a new student to the system'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              {!editingStudent && (
                <div className="flex gap-2 px-6 pt-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("add")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      activeTab === "add"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    ➕ One by One
                  </button>
                  <button
                    onClick={() => setActiveTab("import")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      activeTab === "import"
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    📤 Import File
                  </button>
                </div>
              )}
              
              {/* Add One by One Tab */}
              {activeTab === "add" && (
              <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {!editingStudent && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      User ID *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.user_id}
                      onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                      placeholder="Enter user ID"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Enter the ID of the user account to associate with this student
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.roll_number}
                      onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                      placeholder="e.g., 2024-CS-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Admission Date
                    </label>
                    <input
                      type="date"
                      value={formData.admission_date}
                      onChange={(e) => setFormData({...formData, admission_date: e.target.value})}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Class Section *
                    </label>
                    <select
                      required
                      value={formData.class_section}
                      onChange={(e) => setFormData({...formData, class_section: e.target.value})}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    >
                      <option value="">Select Class Section</option>
                      {classSections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Department *
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Academic Session *
                  </label>
                  <select
                    required
                    value={formData.academic_session}
                    onChange={(e) => setFormData({...formData, academic_session: e.target.value})}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  >
                    <option value="">Select Academic Session</option>
                    {academicSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-xl hover:shadow-xl transition-all duration-200 font-semibold text-base"
                  >
                    {editingStudent ? 'Update Student' : 'Enroll Student'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </>
              )}

              {/* Import from File Tab */}
              {activeTab === "import" && (
                <div className="p-6">
                  <FileImportUploader
                    importType="students"
                    description="Upload an Excel, CSV, or Word file with student data. Required columns: first_name, last_name, email, student_id, section, academic_session"
                    onImportComplete={() => {
                      // Refresh students and close modal
                      setTimeout(() => {
                        loadStudents();
                        setShowForm(false);
                      }, 1000);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;