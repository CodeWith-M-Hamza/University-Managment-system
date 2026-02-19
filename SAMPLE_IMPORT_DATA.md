# 📊 Sample Bulk Import Files

This file contains example data you can copy to create test files for bulk importing.

## 🏛️ Rooms Import - Excel/CSV

Save as `rooms.csv` or create as Excel with these columns:

```csv
room_number,room_type,capacity,department
A-101,classroom,40,Computer Science
A-102,classroom,45,Computer Science
A-103,classroom,50,Computer Science
B-201,classroom,35,Physics
B-202,lab,25,Physics
B-203,lab,30,Physics
C-301,classroom,40,Chemistry
C-302,lab,20,Chemistry
L-101,lab,30,Mathematics
L-102,classroom,50,Mathematics
AUDIT-01,auditorium,200,General
AUDIT-02,auditorium,150,General
```

## 👨‍🏫 Teachers Import - Excel/CSV

Save as `teachers.csv` or create as Excel:

```csv
first_name,last_name,email,department,employee_id
John,Doe,john.doe@university.com,Computer Science,EMP001
Jane,Smith,jane.smith@university.com,Computer Science,EMP002
Michael,Johnson,michael.johnson@university.com,Physics,EMP003
Sarah,Williams,sarah.williams@university.com,Physics,EMP004
Robert,Brown,robert.brown@university.com,Chemistry,EMP005
Emily,Davis,emily.davis@university.com,Chemistry,EMP006
David,Miller,david.miller@university.com,Mathematics,EMP007
Lisa,Wilson,lisa.wilson@university.com,Mathematics,EMP008
James,Moore,james.moore@university.com,Computer Science,EMP009
Patricia,Taylor,patricia.taylor@university.com,Physics,EMP010
```

## 📚 Class Sections Import - Excel/CSV

Save as `sections.csv` or create as Excel:

```csv
name,section_code,department,academic_session,total_students,semester,year
BCS-1A,A,Computer Science,Spring 2024,40,1,1
BCS-1B,B,Computer Science,Spring 2024,42,1,1
BCS-1C,C,Computer Science,Spring 2024,41,1,1
BCS-2A,A,Computer Science,Spring 2024,38,2,2
BCS-2B,B,Computer Science,Spring 2024,39,2,2
BS-Phys-1A,A,Physics,Spring 2024,35,1,1
BS-Phys-1B,B,Physics,Spring 2024,36,1,1
BS-Chem-1A,A,Chemistry,Spring 2024,30,1,1
BS-Math-1A,A,Mathematics,Spring 2024,45,1,1
BS-Math-2A,A,Mathematics,Spring 2024,42,2,2
```

## 📅 Academic Sessions Import - Excel/CSV

Save as `sessions.csv` or create as Excel:

```csv
name,session_type,department,start_date,end_date,is_active
Spring 2024,morning,Computer Science,2024-01-15,2024-05-31,true
Spring 2024,morning,Physics,2024-01-15,2024-05-31,true
Spring 2024,morning,Chemistry,2024-01-15,2024-05-31,true
Spring 2024,morning,Mathematics,2024-01-15,2024-05-31,true
Spring 2024,evening,Computer Science,2024-01-15,2024-05-31,false
Fall 2024,morning,Computer Science,2024-09-01,2024-12-20,false
Fall 2024,morning,Physics,2024-09-01,2024-12-20,false
Summer 2024,morning,Computer Science,2024-06-01,2024-08-15,false
```

## ⏰ Time Slots Import - Excel/CSV

Save as `timeslots.csv` or create as Excel:

```csv
day,start_time,end_time,slot_name
Monday,08:00,09:30,Slot 1
Monday,09:30,11:00,Slot 2
Monday,11:00,12:30,Slot 3
Monday,13:00,14:30,Slot 4
Monday,14:30,16:00,Slot 5
Tuesday,08:00,09:30,Slot 1
Tuesday,09:30,11:00,Slot 2
Tuesday,11:00,12:30,Slot 3
Tuesday,13:00,14:30,Slot 4
Tuesday,14:30,16:00,Slot 5
Wednesday,08:00,09:30,Slot 1
Wednesday,09:30,11:00,Slot 2
Wednesday,11:00,12:30,Slot 3
Wednesday,13:00,14:30,Slot 4
Wednesday,14:30,16:00,Slot 5
Thursday,08:00,09:30,Slot 1
Thursday,09:30,11:00,Slot 2
Thursday,11:00,12:30,Slot 3
Thursday,13:00,14:30,Slot 4
Thursday,14:30,16:00,Slot 5
Friday,08:00,09:30,Slot 1
Friday,09:30,11:00,Slot 2
Friday,11:00,12:30,Slot 3
Friday,13:00,14:30,Slot 4
Friday,14:30,16:00,Slot 5
```

## 🎯 How to Use These Examples

### Option 1: Create Excel Files
1. Copy the CSV data above
2. Paste into Excel
3. Save as `.xlsx` file
4. Use for bulk import

### Option 2: Create CSV Files
1. Copy the CSV data above
2. Save as `.csv` file (using Notepad or text editor)
3. Use for bulk import

### Option 3: Create Word Files
1. Copy data including headers
2. Paste into Word
3. Insert a Table (insert columns/rows matching headers)
4. Copy headers and data into table
5. Save as `.docx` file
6. Use for bulk import

## 📌 Important Notes

- **Modify Values** - Update room_number, teacher names, etc. for your needs
- **Match Departments** - Use departments that exist in your system
- **Use Real Data** - These are examples; replace with actual data
- **Date Format** - Keep dates as `YYYY-MM-DD` (2024-01-15)
- **Time Format** - Keep times as `HH:MM` (08:00, 14:30)
- **Booleans** - Use `true` or `false` for yes/no fields

## ✅ Testing Workflow

1. **Test with small file first**
   - Create file with 3-5 records
   - Try upload
   - Verify it works

2. **Check results**
   - Look for success/failed count
   - Review error logs if any failed
   - Verify data in list

3. **Import full data**
   - Once confident, import all data
   - Monitor results
   - Handle any errors

## 🚀 Quick Start

1. Copy example data above
2. Create file (`.csv`, `.xlsx`, or `.docx`)
3. Go to form (Rooms, Teachers, Sections, Sessions, or Time Slots)
4. Click "📤 Import File" tab
5. Select file format
6. Upload file
7. See results!

## 💡 Tips

- Start with Rooms or Time Slots (simpler data)
- Then try Teachers (requires department match)
- Then Sections (requires session to exist)
- Test in small batches before large imports
- Keep backup of original file
