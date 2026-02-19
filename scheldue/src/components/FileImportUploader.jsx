import React, { useState } from 'react';
import { Upload, FileUp, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';
import api from '../Api';

const FileImportUploader = ({ importType, onImportComplete, description }) => {
  const [file, setFile] = useState(null);
  const [fileFormat, setFileFormat] = useState('excel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [results, setResults] = useState(null);

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

      const formData = new FormData();
      formData.append('file', file);
      formData.append('import_type', importType);
      formData.append('file_format', fileFormat);

      // Create import request
      const createResponse = await api.post('/bulk-imports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const importId = createResponse.data.id;

      // Process the import
      const processResponse = await api.post(`/bulk-imports/${importId}/process/`);

      setResults(processResponse.data);
      setSuccess(
        `✅ Success! ${processResponse.data.successful_records} records imported, ${processResponse.data.failed_records} failed.`
      );

      // Reset form
      setFile(null);
      setFileFormat('excel');
      document.getElementById(`fileInput-${importType}`).value = '';

      // Callback to refresh parent component
      if (onImportComplete) {
        onImportComplete(processResponse.data);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Import failed';
      setError(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-dashed border-purple-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileUp className="h-6 w-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">📤 Import from File</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-700 text-sm font-medium">{success}</p>
            {results?.error_log && (
              <details className="mt-2">
                <summary className="text-xs text-green-600 cursor-pointer">View Details</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border border-green-200 overflow-auto max-h-200">
                  {results.error_log}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Format Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">File Format *</label>
          <select
            value={fileFormat}
            onChange={(e) => setFileFormat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          >
            <option value="excel">Excel (.xlsx, .xls)</option>
            <option value="csv">CSV (.csv)</option>
            <option value="word">Word (.docx)</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose File *</label>
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer bg-white">
            <input
              id={`fileInput-${importType}`}
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.docx,.doc"
              className="hidden"
            />
            <label htmlFor={`fileInput-${importType}`} className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-purple-400" />
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Excel, CSV, or Word</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload & Import
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FileImportUploader;
