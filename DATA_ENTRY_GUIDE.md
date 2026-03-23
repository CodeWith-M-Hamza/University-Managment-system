# 🎨 Awesome Forms - Data Entry Guide

## 📍 Access the Beautiful Forms

**Prerequisites: You must be logged in first!**
1. Go to: `http://localhost:5177/login`
2. Enter your credentials and log in
3. Then navigate to: `http://localhost:5177/data-entry`

```
✅ Courses (subjects)
✅ Teachers
✅ Rooms
✅ TimeSlots (with day and time)
✅ Class Sections (student groups)
✅ Course Offerings (course → section → teacher assignments)
✅ Academic Session
```

---

## 🚀 Step-by-Step Guide

### **STEP 1️⃣: Create Academic Sessions**
1. Click on **Sessions** tab in sidebar
2. Click **"Add Session"** button
3. Fill in:
   - **Session Name**: e.g., "Fall 2024"
   - **Session Type**: Morning / Evening
   - **Start Date**: When semester begins
   - **End Date**: When semester ends
   - **Active**: Yes/No

### **STEP 2️⃣: Add Departments**
> Note: Go to **Departments** menu from main navbar to add departments first

### **STEP 3️⃣: Create Courses**
1. Click on **Courses** tab
2. Click **"Add Course"** button
3. Fill in:
   - **Course Code**: e.g., "CS101"
   - **Course Name**: e.g., "Intro to Programming"
   - **Credit Hours**: e.g., 3
   - **Course Type**: Theory/Lab/Practical
   - **Department**: Select from dropdown

### **STEP 4️⃣: Add Teachers**
1. Click on **Teachers** tab
2. Click **"Add Teacher"** button
3. Fill in:
   - **First Name**: e.g., "John"
   - **Last Name**: e.g., "Doe"
   - **Email**: e.g., "john@university.edu"
   - **Employee ID**: e.g., "T001"
   - **Department**: Select from dropdown
   - **Phone**: (Optional)
   - **Max Lectures/Week**: e.g., "20"

### **STEP 5️⃣: Create Rooms**
1. Click on **Rooms** tab
2. Click **"Add Room"** button
3. Fill in:
   - **Room Number**: e.g., "A101"
   - **Capacity**: e.g., "50"
   - **Room Type**: Lecture Hall / Lab / Seminar Room

### **STEP 6️⃣: Create Time Slots**
1. Click on **Time Slots** tab
2. Click **"Add Time Slot"** button
3. Fill in:
   - **Day**: Monday - Saturday
   - **Start Time**: e.g., "09:00"
   - **End Time**: e.g., "10:00"

### **STEP 7️⃣: Create Class Sections**
1. Click on **Sections** tab
2. Click **"Add Section"** button
3. Fill in:
   - **Section Name**: e.g., "Section A"
   - **Section Code**: e.g., "SEC-A"
   - **Total Students**: e.g., "30"

### **STEP 8️⃣: Create Course Offerings**
1. Click on **Course Offerings** tab
2. Click **"Add Offering"** button
3. Fill in:
   - **Course**: Select from dropdown
   - **Teacher**: Select from dropdown
   - **Class Section**: Select from dropdown
   - **Is Core Course**: Yes/No

---

## 🎯 After Adding All Data

Once you've added all the above data, go to:
**"Generated Schedules"** → Click **"Generate Schedule"**

The system will **automatically create a conflict-free timetable** based on:
- ✅ Available teachers
- ✅ Available rooms
- ✅ Class timings
- ✅ Student capacity

---

## 💡 UI Features

Each form includes:
- 🎨 **Beautiful gradient backgrounds** with color-coded forms
- ⚡ **Real-time validation** with error messages
- 📱 **Responsive design** for mobile & desktop
- 🔍 **Search functionality** to find existing entries
- ✏️ **Edit & Delete** options for all entries
- 📊 **Success/Error notifications**

---

## 🔧 Pro Tips

1. **Add in order**: Sessions → Courses → Teachers → Rooms → Time Slots → Sections → Offerings
2. **Use meaningful codes**: Makes it easier to identify in dropdowns
3. **Set max classes**: Teachers have a weekly limit (prevents overload)
4. **Match room capacity**: Room size should fit section student count
5. **Create variety**: Add multiple sessions, time slots, and sections for better scheduling

---

## 📞 Need Help?

All forms have:
- 📍 Clear field labels
- 💬 Helpful hints and descriptions
- ⚠️ Red error messages for invalid entries
- ✅ Green success notifications

Just fill in the required fields (marked with *)
