# 🎯 Bulk Import - Quick Start Guide

## Where to Find It

The "📤 Import File" option is in each form's tab section:

### 🏛️ Rooms
```
Dashboard → Rooms page
↓
Form Section: "Add New Room"
↓
Click: "📤 Import File" tab
```

### 👨‍🏫 Teachers
```
Dashboard → Teachers page
↓
Click: "+" button (bottom right)
↓
Modal opens: "Add New Teacher"
↓
Click: "📤 Import File" tab
```

### 📚 Class Sections
```
Dashboard → Class Sections page
↓
Click: "Create New Section" button
↓
Modal opens
↓
Click: "📤 Import File" tab
```

### 📅 Academic Sessions
```
Dashboard → Academic Sessions page
↓
Click: "Create New Session" button
↓
Modal opens
↓
Click: "📤 Import File" tab
```

### ⏰ Time Slots
```
Dashboard → Time Slots page
↓
Form Section: "Add New Time Slot"
↓
Click: "📤 Import File" tab
```

## ⚡ 3-Step Process

### Step 1️⃣: Select File Format
```
File Format *
┌─────────────────────────┐
│ Excel (.xlsx, .xls)     │ ← Choose one
│ CSV (.csv)              │
│ Word (.docx)            │
└─────────────────────────┘
```

### Step 2️⃣: Upload File
```
Choose File *
┌─────────────────────────────────┐
│                                 │
│  Click to upload or drag/drop  │
│                                 │
│  Excel, CSV, or Word           │
│                                 │
└─────────────────────────────────┘
```
Click in the area or drag file onto it

### Step 3️⃣: Import
```
[Upload & Import Button] ← Click this
```

## ✅ Success
You'll see:
```
✅ Success!
45 records imported, 2 failed.

[View Details] ← Click to see what failed
```

## ❌ Error
You'll see:
```
❌ Error
Details about what went wrong

[View Details] ← Click for error log
```

## 📋 Quick Column Reference

### Rooms
```
room_number, room_type, capacity, department
A-101,      classroom,  40,       Computer Science
```

### Teachers
```
first_name, last_name, email,           department, employee_id
John,       Doe,       john@uni.com,    CS,         EMP001
```

### Sections
```
name,    section_code, department, academic_session, total_students, semester, year
BCS-1A,  A,            CS,         Spring 2024,      40,             1,        1
```

### Sessions
```
name,         session_type, department, start_date,  end_date,    is_active
Spring 2024,  morning,      CS,        2024-01-15,  2024-05-31,  true
```

### Time Slots
```
day,    start_time, end_time, slot_name
Monday, 08:00,      09:30,    Slot 1
```

## 🎨 What You'll See

### Upload Section
```
┌─────────────────────────────────────────────────┐
│ 📤 Import from File                             │
│ Upload a file with [Type] data                  │
│                                                 │
│ File Format *                                   │
│ [Select Box]                                    │
│                                                 │
│ Choose File *                                   │
│ [Upload Area]                                   │
│                                                 │
│ [Upload & Import Button]                        │
└─────────────────────────────────────────────────┘
```

### After Upload - Success
```
┌─────────────────────────────────────────────────┐
│ ✅ Success!                                     │
│ 45 records imported, 2 failed.                  │
│ [View Details]                                  │
└─────────────────────────────────────────────────┘
```

### After Upload - With Errors
```
┌─────────────────────────────────────────────────┐
│ ✅ Success!                                     │
│ 43 records imported, 2 failed.                  │
│ [View Details]                                  │
│                                                 │
│ ⚠️ View Errors (2)                             │
│ Row 5: Invalid capacity value                   │
│ Row 8: Department not found: "ENG"              │
└─────────────────────────────────────────────────┘
```

## 💻 File Preparation

### Create Excel File
1. Open Excel
2. Create columns with exact names (see reference above)
3. Add your data
4. Save as `.xlsx` or `.xls`
5. Upload

### Create CSV File
1. Open Notepad/Text Editor
2. Type: `room_number,room_type,capacity,department`
3. Add data: `A-101,classroom,40,CS`
4. Save as `.csv`
5. Upload

### Create Word File
1. Open Word
2. Insert → Table
3. Add headers and data
4. Save as `.docx`
5. Upload

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| File won't upload | Check format is Excel, CSV, or Word |
| All records failed | Check headers match exactly (case-sensitive) |
| Some failed | Click "View Errors" to see what's wrong |
| Data not showing | Refresh page or check import results |

## 🎯 Best Practice

1. ✅ **Start small** - Test with 5 records first
2. ✅ **Check headers** - Must match exactly
3. ✅ **Validate data** - Check for errors before uploading
4. ✅ **Review results** - See what succeeded/failed
5. ✅ **Keep backup** - Keep copy of original file

## 📚 More Help

- See **BULK_IMPORT_GUIDE.md** for complete documentation
- See **SAMPLE_IMPORT_DATA.md** for example files
- Check error logs for specific issues

## 🚀 You're Ready!

Pick a form, click "📤 Import File" tab, upload your file, and import away! 🎉
