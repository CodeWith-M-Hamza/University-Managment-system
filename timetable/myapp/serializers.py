
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from .models import (
    User, Department, Teacher, Course, Room, TimeSlot, Schedule,
    AcademicSession, ClassSection, TeacherAssignment, Student,
    Program, CourseOffering, ScheduleException, GeneratedSchedule,
    BulkImportRequest, BulkImportItem, ImportTemplate
)

User = get_user_model()

# =========================
# BASE DATA SERIALIZERS
# =========================

class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "full_name",
            "user_type", "department", "department_name", "is_active"
        ]
        read_only_fields = ["id", "is_active", "user_type"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class AcademicSessionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = AcademicSession
        fields = [
            'id', 'name', 'session_type', 'department', 'department_name',
            'start_date', 'end_date', 'is_active'
        ]


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), write_only=True, source="department"
    )

    class Meta:
        model = Course
        fields = [
            'id', 'code', 'name', 'credit_hours', 'course_type', 
            'department', 'department_name', 'department_id'
        ]
        read_only_fields = ['id', 'department'] # department is provided by department_id on write


# class RoomSerializer(serializers.ModelSerializer):
#     department_name = serializers.CharField(source='department.name', read_only=True)
    
#     # We use a PrimaryKey field for writing the Department ID
#     department_id = serializers.PrimaryKeyRelatedField(
#         queryset=Department.objects.all(), 
#         write_only=True, 
#         source="department",
#         required=False, 
#         allow_null=True
#     )
    
#     class Meta:
#         model = Room
#         fields = [
#             'id', 'room_number', 'room_type', 'capacity', 
#             'department', 'department_id', 'department_name'
#         ]
#         read_only_fields = ['id', 'department']

#     def validate_department(self, value):
#         # Handle cases where the department ID is passed as null/none
#         if value == '' or value is None:
#             return None
#         return value

class RoomSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    # Accept department name as input
    department = serializers.CharField(write_only=True)
    
    class Meta:
        model = Room
        fields = [
            'id', 'room_number', 'room_type', 'capacity', 
            'department', 'department_name'
        ]
        read_only_fields = ['id', 'department_name']

    def create(self, validated_data):
        print("🎯 CREATE METHOD CALLED")  # Debug
        print("🎯 Validated data:", validated_data)
        
        # Extract department name from validated data
        dept_name = validated_data.pop('department', None)
        print("🎯 Department name:", dept_name)
        
        if not dept_name:
            raise serializers.ValidationError({"department": "This field is required."})
        
        # Get or create the department
        try:
            department = Department.objects.get(name__iexact=dept_name)
            print("✅ Found existing department:", department)
        except Department.DoesNotExist:
            # Create new department
            department = Department.objects.create(name=dept_name)
            print("✅ Created new department:", department)
        
        # Create room with department object
        print("🎯 Creating room with:", validated_data)
        room = Room.objects.create(
            department=department,  # This must be a Department object, not string
            **validated_data
        )
        print("✅ Room created successfully:", room)
        return room

    def update(self, instance, validated_data):
        # Handle department update if provided
        if 'department' in validated_data:
            dept_name = validated_data.pop('department')
            department, created = Department.objects.get_or_create(
                name=dept_name
            )
            instance.department = department
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class ClassSectionSerializer(serializers.ModelSerializer):
    # Read-only fields for display (keep these)
    department_name = serializers.CharField(source='department.name', read_only=True)
    academic_session_name = serializers.CharField(source='academic_session.name', read_only=True)
    
    # Write fields - accept names instead of IDs
    department = serializers.CharField(write_only=True)
    academic_session = serializers.CharField(write_only=True)

    class Meta:
        model = ClassSection
        fields = [
            'id', 'name', 'section_code', 
            # Read-only display fields
            'department_name', 'academic_session_name', 
            # Write fields (now accepting names)
            'department', 'academic_session',
            # Other fields
            'total_students', 'semester', 'year'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        # Extract department and session names
        department_name = validated_data.pop('department')
        academic_session_name = validated_data.pop('academic_session')
        
        # Look up or create department
        try:
            department = Department.objects.get(name=department_name)
        except Department.DoesNotExist:
            raise serializers.ValidationError(f"Department '{department_name}' does not exist")
        
        # Look up academic session
        try:
            academic_session = AcademicSession.objects.get(name=academic_session_name)
        except AcademicSession.DoesNotExist:
            raise serializers.ValidationError(f"Academic session '{academic_session_name}' does not exist")
        
        # Create the class section with the actual objects
        return ClassSection.objects.create(
            department=department,
            academic_session=academic_session,
            **validated_data
        )

    def update(self, instance, validated_data):
        # Handle department if provided
        if 'department' in validated_data:
            department_name = validated_data.pop('department')
            try:
                department = Department.objects.get(name=department_name)
                instance.department = department
            except Department.DoesNotExist:
                raise serializers.ValidationError(f"Department '{department_name}' does not exist")
        
        # Handle academic session if provided
        if 'academic_session' in validated_data:
            academic_session_name = validated_data.pop('academic_session')
            try:
                academic_session = AcademicSession.objects.get(name=academic_session_name)
                instance.academic_session = academic_session
            except AcademicSession.DoesNotExist:
                raise serializers.ValidationError(f"Academic session '{academic_session_name}' does not exist")
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


# =========================
# PROGRAM/PROFILE SERIALIZERS
# =========================

class ProgramSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Program
        fields = [
            'id', 'name', 'code', 'department', 'department_name',
            'degree_type', 'duration_years', 'total_credits'
        ]


# --- TEACHER SERIALIZERS ---

class TeacherSerializer(serializers.ModelSerializer):
    # Read-only fields for display
    teacher_name = serializers.SerializerMethodField(read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'teacher_name', 'username', 'email', 
            'employee_id', 'department', 'department_name', 
            'max_lectures_per_week', 'phone'
        ]
        read_only_fields = ['id', 'user']
    
    def get_teacher_name(self, obj):
        # Improved name handling for display
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username.title()


class TeacherCreateSerializer(serializers.ModelSerializer):
    # Fields that belong to the User model, needed for creation
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=False, default='default123')
    
    class Meta:
        model = Teacher
        fields = [
            'first_name', 'last_name', 'email', 'username', 'password', 
            'employee_id', 'department', 'max_lectures_per_week', 'phone'
        ]
    
    @transaction.atomic
    def create(self, validated_data):
        user_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'email': validated_data.pop('email'),
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password', 'default123'),
            'user_type': 'teacher',
            'department': validated_data.get('department'),
        }
        
        user = User.objects.create_user(**user_data)
        teacher = Teacher.objects.create(user=user, **validated_data)
        return teacher


class TeacherUpdateSerializer(serializers.ModelSerializer):
    # Fields that update the linked User object
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    username = serializers.CharField(source='user.username', required=False)
    
    class Meta:
        model = Teacher
        fields = [
            'first_name', 'last_name', 'email', 'username', 
            'employee_id', 'department', 'max_lectures_per_week', 'phone'
        ]
    
    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Update User fields
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        # Update Teacher fields
        return super().update(instance, validated_data)


# --- STUDENT SERIALIZERS ---

class StudentSerializer(serializers.ModelSerializer):
    # Read-only fields for display
    student_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    section_name = serializers.CharField(source='class_section.name', read_only=True)
    academic_session_name = serializers.CharField(source='academic_session.name', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'user', 'student_name', 'username', 'email', 'roll_number',
            'class_section', 'section_name', 'department', 'department_name',
            'academic_session', 'academic_session_name', 'admission_date'
        ]
        read_only_fields = ['id', 'user']

class StudentCreateSerializer(serializers.ModelSerializer):
    # Fields that belong to the User model, needed for creation
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=False, default='default123')
    
    class Meta:
        model = Student
        fields = [
            'first_name', 'last_name', 'email', 'username', 'password', 
            'roll_number', 'class_section', 'department', 'academic_session', 
            'admission_date'
        ]
    
    @transaction.atomic
    def create(self, validated_data):
        user_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'email': validated_data.pop('email'),
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password', 'default123'),
            'user_type': 'student',
            'department': validated_data.get('department'),
        }
        
        user = User.objects.create_user(**user_data)
        student = Student.objects.create(user=user, **validated_data)
        return student


# =========================
# SCHEDULING/ASSIGNMENT SERIALIZERS
# =========================

class TeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    section_name = serializers.CharField(source='class_section.name', read_only=True)
    academic_session_name = serializers.CharField(source='academic_session.name', read_only=True)
    
    # Write-only fields
    teacher_id = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all(), write_only=True, source="teacher")
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), write_only=True, source="course")
    class_section_id = serializers.PrimaryKeyRelatedField(queryset=ClassSection.objects.all(), write_only=True, source="class_section")
    academic_session_id = serializers.PrimaryKeyRelatedField(queryset=AcademicSession.objects.all(), write_only=True, source="academic_session")
    
    class Meta:
        model = TeacherAssignment
        fields = [
            'id', 'teacher_id', 'teacher_name', 'course_id', 'course_name', 'course_code',
            'class_section_id', 'section_name', 'academic_session_id', 'academic_session_name',
            'is_responsible_teacher', 'assignment_date'
        ]


# class CourseOfferingSerializer(serializers.ModelSerializer):
#     course_name = serializers.CharField(source='course.name', read_only=True)
#     course_code = serializers.CharField(source='course.code', read_only=True)
    
#     # ADD CREDIT HOURS
#     credit_hours = serializers.IntegerField(source='course.credit_hours', read_only=True)
    
#     # ADD COURSE TYPE
#     course_type = serializers.CharField(source='course.course_type', read_only=True)
    
#     # ADD DEPARTMENT FIELDS
#     department_name = serializers.CharField(source='course.department.name', read_only=True)
#     department_id = serializers.PrimaryKeyRelatedField(
#         source='course.department', 
#         read_only=True
#     )
#     department_code = serializers.CharField(source='course.department.code', read_only=True)
    
#     section_name = serializers.CharField(source='class_section.name', read_only=True)
#     academic_session_name = serializers.CharField(source='academic_session.name', read_only=True)
    
#     # ENHANCE TEACHER INFO - include full teacher object for frontend
#     teacher_info = serializers.SerializerMethodField(read_only=True)
#     teacher_name = serializers.SerializerMethodField(read_only=True)
    
#     # Write-only fields
#     course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), write_only=True, source="course")
#     class_section_id = serializers.PrimaryKeyRelatedField(queryset=ClassSection.objects.all(), write_only=True, source="class_section")
#     academic_session_id = serializers.PrimaryKeyRelatedField(queryset=AcademicSession.objects.all(), write_only=True, source="academic_session")
#     teacher_id = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all(), write_only=True, source="teacher", required=False, allow_null=True)

#     class Meta:
#         model = CourseOffering
#         fields = [
#             'id', 'course_id', 'course_name', 'course_code',
#             # ADD THESE FIELDS:
#             'credit_hours', 'course_type',
#             # DEPARTMENT FIELDS:
#             'department_name', 'department_id', 'department_code',
#             'class_section_id', 'section_name',
#             'academic_session_id', 'academic_session_name',
#             'teacher_id', 'teacher_name', 'teacher_info', 'is_core'
#         ]
    
#     def get_teacher_name(self, obj):
#         if obj.teacher and obj.teacher.user:
#             return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}".strip()
#         return "Not Assigned"
    
#     def get_teacher_info(self, obj):
#         """Provide full teacher info for the frontend card"""
#         if obj.teacher:
#             return {
#                 'firstName': obj.teacher.user.first_name or "Unknown",
#                 'lastName': obj.teacher.user.last_name or "",
#                 'employeeId': obj.teacher.employee_id,
#                 'id': obj.teacher.id
#             }
#         return None

class CourseOfferingSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    credit_hours = serializers.IntegerField(source='course.credit_hours', read_only=True)
    course_type = serializers.CharField(source='course.course_type', read_only=True)
    department_name = serializers.CharField(source='course.department.name', read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(source='course.department', read_only=True)
    department_code = serializers.CharField(source='course.department.code', read_only=True)
    section_name = serializers.CharField(source='class_section.name', read_only=True)
    academic_session_name = serializers.CharField(source='academic_session.name', read_only=True)
    
    # FIX TEACHER SERIALIZATION - Use the actual teacher object
    teacher = TeacherSerializer(read_only=True)  # Include full teacher object
    
    # Keep the simplified teacher_name for convenience
    teacher_name = serializers.SerializerMethodField(read_only=True)
    
    # Write-only fields
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), write_only=True, source="course")
    class_section_id = serializers.PrimaryKeyRelatedField(queryset=ClassSection.objects.all(), write_only=True, source="class_section")
    academic_session_id = serializers.PrimaryKeyRelatedField(queryset=AcademicSession.objects.all(), write_only=True, source="academic_session")
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), 
        write_only=True, 
        source="teacher", 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = CourseOffering
        fields = [
            'id', 'course_id', 'course_name', 'course_code',
            'credit_hours', 'course_type',
            'department_name', 'department_id', 'department_code',
            'class_section_id', 'section_name',
            'academic_session_id', 'academic_session_name',
            'teacher_id', 'teacher', 'teacher_name', 'is_core'  # Include both teacher and teacher_name
        ]
    
    def get_teacher_name(self, obj):
        if obj.teacher and obj.teacher.user:
            full_name = f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}".strip()
            return full_name if full_name else "Teacher Assigned (No Name)"
        return "Not Assigned"
class ScheduleSerializer(serializers.ModelSerializer):
    # Read-only fields (full object data for display/nesting)
    teacher = TeacherSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    time_slot = TimeSlotSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)
    class_section = ClassSectionSerializer(read_only=True)
    
    # Write-only PrimaryKey fields for creation/update
    teacher_id = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all(), write_only=True, source="teacher")
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), write_only=True, source="course")
    room_id = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all(), write_only=True, source="room")
    time_slot_id = serializers.PrimaryKeyRelatedField(queryset=TimeSlot.objects.all(), write_only=True, source="time_slot")
    academic_session_id = serializers.PrimaryKeyRelatedField(queryset=AcademicSession.objects.all(), write_only=True, source="academic_session")
    class_section_id = serializers.PrimaryKeyRelatedField(queryset=ClassSection.objects.all(), write_only=True, source="class_section")

    class Meta:
        model = Schedule
        fields = [
            'id', 
            # Read fields (full nested objects)
            'time_slot', 'teacher', 'course', 'room', 'academic_session', 'class_section',
            # Write fields (Primary Keys)
            'time_slot_id', 'teacher_id', 'course_id', 'room_id', 'academic_session_id', 'class_section_id'
        ]


class ScheduleExceptionSerializer(serializers.ModelSerializer):
    schedule_info = serializers.SerializerMethodField(read_only=True)
    substitute_teacher_name = serializers.SerializerMethodField(read_only=True)
    alternate_room_number = serializers.SerializerMethodField(read_only=True)
    
    # Write-only fields
    schedule_id = serializers.PrimaryKeyRelatedField(queryset=Schedule.objects.all(), write_only=True, source="schedule")
    substitute_teacher_id = serializers.PrimaryKeyRelatedField(queryset=Teacher.objects.all(), write_only=True, source="substitute_teacher", required=False, allow_null=True)
    alternate_room_id = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all(), write_only=True, source="alternate_room", required=False, allow_null=True)

    class Meta:
        model = ScheduleException
        fields = [
            'id', 'schedule_id', 'schedule_info',
            'exception_type', 'exception_date', 'reason',
            'substitute_teacher_id', 'substitute_teacher_name',
            'alternate_room_id', 'alternate_room_number'
        ]
    
    def get_schedule_info(self, obj):
        # Safely access nested fields
        course_code = obj.schedule.course.code if obj.schedule and obj.schedule.course else 'N/A'
        teacher_name = obj.schedule.teacher.user.first_name if obj.schedule and obj.schedule.teacher and obj.schedule.teacher.user else 'N/A'
        time_slot = obj.schedule.time_slot.slot_name if obj.schedule and obj.schedule.time_slot else 'N/A'
        return f"{course_code} - {teacher_name} - {time_slot}"
    
    def get_substitute_teacher_name(self, obj):
        if obj.substitute_teacher and obj.substitute_teacher.user:
            return f"{obj.substitute_teacher.user.first_name} {obj.substitute_teacher.user.last_name}"
        return None
    
    def get_alternate_room_number(self, obj):
        if obj.alternate_room:
            return obj.alternate_room.room_number
        return None


class GeneratedScheduleSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    academic_session_name = serializers.CharField(source='academic_session.name', read_only=True)
    generated_by_display_name = serializers.SerializerMethodField(read_only=True)
    is_chairperson_schedule = serializers.SerializerMethodField(read_only=True)
    
    # For writing operations
    academic_session_id = serializers.PrimaryKeyRelatedField(queryset=AcademicSession.objects.all(), write_only=True, source="academic_session")
    department_id = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), write_only=True, source="department")

    def get_generated_by_display_name(self, obj):
        user = obj.generated_by
        if user and user.user_type in ['admin', 'chairperson']:
            return 'Chairperson'
        return user.username if user else 'Unknown User'

    def get_is_chairperson_schedule(self, obj):
        user = obj.generated_by
        return user and user.user_type in ['admin', 'chairperson']

    class Meta:
        model = GeneratedSchedule
        fields = [
            'id', 'name', 
            'academic_session_id', 'academic_session_name',
            'department_id', 'department_name', 
            'generated_by', 'generated_by_display_name', 'is_chairperson_schedule',
            'generated_at', 'is_active'
        ]
        read_only_fields = ['generated_by', 'generated_at', 'id']


# =========================
# UTILITY/VIEW SERIALIZERS
# =========================

class TeacherScheduleSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name')
    course_code = serializers.CharField(source='course.code')
    room_number = serializers.CharField(source='room.room_number')
    day = serializers.CharField(source='time_slot.day')
    start_time = serializers.TimeField(source='time_slot.start_time')
    end_time = serializers.TimeField(source='time_slot.end_time')
    section_name = serializers.CharField(source='class_section.name')
    session_name = serializers.CharField(source='academic_session.name')
    
    class Meta:
        model = Schedule
        fields = [
            'id', 'course_name', 'course_code', 'room_number',
            'day', 'start_time', 'end_time', 'section_name', 'session_name'
        ]


class SectionScheduleSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name')
    course_name = serializers.CharField(source='course.name')
    course_code = serializers.CharField(source='course.code')
    room_number = serializers.CharField(source='room.room_number')
    day = serializers.CharField(source='time_slot.day')
    start_time = serializers.TimeField(source='time_slot.start_time')
    end_time = serializers.TimeField(source='time_slot.end_time')
    session_name = serializers.CharField(source='academic_session.name')
    
    class Meta:
        model = Schedule
        fields = [
            'id', 'teacher_name', 'course_name', 'course_code', 
            'room_number', 'day', 'start_time', 'end_time', 'session_name'
        ]


class RoomScheduleSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.get_full_name')
    course_name = serializers.CharField(source='course.name')
    course_code = serializers.CharField(source='course.code')
    section_name = serializers.CharField(source='class_section.name')
    day = serializers.CharField(source='time_slot.day')
    start_time = serializers.TimeField(source='time_slot.start_time')
    end_time = serializers.TimeField(source='time_slot.end_time')
    session_name = serializers.CharField(source='academic_session.name')
    
    class Meta:
        model = Schedule
        fields = [
            'id', 'teacher_name', 'course_name', 'course_code',
            'section_name', 'day', 'start_time', 'end_time', 'session_name'
        ]


class BulkScheduleSerializer(serializers.Serializer):
    """Serializer for bulk schedule operations that handles multiple Schedule objects."""
    schedules = ScheduleSerializer(many=True)
    
    @transaction.atomic
    def create(self, validated_data):
        schedules_data = validated_data.pop('schedules')
        schedules = []
        for schedule_data in schedules_data:
            # We must use the create method of the nested serializer
            # ScheduleSerializer handles the PrimaryKey fields correctly.
            schedule_serializer = ScheduleSerializer(data=schedule_data)
            schedule_serializer.is_valid(raise_exception=True)
            schedule = schedule_serializer.save()
            schedules.append(schedule)
        return {'schedules': schedules}


class ScheduleImportSerializer(serializers.Serializer):
    """Serializer for metadata needed during schedule import (CSV/Excel)"""
    academic_session = serializers.PrimaryKeyRelatedField(queryset=AcademicSession.objects.all())
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    file = serializers.FileField()
    
    class Meta:
        fields = ['academic_session', 'department', 'file']


# =========================
# BULK IMPORT SERIALIZERS
# =========================

class BulkImportItemSerializer(serializers.ModelSerializer):
    """Serializer for individual items in a bulk import."""
    
    class Meta:
        model = BulkImportItem
        fields = [
            'id', 'row_number', 'status', 'raw_data', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BulkImportRequestSerializer(serializers.ModelSerializer):
    """Serializer for bulk import requests."""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, required=False)
    session_name = serializers.CharField(source='academic_session.name', read_only=True, required=False)
    items = BulkImportItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = BulkImportRequest
        fields = [
            'id', 'import_type', 'file_format', 'file', 'department', 'department_name',
            'academic_session', 'session_name', 'status', 'created_at', 'processed_at',
            'created_by', 'created_by_name', 'total_records', 'successful_records',
            'failed_records', 'import_summary', 'error_log', 'items'
        ]
        read_only_fields = [
            'id', 'status', 'created_at', 'processed_at', 'total_records',
            'successful_records', 'failed_records', 'import_summary', 'error_log', 'items'
        ]


class BulkImportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new bulk import request."""
    from .models import BulkImportRequest
    
    file = serializers.FileField(required=True)
    
    class Meta:
        model = BulkImportRequest
        fields = [
            'import_type', 'file_format', 'file', 'department', 'academic_session'
        ]
    
    def create(self, validated_data):
        # Add the current user as created_by
        validated_data['created_by'] = self.context['request'].user
        return BulkImportRequest.objects.create(**validated_data)


class ImportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for import templates."""
    
    class Meta:
        model = ImportTemplate
        fields = [
            'id', 'template_type', 'columns', 'example_file', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']