# 📤 Bulk Import Guide

The bulk import feature allows you to add multiple rooms, teachers, sections, sessions, and time slots from Excel, CSV, or Word files instead of entering them one by one.

## 🎯 Where to Find Bulk Import

The **Bulk Import** option is integrated into existing forms:

1. **Rooms** → Click the form → "📤 Import File" tab
2. **Teachers** → Click "+" button → "📤 Import File" tab in modal
3. **Class Sections** → Click "Create New Section" → "📤 Import File" tab
4. **Academic Sessions** → Click "Create New Session" → "📤 Import File" tab
5. **Time Slots** → "📤 Import File" tab

## 📋 Required Columns for Each Import Type

### 🏛️ Rooms
```
room_number | room_type | capacity | department
A-101       | classroom | 40       | Computer Science
LAB-201     | lab       | 25       | Physics
```

### 👨‍🏫 Teachers
```
first_name | last_name | email              | department | employee_id
John       | Doe       | john@university.com | CS         | EMP001
Jane       | Smith     | jane@university.com | Physics    | EMP002
```

### 📚 Class Sections
```
name      | section_code | department | academic_session | total_students | semester | year
BCS-1A    | A           | CS         | Spring 2024       | 40             | 1        | 1
BCS-1B    | B           | CS         | Spring 2024       | 45             | 1        | 1
```

### 📅 Academic Sessions
```
name         | session_type | department | start_date | end_date   | is_active
Spring 2024  | morning      | CS         | 2024-01-01 | 2024-05-31 | true
Fall 2024    | evening      | Physics    | 2024-09-01 | 2024-12-31 | false
```

### ⏰ Time Slots
```
day       | start_time | end_time | slot_name
Monday    | 08:00      | 09:30    | Slot 1
Tuesday   | 09:30      | 11:00    | Slot 2
```

## 📁 Supported File Formats

### ✅ Excel (.xlsx, .xls)
- Most recommended format
- Headers in the first row
- Data starting from row 2

**Example structure:**
```
room_number | room_type | capacity | department
A-101       | classroom | 40       | CS
A-102       | classroom | 40       | CS
LAB-01      | lab       | 25       | Physics
```

### ✅ CSV (.csv)
- Comma or semicolon separated values
- Headers in the first row
- Use proper escaping for special characters

**Example structure:**
```csv
room_number,room_type,capacity,department
A-101,classroom,40,CS
A-102,classroom,40,CS
LAB-01,lab,25,Physics
```

### ✅ Word (.docx)
- Must contain a **table**
- Headers in the first row of the table
- Only the first table will be processed

## 🚀 How to Use

### Step 1: Prepare Your File
1. Create a spreadsheet or table with data
2. Ensure headers match exactly (case-sensitive)
3. Save as `.xlsx`, `.csv`, or `.docx`

### Step 2: Upload File
1. Go to the relevant form (Rooms, Teachers, etc.)
2. Click the "📤 Import File" tab
3. Select the file format (Excel, CSV, or Word)
4. Click "Choose File" and select your file
5. Click "Upload & Import"

### Step 3: Monitor Import
- **Success:** Shows "✅ Success! X records imported, Y failed"
- **Errors:** Shows detailed error messages with row numbers
- **Review:** Click "View Details" to see individual item status

## ⚠️ Important Notes

### Column Names (Case-Sensitive)
Ensure your column headers match **exactly**:
- ✅ `room_number` (with underscore)
- ❌ `Room Number` (with spaces)
- ❌ `roomNumber` (camelCase)

### Date Formats
Supported date formats:
- `YYYY-MM-DD` (2024-01-15) ✅ Recommended
- `MM/DD/YYYY` (01/15/2024)
- `DD/MM/YYYY` (15/01/2024)

### Time Formats
Use 24-hour format:
- ✅ `08:00`, `13:30`, `23:59`
- ❌ `8:00 AM`, `01:30 PM`

### Boolean Values
For yes/no fields (like `is_active`):
- ✅ `true`, `TRUE`, `True`, `1`, `yes`, `YES`
- ✅ `false`, `FALSE`, `False`, `0`, `no`, `NO`

### Empty Cells
- Leave empty for optional fields
- Required fields must have a value

## 🔧 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Room with this room_number already exists` | Duplicate room number | Check existing rooms, use unique numbers |
| `Invalid capacity value` | Non-numeric capacity | Ensure capacity is a number |
| `Department not found: XYZ` | Department doesn't exist | Create the department first, then import |
| `Invalid date format` | Wrong date format | Use `YYYY-MM-DD` format |
| `Invalid time format` | Wrong time format | Use 24-hour format (HH:MM) |

## 📊 Import Results

After import, you'll see:
- **Total Records:** Number of rows in file
- **✅ Successful:** Records created successfully
- **❌ Failed:** Records with errors

Click "View Details" to see:
- Individual item status
- Error logs with specific issues
- Import summary

## 💡 Tips & Tricks

### Batch Operations
- Import 50-100 records at a time for best performance
- Very large files (1000+) may take longer to process

### Testing
1. Create a small test file with 5-10 records
2. Verify import works
3. Then import full dataset

### Backup
- Always keep a backup of your original file
- Review import results before deleting the file

### Reusing Files
- You can import the same file multiple times
- System will create duplicates if data already exists
- Check for existing data before re-importing

## 🆘 Troubleshooting

### File Won't Upload
- Check file format (.xlsx, .csv, or .docx)
- Ensure file is not corrupted
- Try uploading a smaller test file first

### All Records Failed
- Verify column headers match exactly
- Check data types (numbers vs text)
- Ensure required fields are filled

### Partial Import (Some Failed)
- Review error log for specific row numbers
- Fix issues in source file
- Re-import the corrected file

## 📝 Example Files

### Rooms Import Template
```
room_number,room_type,capacity,department
A-101,classroom,40,Computer Science
A-102,classroom,45,Computer Science
LAB-01,lab,25,Physics
LAB-02,lab,30,Chemistry
```

### Teachers Import Template
```
first_name,last_name,email,department,employee_id
John,Doe,john@university.com,Computer Science,EMP001
Jane,Smith,jane@university.com,Physics,EMP002
Mike,Johnson,mike@university.com,Chemistry,EMP003
```

## 🎓 Best Practices

1. **Start Small** - Test with 5-10 records first
2. **Validate Data** - Check for duplicates and errors before importing
3. **Use Templates** - Follow provided column names exactly
4. **Monitor Progress** - Review import results and logs
5. **Keep Backups** - Save original files for reference

## 📞 Need Help?

If you encounter issues:
1. Check the error logs for specific messages
2. Review this guide for column names and formats
3. Contact system administrator for database-related issues
