// src/components/BulkImport.jsx
import React, { useState, useEffect } from 'react';
import { Upload, FileUp, CheckCircle, AlertCircle, Loader, Download, Eye } from 'lucide-react';
import api from '../Api';

const BulkImport = () => {
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('sections');
  const [fileFormat, setFileFormat] = useState('excel');
  const [loading, setLoading] = useState(false);
  const [importId, setImportId] = useState(null);
  const [importDetails, setImportDetails] = useState(null);
  const [imports, setImports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // upload or history

  const IMPORT_TYPES = [
    { value: 'sections', label: 'Class Sections' },
    { value: 'sessions', label: 'Academic Sessions' },
    { value: 'rooms', label: 'Rooms' },
    { value: 'timeslots', label: 'Time Slots' },
  ];

  const FILE_FORMATS = [
    { value: 'excel', label: 'Excel (.xlsx)' },
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'word', label: 'Word (.docx)' },
  ];

  // Load import history
  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    try {
      const response = await api.get('/bulk-imports/');
      setImports(response.data.results || response.data);
    } catch (err) {
      console.error('Error loading import history:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!file) {
        setError('Please select a file to upload');
        setLoading(false);
        return;
      }

      // Create import request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('import_type', importType);
      formData.append('file_format', fileFormat);

      console.log('📤 Creating import request...');
      const createResponse = await api.post('/bulk-imports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newImportId = createResponse.data.id;
      setImportId(newImportId);
      setSuccess(`✅ Import request created (ID: ${newImportId}). Now processing...`);

      // Process the import
      console.log('⚙️ Processing import...');
      const processResponse = await api.post(`/bulk-imports/${newImportId}/process/`);

      setImportDetails(processResponse.data);
      setSuccess(
        `✅ Import completed! ${processResponse.data.successful_records} records imported, ${processResponse.data.failed_records} failed.`
      );

      // Reload history
      loadImportHistory();

      // Reset form
      setFile(null);
      setImportType('sections');
      setFileFormat('excel');
      document.getElementById('fileInput').value = '';
    } catch (error) {
      console.error('❌ Import error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Import failed';
      setError(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-orange-100 text-orange-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <FileUp className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📁 Bulk Import</h1>
          <p className="text-gray-600">Import data from Excel, CSV, or Word files</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'upload'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📤 Upload New
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📋 Import History ({imports.length})
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">Success</h3>
                  <p className="text-green-700 text-sm mt-1">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Import Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want to import? *
                </label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                >
                  {IMPORT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the type of data you're importing
                </p>
              </div>

              {/* File Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Format *
                </label>
                <select
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                >
                  {FILE_FORMATS.map(fmt => (
                    <option key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv,.docx,.doc"
                    className="hidden"
                  />
                  <label
                    htmlFor="fileInput"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <Upload className="h-12 w-12 text-purple-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Excel (.xlsx), CSV (.csv), or Word (.docx)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload & Import
                  </>
                )}
              </button>
            </form>

            {/* Instructions */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-3">📝 Required Columns</h3>
              <div className="text-sm text-blue-800 space-y-2">
                {importType === 'sections' && (
                  <p>name, section_code, department, academic_session, total_students, semester, year</p>
                )}
                {importType === 'sessions' && (
                  <p>name, session_type, department, start_date, end_date, is_active</p>
                )}
                {importType === 'rooms' && (
                  <p>room_number, room_type, capacity, department</p>
                )}
                {importType === 'timeslots' && (
                  <p>day, start_time, end_time, slot_name</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {imports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <FileUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No imports yet</p>
              </div>
            ) : (
              imports.map(imp => (
                <div
                  key={imp.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(imp.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {imp.import_type} - {imp.file_format}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(imp.status)}`}>
                            {imp.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          📅 {new Date(imp.created_at).toLocaleString()}
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Records:</span>
                            <p className="font-semibold">{imp.total_records}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">✅ Successful:</span>
                            <p className="font-semibold text-green-600">{imp.successful_records}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">❌ Failed:</span>
                            <p className="font-semibold text-red-600">{imp.failed_records}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setImportDetails(imp)}
                      className="ml-4 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </div>

                  {imp.error_log && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <details className="text-sm">
                        <summary className="font-medium text-red-600 cursor-pointer">
                          View Errors ({imp.failed_records})
                        </summary>
                        <pre className="mt-2 p-3 bg-red-50 rounded text-red-700 text-xs overflow-auto max-h-200">
                          {imp.error_log}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Details Modal */}
        {importDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Import Details</h2>
                    <p className="text-gray-600 mt-1">ID: {importDetails.id}</p>
                  </div>
                  <button
                    onClick={() => setImportDetails(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className={`text-lg font-semibold mt-1 ${
                        importDetails.status === 'completed' ? 'text-green-600' :
                        importDetails.status === 'failed' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {importDetails.status}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="text-lg font-semibold mt-1">{importDetails.import_type}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">✅ Successful</p>
                      <p className="text-lg font-semibold mt-1 text-green-600">{importDetails.successful_records}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">❌ Failed</p>
                      <p className="text-lg font-semibold mt-1 text-red-600">{importDetails.failed_records}</p>
                    </div>
                  </div>

                  {/* Error Log */}
                  {importDetails.error_log && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Error Log</h3>
                      <pre className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs overflow-auto max-h-300">
                        {importDetails.error_log}
                      </pre>
                    </div>
                  )}

                  {/* Import Summary */}
                  {importDetails.import_summary && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Import Summary</h3>
                      <pre className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs overflow-auto max-h-300">
                        {JSON.stringify(JSON.parse(importDetails.import_summary), null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Created: {new Date(importDetails.created_at).toLocaleString()}</p>
                    {importDetails.processed_at && (
                      <p>Processed: {new Date(importDetails.processed_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setImportDetails(null)}
                  className="mt-6 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImport;
