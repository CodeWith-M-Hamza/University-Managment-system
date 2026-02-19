# Bulk Import Feature - Setup & Usage Guide

## Overview

The Bulk Import feature allows administrators to quickly add large amounts of data (Sections, Sessions, Rooms, Time Slots, etc.) using Excel, CSV, or Word files instead of entering them one by one through the UI.

## Installation

### 1. Install Required Packages

```bash
pip install openpyxl python-docx
```

Or update requirements.txt and install:

```bash
pip install -r requirements.txt
```

### 2. Create and Run Migrations

```bash
python manage.py makemigrations myapp
python manage.py migrate
```

This creates the following database tables:
- `myapp_bulkimportrequest` - Tracks import requests
- `myapp_bulkimportitem` - Tracks individual records from imports
- `myapp_importtemplate` - Pre-defined templates for users

### 3. Register Admin Models

The admin models are already configured in `admin_bulk_import.py`. Update your `admin.py`:

```python
# Add to myapp/admin.py
from .admin_bulk_import import *  # This imports all admin configurations
```

### 4. Add URLs

Update `myapp/urls.py` to include bulk import endpoints:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_bulk_import import BulkImportViewSet, ImportTemplateViewSet

router = DefaultRouter()
router.register(r'bulk-imports', BulkImportViewSet, basename='bulk-import')
router.register(r'import-templates', ImportTemplateViewSet, basename='import-template')

urlpatterns = [
    # ... existing patterns ...
    path('api/', include(router.urls)),
]
```

## File Format Examples

### Class Sections (Excel/CSV)

| name | section_code | department | academic_session | total_students | semester | year |
|------|--------------|-----------|------------------|----------------|----------|------|
| BSCS 3A | A | Computer Science | Fall 2024 | 45 | 3 | 2 |
| BSCS 3B | B | Computer Science | Fall 2024 | 42 | 3 | 2 |
| BSEE 2A | A | Electrical Engineering | Fall 2024 | 50 | 2 | 1 |

### Academic Sessions (Excel/CSV)

| name | session_type | department | start_date | end_date | is_active |
|------|-------------|-----------|-----------|----------|-----------|
| Fall 2024 | morning | Computer Science | 2024-09-01 | 2024-12-20 | true |
| Spring 2025 | morning | Computer Science | 2025-01-15 | 2025-05-30 | true |
| Spring 2025 | evening | Electrical Engineering | 2025-01-15 | 2025-05-30 | true |

### Rooms (Excel/CSV)

| room_number | room_type | capacity | department |
|------------|-----------|----------|-----------|
| A101 | classroom | 50 | Computer Science |
| A102 | classroom | 40 | Computer Science |
| A201 | lab | 30 | Computer Science |

### Time Slots (Excel/CSV)

| day | start_time | end_time | slot_name |
|-----|-----------|----------|-----------|
| monday | 08:00 | 09:30 | Morning Slot 1 |
| monday | 10:00 | 11:30 | Morning Slot 2 |
| wednesday | 14:00 | 15:30 | Afternoon Slot 1 |

## Date Formats Supported

The importer automatically detects these date formats:
- `YYYY-MM-DD` (e.g., 2024-09-01)
- `MM/DD/YYYY` (e.g., 09/01/2024)
- `DD/MM/YYYY` (e.g., 01/09/2024)
- `DD-MM-YYYY` (e.g., 01-09-2024)

## Time Formats Supported

Times must be in 24-hour format:
- `HH:MM` (e.g., 08:00, 14:30)

## API Endpoints

### Create a New Import Request

```http
POST /api/bulk-imports/
Content-Type: multipart/form-data

file: [file content]
import_type: sections|sessions|rooms|timeslots
file_format: excel|csv|word
department: [department_id] (optional)
academic_session: [session_id] (optional)
```

### Process an Import

```http
POST /api/bulk-imports/{id}/process/
```

This parses the file and imports the data. Returns:
```json
{
    "status": "success",
    "message": "Imported 10 records successfully",
    "successful_records": 10,
    "failed_records": 0,
    "errors": []
}
```

### Get Import Status

```http
GET /api/bulk-imports/{id}/
```

### List All Imports

```http
GET /api/bulk-imports/
```

### Get Import Items (Records)

```http
GET /api/bulk-imports/{id}/items/
```

### Get Imports by Type

```http
GET /api/bulk-imports/by-type/?type=sections
```

### Get Statistics

```http
GET /api/bulk-imports/statistics/
```

Returns:
```json
{
    "total_imports": 5,
    "total_records": 150,
    "total_successful": 145,
    "total_failed": 5,
    "by_status": {
        "completed": 3,
        "partial": 1,
        "failed": 1
    },
    "by_type": {
        "sections": 2,
        "sessions": 2,
        "rooms": 1
    }
}
```

### Get Templates

```http
GET /api/import-templates/
GET /api/import-templates/by-type/?type=sections
```

## Frontend Integration

### Example React Component

```jsx
import React, { useState } from 'react';
import api from '../Api';

const BulkImportForm = () => {
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('sections');
  const [fileFormat, setFileFormat] = useState('excel');
  const [loading, setLoading] = useState(false);
  const [importId, setImportId] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create import request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('import_type', importType);
      formData.append('file_format', fileFormat);

      const response = await api.post('/bulk-imports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImportId(response.data.id);
      setStatus('created');

      // Process the import
      const processResponse = await api.post(
        `/bulk-imports/${response.data.id}/process/`
      );

      setStatus(`completed: ${processResponse.data.successful_records} successful, ${processResponse.data.failed_records} failed`);
    } catch (error) {
      setStatus(`error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={importType} onChange={(e) => setImportType(e.target.value)}>
        <option value="sections">Class Sections</option>
        <option value="sessions">Academic Sessions</option>
        <option value="rooms">Rooms</option>
        <option value="timeslots">Time Slots</option>
      </select>

      <select value={fileFormat} onChange={(e) => setFileFormat(e.target.value)}>
        <option value="excel">Excel (.xlsx)</option>
        <option value="csv">CSV (.csv)</option>
        <option value="word">Word (.docx)</option>
      </select>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept=".xlsx,.xls,.csv,.docx"
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Upload & Import'}
      </button>

      {status && <p>{status}</p>}
      {importId && <p>Import ID: {importId}</p>}
    </form>
  );
};

export default BulkImportForm;
```

## Error Handling

When an import fails on a row, you can:

1. Check the error log in the import details
2. View individual items with `GET /api/bulk-imports/{id}/items/`
3. Fix the problematic rows in your file
4. Re-upload with a new import request

Common errors:
- **Missing required fields**: Ensure all required columns are present
- **Invalid date format**: Check the date format matches one of the supported formats
- **Department not found**: Verify the department name matches exactly
- **Duplicate records**: Check for duplicate entries in your file

## Database Triggers & Validation

The importer automatically:
- ✅ Validates all required fields
- ✅ Checks for duplicate records
- ✅ Verifies foreign key references
- ✅ Parses and validates dates and times
- ✅ Logs all errors with row numbers
- ✅ Tracks success/failure metrics

## Performance Notes

- Large files (10,000+ rows) may take several minutes
- Consider splitting very large imports into multiple files
- The import process is atomic per row (one row's error doesn't affect others)
- Import summaries are stored as JSON for quick retrieval

## Troubleshooting

### Issue: "File format not supported"
**Solution**: Ensure your file extension matches the declared file_format

### Issue: "Department not found"
**Solution**: Department names are case-sensitive. Verify the exact spelling

### Issue: "Invalid date format"
**Solution**: Use one of the supported date formats listed above

### Issue: Import stuck on "processing"
**Solution**: Check Django logs for errors. May need to restart the server.

## Future Enhancements

Planned features:
- Bulk import for Teachers and Students
- Bulk import for Course Offerings
- Bulk import for Teacher Assignments
- CSV export of import results
- Async/background processing for large files
- Email notifications on import completion
