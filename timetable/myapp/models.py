
# models.py - University Scheduling System Database Schema

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

# =========================
# Custom User Manager (Handles creating users and superusers)
# =========================
class CustomUserManager(BaseUserManager):
    """
    Custom manager for the User model, allowing login via email instead of username.
    """
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("The username must be provided")
        if not email:
            raise ValueError("The Email field must be set")
            
        email = self.normalize_email(email)
        # Use the custom model for user creation
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True) # Ensure superusers are active

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)


# =========================
# User Model (Customized to use Email for login)
# =========================
class User(AbstractUser):
    """
    The central user model, extending Django's built-in AbstractUser
    to include user roles and department affiliation.
    """
    USER_TYPES = (
        ('superadmin', 'Super Admin'),
        ('chairperson', 'Chairperson'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )

    # Note: username is required by AbstractUser but we make it optional here
    # and require email for login.
    username = models.CharField(
        max_length=150, 
        unique=True, 
        null=True, 
        blank=True
    )
    email = models.EmailField(unique=True) 
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='student')
    
    # Department is optional for Super Admin, mandatory for others via logic/forms
    department = models.ForeignKey(
        'Department', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Primary department affiliation for the user."
    )

    # === Authentication Overrides ===
    USERNAME_FIELD = "email"        # Use email for login
    REQUIRED_FIELDS = ["username"]  # Retain username as required field during creation

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.user_type})"


# --- Core Data Models ---
# ------------------------

# =========================
# Department Model
# =========================
class Department(models.Model):
    """Represents an academic department (e.g., CS, EE, Business)."""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True, help_text="Unique short code for the department (e.g., CSE, BUS).")

    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"

# =========================
# Program Model (e.g., BS Computer Science, MS Electrical Eng.)
# =========================
class Program(models.Model):
    """Represents a full degree program offered by a department."""
    DEGREE_TYPES = (
        ('bs', 'Bachelor of Science'),
        ('ba', 'Bachelor of Arts'),
        ('ms', 'Master of Science'),
        ('phd', 'PhD'),
    )
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True, help_text="Unique code for the program (e.g., BSCS, MSEE).")
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    degree_type = models.CharField(max_length=10, choices=DEGREE_TYPES)
    duration_years = models.IntegerField(default=4)
    total_credits = models.IntegerField(help_text="Total credit hours required for the program.")
    
    class Meta:
        verbose_name = "Program"
        verbose_name_plural = "Programs"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"

# =========================
# Course Model
# =========================
class Course(models.Model):
    """Represents a single academic course offered (e.g., Calculus I, Data Structures)."""
    COURSE_TYPES = (
        ('theory', 'Theory'),
        ('lab', 'Lab'),
    )

    code = models.CharField(max_length=20, unique=True, help_text="Unique course code (e.g., CS-101, MATH-205).")
    name = models.CharField(max_length=100)
    credit_hours = models.IntegerField()
    course_type = models.CharField(max_length=10, choices=COURSE_TYPES)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, help_text="The department that offers this course.")

    class Meta:
        verbose_name = "Course"
        verbose_name_plural = "Courses"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


# =========================
# Room Model
# =========================
class Room(models.Model):
    """Represents a physical classroom or laboratory."""
    ROOM_TYPES = (
        ('classroom', 'Classroom'),
        ('lab', 'Laboratory'),
    )

    room_number = models.CharField(max_length=20, unique=True)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPES)
    capacity = models.IntegerField()
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE, 
        help_text="The department primarily responsible for this room."
    )

    class Meta:
        verbose_name = "Room"
        verbose_name_plural = "Rooms"
        ordering = ['room_number']

    def __str__(self):
        return f"{self.room_number} ({self.room_type})"


# =========================
# TimeSlot Model
# =========================
class TimeSlot(models.Model):
    """Defines a recurring block of time for classes (e.g., Monday 8:00 AM - 9:30 AM)."""
    DAYS_OF_WEEK = (
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
    )

    day = models.CharField(max_length=10, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_name = models.CharField(max_length=50, help_text="A friendly name for the slot (e.g., 'Morning Slot 1').")

    class Meta:
        unique_together = ['day', 'slot_name']
        verbose_name = "Time Slot"
        verbose_name_plural = "Time Slots"
        ordering = ['day', 'start_time']

    def __str__(self):
        return f"{self.day.title()} {self.slot_name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"


# =========================
# Academic Session Model (Semester/Term)
# =========================
class AcademicSession(models.Model):
    """Represents a term or semester (e.g., Fall 2024, Spring 2025)."""
    SESSION_TYPES = (
        ('morning', 'Morning Session'),
        ('evening', 'Evening Session'),
    )
    
    name = models.CharField(max_length=100)
    session_type = models.CharField(max_length=10, choices=SESSION_TYPES)
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE,
        help_text="The department running or managing this session."
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True, help_text="Is this the current active session?")
    
    class Meta:
        verbose_name = "Academic Session"
        verbose_name_plural = "Academic Sessions"
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.name} ({self.session_type})"

# =========================
# Class Section Model
# =========================
class ClassSection(models.Model):
    """Represents a specific student group taking classes together (e.g., BSCS 3rd Semester, Section A)."""
    SECTION_TYPES = (
        ('A', 'Section A'),
        ('B', 'Section B'),
        ('C', 'Section C'),
        ('D', 'Section D'),
    )
    
    name = models.CharField(max_length=50, help_text="Friendly name (e.g., BSCS 3A).")
    section_code = models.CharField(max_length=10, choices=SECTION_TYPES)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    total_students = models.IntegerField(default=0)
    semester = models.IntegerField(default=1) 
    year = models.IntegerField(default=1) 
    
    class Meta:
        # Ensures no two sessions have the same section name (e.g., two "BSCS 3A" in Fall 2024)
        unique_together = ['name', 'academic_session'] 
        verbose_name = "Class Section"
        verbose_name_plural = "Class Sections"
        ordering = ['academic_session', 'semester', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.academic_session.name})"


# --- User Profile Models ---
# ---------------------------

# =========================
# Teacher Model (Profile linked to User)
# =========================
class Teacher(models.Model):
    """Extended profile for a user with 'teacher' type."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    max_lectures_per_week = models.IntegerField(default=20, help_text="Maximum number of classes a teacher can be assigned weekly.")
    phone = models.CharField(max_length=20, blank=True)
    
    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} ({self.employee_id})"


# =========================
# Student Model (Profile linked to User)
# =========================
class Student(models.Model):
    """Extended profile for a user with 'student' type."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=20, unique=True, help_text="Unique student identification number.")
    # Student belongs to ONE section at a time
    class_section = models.ForeignKey(
        ClassSection, 
        on_delete=models.CASCADE,
        help_text="The current academic section the student is enrolled in."
    )
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    admission_date = models.DateField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ['roll_number']
        
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} ({self.roll_number})"


# --- Scheduling Models ---
# -------------------------

# =========================
# Course Offering Model (What course is offered to which section/session)
# =========================
class CourseOffering(models.Model):
    """
    Links a Course, a ClassSection, and an AcademicSession. 
    This is the pool of subjects that need to be scheduled.
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    class_section = models.ForeignKey(ClassSection, on_delete=models.CASCADE)
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    # The primary teacher assigned to deliver this course to this section
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True) 
    is_core = models.BooleanField(default=True, help_text="Is this a core/mandatory course for the section?")
    
    class Meta:
        # A section cannot be offered the same course twice in the same session
        unique_together = ['course', 'class_section', 'academic_session']
        verbose_name = "Course Offering"
        verbose_name_plural = "Course Offerings"
    
    def __str__(self):
        return f"{self.course.code} offered to {self.class_section.name} in {self.academic_session.name}"


# =========================
# Teacher Assignment Model (Explicit assignment of a teacher to an offering)
# =========================
class TeacherAssignment(models.Model):
    """
    Records the explicit assignment of a Teacher to teach a specific Course 
    to a specific ClassSection during a specific AcademicSession.
    """
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    class_section = models.ForeignKey(ClassSection, on_delete=models.CASCADE)
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    
    is_responsible_teacher = models.BooleanField(default=False, help_text="Is this teacher the primary coordinator for this section/course combination?")
    assignment_date = models.DateField(auto_now_add=True)
    
    class Meta:
        # A teacher cannot be assigned the same role twice
        unique_together = ['teacher', 'course', 'class_section', 'academic_session']
        verbose_name = "Teacher Assignment"
        verbose_name_plural = "Teacher Assignments"
    
    def __str__(self):
        return f"Assignment: {self.teacher.user.get_full_name()} -> {self.course.code} for {self.class_section.name}"


# =========================
# Schedule Model (The final Timetable Entry)
# =========================
class Schedule(models.Model):
    """
    A single entry in the master timetable, linking all resources:
    When (TimeSlot), Who (Teacher), What (Course), Where (Room), and To Whom (ClassSection).
    """
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    academic_session = models.ForeignKey(
        AcademicSession, 
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="The session this schedule block belongs to."
    )
    class_section = models.ForeignKey(
        ClassSection, 
        on_delete=models.CASCADE,
        help_text="The student group attending this class."
    )
    
    class Meta:
        verbose_name = "Schedule Entry"
        verbose_name_plural = "Schedule Entries"
        ordering = ['time_slot__day', 'time_slot__start_time']

        # === CONFLICT CONSTRAINTS (Ensures valid scheduling) ===
        unique_together = [
            # 1. Teacher cannot be assigned two classes at the same time
            ['time_slot', 'teacher', 'academic_session'], 
            # 2. Room cannot host two classes at the same time
            ['time_slot', 'room', 'academic_session'], 
            # 3. Class Section cannot attend two classes at the same time
            ['time_slot', 'class_section', 'academic_session']
        ]

    def __str__(self):
        return f"{self.course.code} by {self.teacher.user.get_full_name()} @ {self.room.room_number} on {self.time_slot}"


# =========================
# Schedule Exception Model (Overrides for the master schedule)
# =========================
class ScheduleException(models.Model):
    """Records one-time or temporary changes to a regular schedule entry."""
    EXCEPTION_TYPES = (
        ('cancelled', 'Class Cancelled'),
        ('room_change', 'Room Changed'),
        ('time_change', 'Time Changed'),
        ('substitute', 'Substitute Teacher'),
    )
    
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, help_text="The original schedule entry being overridden.")
    exception_type = models.CharField(max_length=20, choices=EXCEPTION_TYPES)
    exception_date = models.DateField()
    reason = models.TextField(blank=True)
    
    # Optional fields for change details
    substitute_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    alternate_room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "Schedule Exception"
        verbose_name_plural = "Schedule Exceptions"
        ordering = ['exception_date']

    def __str__(self):
        return f"{self.exception_type} for {self.schedule.course.code} on {self.exception_date}"

# =========================
# Generated Schedule Model (Metadata for a saved timetable)
# =========================
class GeneratedSchedule(models.Model):
    """Metadata to track different versions of generated timetables."""
    name = models.CharField(max_length=100, help_text="e.g., 'Draft 1 - Finalized'")
    academic_session = models.ForeignKey(AcademicSession, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    generated_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False, help_text="Is this the schedule currently being used by the institution?")
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Generated Schedule"
        verbose_name_plural = "Generated Schedules"
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.name} - {self.department} ({self.academic_session})"


# =========================
# Bulk Import Models
# =========================

# =========================
# Bulk Import Request Model (Track file uploads and their status)
# =========================
class BulkImportRequest(models.Model):
    """Tracks bulk import requests from Excel, CSV, or Word files."""
    
    IMPORT_TYPES = (
        ('sections', 'Class Sections'),
        ('sessions', 'Academic Sessions'),
        ('teachers', 'Teachers'),
        ('students', 'Students'),
        ('courses', 'Courses'),
        ('rooms', 'Rooms'),
        ('timeslots', 'Time Slots'),
        ('assignments', 'Teacher Assignments'),
    )
    
    FILE_FORMATS = (
        ('excel', 'Excel (.xlsx, .xls)'),
        ('csv', 'CSV (.csv)'),
        ('word', 'Word Document (.docx, .doc)'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed Successfully'),
        ('failed', 'Import Failed'),
        ('partial', 'Partially Completed'),
    )
    
    import_type = models.CharField(
        max_length=50, 
        choices=IMPORT_TYPES,
        help_text="What type of data is being imported?"
    )
    file_format = models.CharField(
        max_length=20, 
        choices=FILE_FORMATS,
        help_text="Format of the uploaded file"
    )
    file = models.FileField(
        upload_to='bulk_imports/%Y/%m/%d/',
        help_text="Upload Excel, CSV, or Word document"
    )
    
    department = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Department context for the import (if applicable)"
    )
    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Academic session context for the import (if applicable)"
    )
    
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, help_text="User who uploaded the file")
    
    total_records = models.IntegerField(default=0, help_text="Total records found in the file")
    successful_records = models.IntegerField(default=0, help_text="Records successfully imported")
    failed_records = models.IntegerField(default=0, help_text="Records that failed to import")
    
    import_summary = models.TextField(
        blank=True, 
        help_text="JSON summary of imported records (IDs, details)"
    )
    error_log = models.TextField(
        blank=True,
        help_text="Log of errors encountered during import"
    )
    
    class Meta:
        verbose_name = "Bulk Import Request"
        verbose_name_plural = "Bulk Import Requests"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['import_type']),
        ]
    
    def __str__(self):
        return f"{self.get_import_type_display()} ({self.get_file_format_display()}) - {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


# =========================
# Bulk Import Item Model (Individual record tracking)
# =========================
class BulkImportItem(models.Model):
    """Tracks individual records within a bulk import request."""
    
    ITEM_STATUS = (
        ('pending', 'Pending'),
        ('success', 'Imported Successfully'),
        ('error', 'Import Failed'),
        ('skipped', 'Skipped (Duplicate/Invalid)'),
    )
    
    import_request = models.ForeignKey(
        BulkImportRequest, 
        on_delete=models.CASCADE,
        related_name='items',
        help_text="Parent bulk import request"
    )
    
    row_number = models.IntegerField(help_text="Row number in the source file")
    status = models.CharField(
        max_length=20, 
        choices=ITEM_STATUS, 
        default='pending'
    )
    
    # Raw data from the file (stored as JSON for flexibility)
    raw_data = models.JSONField(
        help_text="Original data from the file as JSON"
    )
    
    # Created object references
    # These will be populated based on the import_type
    teacher = models.ForeignKey(
        Teacher, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    student = models.ForeignKey(
        Student, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    class_section = models.ForeignKey(
        ClassSection, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    academic_session = models.ForeignKey(
        AcademicSession, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    course = models.ForeignKey(
        Course, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    room = models.ForeignKey(
        Room, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    time_slot = models.ForeignKey(
        TimeSlot, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    teacher_assignment = models.ForeignKey(
        'TeacherAssignment', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    error_message = models.TextField(blank=True, help_text="Error details if import failed")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Bulk Import Item"
        verbose_name_plural = "Bulk Import Items"
        ordering = ['import_request', 'row_number']
    
    def __str__(self):
        return f"Row {self.row_number} - {self.status} - {self.import_request.get_import_type_display()}"


# =========================
# Import Template Model (Pre-defined templates for users)
# =========================
class ImportTemplate(models.Model):
    """
    Pre-defined templates showing users what columns/structure their import files should have.
    Helps users format their Excel/CSV/Word files correctly.
    """
    
    TEMPLATE_TYPES = (
        ('sections', 'Class Sections Template'),
        ('sessions', 'Academic Sessions Template'),
        ('teachers', 'Teachers Template'),
        ('students', 'Students Template'),
        ('courses', 'Courses Template'),
        ('rooms', 'Rooms Template'),
        ('timeslots', 'Time Slots Template'),
        ('assignments', 'Teacher Assignments Template'),
    )
    
    template_type = models.CharField(
        max_length=50, 
        choices=TEMPLATE_TYPES,
        unique=True
    )
    
    # Column definitions as JSON
    columns = models.JSONField(
        help_text="List of column definitions with names, types, and validation rules"
    )
    
    example_file = models.FileField(
        upload_to='import_templates/',
        help_text="Sample/template file users can download"
    )
    
    description = models.TextField(
        help_text="Instructions for filling out the import file"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Import Template"
        verbose_name_plural = "Import Templates"
    
    def __str__(self):
        return f"{self.get_template_type_display()}"