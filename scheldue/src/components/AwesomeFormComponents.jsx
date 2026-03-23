import React from 'react';
import { 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader
} from 'lucide-react';

/**
 * Awesome Form Dialog Component
 * Beautiful modal for data entry with validations and feedback
 */
export const AwesomeFormDialog = ({
  isOpen,
  title,
  description,
  icon: Icon,
  fields,
  onSubmit,
  onClose,
  loading = false,
  successMessage = null,
  errorMessage = null,
  submitButtonText = "Save",
  color = "indigo" // indigo, blue, purple, green, orange, red
}) => {
  const [formData, setFormData] = React.useState({});
  const [errors, setErrors] = React.useState({});

  if (!isOpen) return null;

  const colorClasses = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', button: 'from-indigo-600 to-indigo-700', icon: 'text-indigo-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', button: 'from-blue-600 to-blue-700', icon: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', button: 'from-purple-600 to-purple-700', icon: 'text-purple-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', button: 'from-green-600 to-green-700', icon: 'text-green-600' },
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      if (field.validate && formData[field.name]) {
        const error = field.validate(formData[field.name]);
        if (error) newErrors[field.name] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
      setFormData({});
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${colors.bg} border-b ${colors.border} px-8 py-6 flex items-start justify-between`}>
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="p-3 bg-white rounded-lg">
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(field => (
              <FormField
                key={field.name}
                field={field}
                value={formData[field.name] || ''}
                onChange={handleChange}
                error={errors[field.name]}
                color={color}
              />
            ))}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${colors.button} hover:shadow-lg hover:${colors.button} text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-8`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                submitButtonText
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Form Field Component
 * Renders different input types with validation feedback
 */
const FormField = ({ field, value, onChange, error, color }) => {
  const errorColor = error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-indigo-500';

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      {field.type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={`w-full px-4 py-2.5 border-2 ${errorColor} rounded-lg focus:outline-none transition text-sm`}
        >
          <option value="">{field.placeholder || `Select ${field.label}`}</option>
          {field.options?.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.name || opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows || 3}
          className={`w-full px-4 py-2.5 border-2 ${errorColor} rounded-lg focus:outline-none transition text-sm`}
        />
      ) : (
        <input
          type={field.type || 'text'}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
          className={`w-full px-4 py-2.5 border-2 ${errorColor} rounded-lg focus:outline-none transition text-sm`}
        />
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {field.help && (
        <p className="text-gray-500 text-xs mt-1">{field.help}</p>
      )}
    </div>
  );
};

/**
 * Data Card Component
 * Beautiful card for displaying records with edit/delete options
 */
export const DataCard = ({
  data,
  fields,
  onEdit,
  onDelete,
  color = "indigo",
  title,
  subtitle
}) => {
  const colorClasses = {
    indigo: 'hover:border-indigo-300 hover:shadow-indigo-100',
    blue: 'hover:border-blue-300 hover:shadow-blue-100',
    purple: 'hover:border-purple-300 hover:shadow-purple-100',
    green: 'hover:border-green-300 hover:shadow-green-100',
  };

  return (
    <div className={`bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg transition ${colorClasses[color]}`}>
      {/* Card Header */}
      {(title || subtitle) && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}

      {/* Fields */}
      <div className="space-y-3">
        {fields.map(field => (
          <div key={field.key} className="flex justify-between items-start">
            <span className="text-sm text-gray-600 font-medium">{field.label}:</span>
            <span className="text-sm text-gray-900 font-semibold text-right">{data[field.key] || 'N/A'}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(data)}
              className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-semibold text-sm transition"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(data.id)}
              className="flex-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold text-sm transition"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Empty State Component
 */
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <Icon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      {action}
    </div>
  );
};
