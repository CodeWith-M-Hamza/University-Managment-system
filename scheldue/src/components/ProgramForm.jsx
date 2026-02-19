// import React, { useState, useEffect } from 'react';
// import departmentService  from '../services/departmentService';

// const ProgramForm = ({ program, onSubmit, onCancel }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     code: '',
//     department: '',
//     degree_type: 'bs',
//     duration_years: 4,
//     total_credits: 120
//   });
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     loadDepartments();
//     if (program) {
//       setFormData({
//         name: program.name,
//         code: program.code,
//         department: program.department,
//         degree_type: program.degree_type,
//         duration_years: program.duration_years,
//         total_credits: program.total_credits
//       });
//     }
//   }, [program]);

//   const loadDepartments = async () => {
//     try {
//       const data = await departmentService.getAllDepartments();
//       setDepartments(data);
//     } catch (err) {
//       console.error('Error loading departments:', err);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     try {
//       await onSubmit(formData);
//     } catch (err) {
//       if (err.detail) {
//         setErrors({ general: err.detail });
//       } else if (typeof err === 'object') {
//         setErrors(err);
//       } else {
//         setErrors({ general: 'An error occurred' });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const degreeTypes = [
//     { value: 'bs', label: 'Bachelor of Science' },
//     { value: 'ba', label: 'Bachelor of Arts' },
//     { value: 'ms', label: 'Master of Science' },
//     { value: 'phd', label: 'PhD' }
//   ];

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//       <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
//         <div className="mt-3">
//           {/* Header */}
//           <div className="flex justify-between items-center pb-3 border-b">
//             <h3 className="text-lg font-medium text-gray-900">
//               {program ? 'Edit Program' : 'Create New Program'}
//             </h3>
//             <button
//               onClick={onCancel}
//               className="text-gray-400 hover:text-gray-500"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="mt-4 space-y-4">
//             {errors.general && (
//               <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
//                 {errors.general}
//               </div>
//             )}

//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                 Program Name *
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 required
//                 value={formData.name}
//                 onChange={handleChange}
//                 className={`mt-1 block w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2`}
//                 placeholder="e.g., Bachelor of Science in Computer Science"
//               />
//               {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
//             </div>

//             <div>
//               <label htmlFor="code" className="block text-sm font-medium text-gray-700">
//                 Program Code *
//               </label>
//               <input
//                 type="text"
//                 id="code"
//                 name="code"
//                 required
//                 value={formData.code}
//                 onChange={handleChange}
//                 className={`mt-1 block w-full border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2`}
//                 placeholder="e.g., BSCS"
//               />
//               {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
//             </div>

//             <div>
//               <label htmlFor="department" className="block text-sm font-medium text-gray-700">
//                 Department *
//               </label>
//               <select
//                 id="department"
//                 name="department"
//                 required
//                 value={formData.department}
//                 onChange={handleChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
//               >
//                 <option value="">Select Department</option>
//                 {departments.map(dept => (
//                   <option key={dept.id} value={dept.id}>
//                     {dept.name} ({dept.code})
//                   </option>
//                 ))}
//               </select>
//               {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
//             </div>

//             <div>
//               <label htmlFor="degree_type" className="block text-sm font-medium text-gray-700">
//                 Degree Type *
//               </label>
//               <select
//                 id="degree_type"
//                 name="degree_type"
//                 required
//                 value={formData.degree_type}
//                 onChange={handleChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
//               >
//                 {degreeTypes.map(type => (
//                   <option key={type.value} value={type.value}>
//                     {type.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label htmlFor="duration_years" className="block text-sm font-medium text-gray-700">
//                   Duration (Years) *
//                 </label>
//                 <input
//                   type="number"
//                   id="duration_years"
//                   name="duration_years"
//                   required
//                   min="1"
//                   max="6"
//                   value={formData.duration_years}
//                   onChange={handleChange}
//                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="total_credits" className="block text-sm font-medium text-gray-700">
//                   Total Credits *
//                 </label>
//                 <input
//                   type="number"
//                   id="total_credits"
//                   name="total_credits"
//                   required
//                   min="1"
//                   value={formData.total_credits}
//                   onChange={handleChange}
//                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
//                 />
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex justify-end space-x-3 pt-4">
//               <button
//                 type="button"
//                 onClick={onCancel}
//                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//               >
//                 {loading ? 'Saving...' : (program ? 'Update' : 'Create')}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProgramForm;








import React, { useState, useEffect } from 'react';
import departmentService from '../services/departmentService';

const ProgramForm = ({ program, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    degree_type: 'bs',
    duration_years: 4,
    total_credits: 120
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDepartments();
  }, []);

  // Initialize form when program or departments change
  useEffect(() => {
    if (program && departments.length > 0) {
      console.log('🔄 Initializing form with program:', program);
      console.log('📊 Available departments:', departments);
      
      setFormData({
        name: program.name || '',
        code: program.code || '',
        department: program.department?.id || program.department || '', // Handle both object and ID
        degree_type: program.degree_type || 'bs',
        duration_years: program.duration_years || 4,
        total_credits: program.total_credits || 120
      });
    }
  }, [program, departments]);

  const loadDepartments = async () => {
    try {
      console.log('📥 Loading departments...');
      const response = await departmentService.getAllDepartments();
      
      // Handle different API response structures
      let departmentsData = [];
      if (Array.isArray(response)) {
        departmentsData = response;
      } else if (response && Array.isArray(response.data)) {
        departmentsData = response.data;
      } else if (response && response.data) {
        departmentsData = response.data;
      }
      
      console.log('✅ Departments loaded:', departmentsData);
      setDepartments(departmentsData);
    } catch (err) {
      console.error('❌ Error loading departments:', err);
      setErrors(prev => ({ ...prev, departments: 'Failed to load departments' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Form field changed: ${name} = ${value}`);
    
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
    setLoading(true);
    setErrors({});

    console.log('📤 Submitting program data:', formData);

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('❌ Form submission error:', err);
      if (err.detail) {
        setErrors({ general: err.detail });
      } else if (typeof err === 'object') {
        setErrors(err);
      } else {
        setErrors({ general: 'An error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get department display name
  const getDepartmentDisplay = (deptId) => {
    if (!deptId) return 'Select Department';
    
    const department = departments.find(dept => 
      dept.id?.toString() === deptId.toString() || 
      dept._id?.toString() === deptId.toString()
    );
    
    return department ? `${department.name} (${department.code})` : 'Unknown Department';
  };

  const degreeTypes = [
    { value: 'bs', label: 'Bachelor of Science' },
    { value: 'ba', label: 'Bachelor of Arts' },
    { value: 'ms', label: 'Master of Science' },
    { value: 'phd', label: 'PhD' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {program ? 'Edit Program' : 'Create New Program'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Debug Info */}
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="font-semibold text-blue-800">Debug Info:</div>
            <div>Program: {program ? 'Editing' : 'Creating New'}</div>
            <div>Departments: {departments.length}</div>
            <div>Selected Dept: {formData.department || 'None'}</div>
            <div>Dept Display: {getDepartmentDisplay(formData.department)}</div>
            <div>Program Code: {formData.code || 'Not set'}</div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Program Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2`}
                placeholder="e.g., Bachelor of Science in Computer Science"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Program Code *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2`}
                placeholder="e.g., BSCS"
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department *
                {formData.department && (
                  <span className="text-green-600 ml-2">
                    ✓ {getDepartmentDisplay(formData.department)}
                  </span>
                )}
              </label>
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
            </div>

            <div>
              <label htmlFor="degree_type" className="block text-sm font-medium text-gray-700">
                Degree Type *
              </label>
              <select
                id="degree_type"
                name="degree_type"
                required
                value={formData.degree_type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                {degreeTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration_years" className="block text-sm font-medium text-gray-700">
                  Duration (Years) *
                </label>
                <input
                  type="number"
                  id="duration_years"
                  name="duration_years"
                  required
                  min="1"
                  max="6"
                  value={formData.duration_years}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="total_credits" className="block text-sm font-medium text-gray-700">
                  Total Credits *
                </label>
                <input
                  type="number"
                  id="total_credits"
                  name="total_credits"
                  required
                  min="1"
                  value={formData.total_credits}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (program ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgramForm;