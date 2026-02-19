# from django.contrib import admin
# from .models import (
#     User, Department, Teacher, Course, Room, 
#     TimeSlot, Schedule, AcademicSession, ClassSection, 
#     TeacherAssignment, Student, Program, CourseOffering,
#     ScheduleException, GeneratedSchedule
# )


# @admin.register(User)
# class UserAdmin(admin.ModelAdmin):
#     list_display = ("id", "username", "email", "user_type", "get_department", "is_active")
#     list_filter = ("user_type", "department", "is_active")
#     search_fields = ("email", "username", "first_name", "last_name")
    
#     def get_department(self, obj):
#         return obj.department.name if obj.department else "No Department"
#     get_department.short_description = "Department"


# @admin.register(Department)
# class DepartmentAdmin(admin.ModelAdmin):
#     list_display = ("id", "code", "name")
#     search_fields = ("code", "name")


# @admin.register(Teacher)
# class TeacherAdmin(admin.ModelAdmin):
#     list_display = ("id", "get_full_name", "employee_id", "department", "phone", "max_lectures_per_week")
#     list_filter = ("department",)
#     search_fields = ("employee_id", "user__first_name", "user__last_name", "user__email")

#     def get_full_name(self, obj):
#         return f"{obj.user.first_name} {obj.user.last_name}"
#     get_full_name.short_description = "Name"


# @admin.register(Course)
# class CourseAdmin(admin.ModelAdmin):
#     list_display = ("id", "code", "name", "credit_hours", "course_type", "department")
#     list_filter = ("course_type", "department")
#     search_fields = ("code", "name")


# @admin.register(Room)
# class RoomAdmin(admin.ModelAdmin):
#     list_display = ("id", "room_number", "room_type", "capacity", "department")
#     list_filter = ("room_type", "department")
#     search_fields = ("room_number",)


# @admin.register(TimeSlot)
# class TimeSlotAdmin(admin.ModelAdmin):
#     list_display = ("id", "day", "slot_name", "start_time", "end_time")
#     list_filter = ("day", "start_time", "end_time")
#     search_fields = ("slot_name",)


# @admin.register(Schedule)
# class ScheduleAdmin(admin.ModelAdmin):
#     list_display = ("id", "course", "teacher", "room", "get_day", "time_slot", "academic_session", "class_section")
#     list_filter = ("teacher", "room", "time_slot__day", "academic_session", "class_section")
#     search_fields = ("course__name", "teacher__user__first_name", "teacher__user__last_name", "class_section__name")
    
#     def get_day(self, obj):
#         return obj.time_slot.day.title()
#     get_day.short_description = "Day"


# @admin.register(AcademicSession)
# class AcademicSessionAdmin(admin.ModelAdmin):
#     list_display = ("id", "name", "session_type", "department", "start_date", "end_date", "is_active")
#     list_filter = ("session_type", "department", "is_active")
#     search_fields = ("name", "department__name")
#     date_hierarchy = "start_date"


# @admin.register(ClassSection)
# class ClassSectionAdmin(admin.ModelAdmin):
#     list_display = ("id", "name", "section_code", "department", "academic_session", "semester", "year", "total_students")
#     list_filter = ("department", "academic_session", "section_code", "semester", "year")
#     search_fields = ("name", "department__name")
#     list_select_related = ("department", "academic_session")


# @admin.register(TeacherAssignment)
# class TeacherAssignmentAdmin(admin.ModelAdmin):
#     list_display = ("id", "get_teacher_name", "get_course_code", "get_section_name", "academic_session", "is_responsible_teacher", "assignment_date")
#     list_filter = ("academic_session", "class_section__department", "is_responsible_teacher")
#     search_fields = ("teacher__user__first_name", "teacher__user__last_name", "course__code", "course__name", "class_section__name")
    
#     def get_teacher_name(self, obj):
#         return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}"
#     get_teacher_name.short_description = "Teacher"
    
#     def get_course_code(self, obj):
#         return obj.course.code
#     get_course_code.short_description = "Course"
    
#     def get_section_name(self, obj):
#         return obj.class_section.name
#     get_section_name.short_description = "Section"


# @admin.register(Student)
# class StudentAdmin(admin.ModelAdmin):
#     list_display = ("id", "get_student_name", "roll_number", "class_section", "department", "academic_session", "admission_date")
#     list_filter = ("department", "academic_session", "class_section")
#     search_fields = ("roll_number", "user__first_name", "user__last_name", "user__email")
    
#     def get_student_name(self, obj):
#         return f"{obj.user.first_name} {obj.user.last_name}"
#     get_student_name.short_description = "Student Name"


# # =========================
# # NEW ADMIN REGISTRATIONS FOR ADDED MODELS
# # =========================

# @admin.register(Program)
# class ProgramAdmin(admin.ModelAdmin):
#     list_display = ("id", "code", "name", "degree_type", "department", "duration_years", "total_credits")
#     list_filter = ("degree_type", "department")
#     search_fields = ("code", "name", "department__name")
#     list_select_related = ("department",)


# @admin.register(CourseOffering)
# class CourseOfferingAdmin(admin.ModelAdmin):
#     list_display = ("id", "get_course_code", "get_course_name", "get_section_name", "academic_session", "get_teacher_name", "is_core")
#     list_filter = ("academic_session", "class_section__department", "is_core")
#     search_fields = ("course__code", "course__name", "class_section__name", "teacher__user__first_name")
    
#     def get_course_code(self, obj):
#         return obj.course.code
#     get_course_code.short_description = "Course Code"
    
#     def get_course_name(self, obj):
#         return obj.course.name
#     get_course_name.short_description = "Course Name"
    
#     def get_section_name(self, obj):
#         return obj.class_section.name
#     get_section_name.short_description = "Section"
    
#     def get_teacher_name(self, obj):
#         if obj.teacher:
#             return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}"
#         return "Not Assigned"
#     get_teacher_name.short_description = "Teacher"


# @admin.register(ScheduleException)
# class ScheduleExceptionAdmin(admin.ModelAdmin):
#     list_display = ("id", "get_schedule_info", "exception_type", "exception_date", "get_substitute_teacher", "get_alternate_room")
#     list_filter = ("exception_type", "exception_date", "schedule__academic_session")
#     search_fields = ("schedule__course__code", "schedule__teacher__user__first_name", "reason")
#     date_hierarchy = "exception_date"
    
#     def get_schedule_info(self, obj):
#         return f"{obj.schedule.course.code} - {obj.schedule.teacher.user.first_name}"
#     get_schedule_info.short_description = "Original Schedule"
    
#     def get_substitute_teacher(self, obj):
#         if obj.substitute_teacher:
#             return f"{obj.substitute_teacher.user.first_name} {obj.substitute_teacher.user.last_name}"
#         return "No Substitute"
#     get_substitute_teacher.short_description = "Substitute Teacher"
    
#     def get_alternate_room(self, obj):
#         if obj.alternate_room:
#             return obj.alternate_room.room_number
#         return "Same Room"
#     get_alternate_room.short_description = "Alternate Room"


# @admin.register(GeneratedSchedule)
# class GeneratedScheduleAdmin(admin.ModelAdmin):
#     list_display = ("id", "name", "academic_session", "department", "generated_by", "generated_at", "is_active")
#     list_filter = ("academic_session", "department", "is_active")
#     search_fields = ("name", "department__name", "generated_by__email")
#     readonly_fields = ("generated_at",)
#     date_hierarchy = "generated_at"
    
#     def get_queryset(self, request):
#         return super().get_queryset(request).select_related(
#             'academic_session', 'department', 'generated_by'
#         )











# admin.py - Finalized Django Admin Configuration with Import/Export

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from import_export import resources, fields, widgets
from import_export.admin import ImportExportModelAdmin
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

# --- 1. Model Imports ---
from .models import (
    Department, Teacher, Course, Room, TimeSlot, Schedule, 
    AcademicSession, ClassSection, TeacherAssignment, Student, 
    Program, CourseOffering, ScheduleException, GeneratedSchedule
)

# Get the custom User model
User = get_user_model()


# =========================================================
# 📝 IMPORT/EXPORT RESOURCE DEFINITIONS (Enables Excel/CSV Uploads)
# =========================================================

# --- ForeignKey Widget for linking by Code/Name (non-ID fields) ---
class DepartmentForeignKeyWidget(widgets.ForeignKeyWidget):
    def __init__(self):
        super().__init__(Department, 'code')

class AcademicSessionForeignKeyWidget(widgets.ForeignKeyWidget):
    def __init__(self):
        super().__init__(AcademicSession, 'name')

# --- Resource Classes ---

class DepartmentResource(resources.ModelResource):
    class Meta:
        model = Department
        fields = ('id', 'name', 'code',) 
        import_id_fields = ('code',)

class AcademicSessionResource(resources.ModelResource):
    department = fields.Field(
        attribute='department',
        column_name='department_code',
        widget=DepartmentForeignKeyWidget()
    )
    class Meta:
        model = AcademicSession
        fields = ('id', 'name', 'session_type', 'department_code', 'start_date', 'end_date', 'is_active')
        import_id_fields = ('name', 'session_type', 'department_code')
        skip_unchanged = True

class CourseResource(resources.ModelResource):
    department = fields.Field(
        attribute='department',
        column_name='department_code',
        widget=DepartmentForeignKeyWidget()
    )
    class Meta:
        model = Course
        fields = ('id', 'code', 'name', 'credit_hours', 'course_type', 'department_code')
        import_id_fields = ('code',)

class RoomResource(resources.ModelResource):
    department = fields.Field(
        attribute='department',
        column_name='department_code',
        widget=DepartmentForeignKeyWidget()
    )
    class Meta:
        model = Room
        fields = ('id', 'room_number', 'room_type', 'capacity', 'department_code')
        import_id_fields = ('room_number',)

class TimeSlotResource(resources.ModelResource):
    class Meta:
        model = TimeSlot
        fields = ('id', 'day', 'slot_name', 'start_time', 'end_time')

class ClassSectionResource(resources.ModelResource):
    department = fields.Field(
        attribute='department',
        column_name='department_code',
        widget=DepartmentForeignKeyWidget()
    )
    academic_session = fields.Field(
        attribute='academic_session',
        column_name='session_name',
        widget=AcademicSessionForeignKeyWidget()
    )
    class Meta:
        model = ClassSection
        fields = ('id', 'name', 'section_code', 'department_code', 'session_name', 'total_students', 'semester', 'year')
        # Unique constraint is on name and academic_session

# --- Teacher Resource (Handles User/Credentials Creation) ---
class TeacherResource(resources.ModelResource):
    department = fields.Field(
        attribute='department',
        column_name='department_code',
        widget=DepartmentForeignKeyWidget()
    )
    # Fields pulled from the User model
    email = fields.Field(column_name='email')
    first_name = fields.Field(column_name='first_name')
    last_name = fields.Field(column_name='last_name')
    username = fields.Field(column_name='username')
    
    class Meta:
        model = Teacher
        fields = ('id', 'employee_id', 'department_code', 'max_lectures_per_week', 'phone', 'email', 'first_name', 'last_name', 'username')
        import_id_fields = ('employee_id',)

    def before_save_instance(self, instance, using_transactions, dry_run):
        user_data = {
            'email': self.fields['email'].clean(instance.user.email),
            'username': self.fields['username'].clean(instance.user.username),
            'first_name': self.fields['first_name'].clean(instance.user.first_name),
            'last_name': self.fields['last_name'].clean(instance.user.last_name),
        }
        if not user_data['username']:
            user_data['username'] = user_data['email']
        
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'username': user_data['username'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'user_type': 'teacher',
                'is_active': True,
            }
        )
        if created:
             user.set_password(User.objects.make_random_password(length=12)) 
             user.save()

        instance.user = user
        if not dry_run: # Update user details if not dry run
            user_updated = False
            for key in ['username', 'first_name', 'last_name']:
                if getattr(user, key) != user_data[key]:
                    setattr(user, key, user_data[key])
                    user_updated = True
            if user.user_type != 'teacher':
                user.user_type = 'teacher'
                user_updated = True
            if user_updated:
                user.save()


# --- Student Resource (Inherits User creation logic) ---
class StudentResource(TeacherResource):
    department = fields.Field(
        attribute='department',
        column_name='department_code',
        widget=DepartmentForeignKeyWidget()
    )
    class_section = fields.Field(
        attribute='class_section',
        column_name='class_section_name',
        widget=widgets.ForeignKeyWidget(ClassSection, 'name')
    )
    
    class Meta:
        model = Student
        fields = ('id', 'roll_number', 'department_code', 'class_section_name', 'email', 'first_name', 'last_name', 'username', 'academic_session', 'admission_date')
        import_id_fields = ('roll_number',)

    def before_save_instance(self, instance, using_transactions, dry_run):
        # Use parent method for user creation/linking
        super().before_save_instance(instance, using_transactions, dry_run)
        
        # Ensure user type is set correctly
        if instance.user.user_type != 'student':
            instance.user.user_type = 'student'
            if not dry_run:
                instance.user.save()


# =========================================================
# 💻 ADMIN MODEL REGISTRATIONS (Using ImportExportModelAdmin)
# =========================================================

# --- Custom User Admin ---
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Fieldsets from your original admin + department field
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'username', 'department')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'user_type', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    list_display = ("id", "email", "username", "user_type", "get_department", "is_active")
    list_filter = ("user_type", "department", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ('email',)
    
    def get_department(self, obj):
        return obj.department.name if obj.department else "No Department"
    get_department.short_description = "Department"


# --- Core Data Models (Now with Import/Export) ---
@admin.register(Department)
class DepartmentAdmin(ImportExportModelAdmin):
    resource_class = DepartmentResource
    list_display = ("id", "code", "name")
    search_fields = ("code", "name")

@admin.register(AcademicSession)
class AcademicSessionAdmin(ImportExportModelAdmin):
    resource_class = AcademicSessionResource
    list_display = ("id", "name", "session_type", "department", "start_date", "end_date", "is_active")
    list_filter = ("session_type", "department", "is_active")
    search_fields = ("name", "department__name")
    date_hierarchy = "start_date"

@admin.register(Course)
class CourseAdmin(ImportExportModelAdmin):
    resource_class = CourseResource
    list_display = ("id", "code", "name", "credit_hours", "course_type", "department")
    list_filter = ("course_type", "department")
    search_fields = ("code", "name")

@admin.register(Room)
class RoomAdmin(ImportExportModelAdmin):
    resource_class = RoomResource
    list_display = ("id", "room_number", "room_type", "capacity", "department")
    list_filter = ("room_type", "department")
    search_fields = ("room_number",)

@admin.register(TimeSlot)
class TimeSlotAdmin(ImportExportModelAdmin):
    resource_class = TimeSlotResource
    list_display = ("id", "day", "slot_name", "start_time", "end_time")
    list_filter = ("day", "start_time", "end_time")
    search_fields = ("slot_name",)

@admin.register(ClassSection)
class ClassSectionAdmin(ImportExportModelAdmin):
    resource_class = ClassSectionResource
    list_display = ("id", "name", "section_code", "department", "academic_session", "semester", "year", "total_students")
    list_filter = ("department", "academic_session", "section_code", "semester", "year")
    search_fields = ("name", "department__name")
    list_select_related = ("department", "academic_session")

@admin.register(Program)
class ProgramAdmin(ImportExportModelAdmin):
    # No dedicated ProgramResource needed if DepartmentResource covers FK linkage
    list_display = ("id", "code", "name", "degree_type", "department", "duration_years", "total_credits")
    list_filter = ("degree_type", "department")
    search_fields = ("code", "name", "department__name")
    list_select_related = ("department",)


# --- Profile Models (Now with Import/Export) ---
@admin.register(Teacher)
class TeacherAdmin(ImportExportModelAdmin):
    resource_class = TeacherResource
    list_display = ("id", "get_full_name", "employee_id", "department", "phone", "max_lectures_per_week")
    list_filter = ("department",)
    search_fields = ("employee_id", "user__first_name", "user__last_name", "user__email")

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = "Name"

@admin.register(Student)
class StudentAdmin(ImportExportModelAdmin):
    resource_class = StudentResource
    list_display = ("id", "get_student_name", "roll_number", "class_section", "department", "academic_session", "admission_date")
    list_filter = ("department", "academic_session", "class_section")
    search_fields = ("roll_number", "user__first_name", "user__last_name", "user__email")
    
    def get_student_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_student_name.short_description = "Student Name"


# --- Scheduling/Assignment Models ---
@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "teacher", "room", "get_day", "time_slot", "academic_session", "class_section")
    list_filter = ("teacher", "room", "time_slot__day", "academic_session", "class_section")
    search_fields = ("course__name", "teacher__user__first_name", "teacher__user__last_name", "class_section__name")
    
    def get_day(self, obj):
        return obj.time_slot.day.title()
    get_day.short_description = "Day"
    # Pre-fetch related fields to reduce database queries on the list view
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'course', 'teacher__user', 'room', 'time_slot', 'academic_session', 'class_section'
        )

@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "get_teacher_name", "get_course_code", "get_section_name", "academic_session", "is_responsible_teacher", "assignment_date")
    list_filter = ("academic_session", "class_section__department", "is_responsible_teacher")
    search_fields = ("teacher__user__first_name", "teacher__user__last_name", "course__code", "course__name", "class_section__name")
    
    def get_teacher_name(self, obj):
        return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}"
    get_teacher_name.short_description = "Teacher"
    
    def get_course_code(self, obj):
        return obj.course.code
    get_course_code.short_description = "Course"
    
    def get_section_name(self, obj):
        return obj.class_section.name
    get_section_name.short_description = "Section"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'teacher__user', 'course', 'class_section', 'academic_session'
        )

@admin.register(CourseOffering)
class CourseOfferingAdmin(admin.ModelAdmin):
    list_display = ("id", "get_course_code", "get_course_name", "get_section_name", "academic_session", "get_teacher_name", "is_core")
    list_filter = ("academic_session", "class_section__department", "is_core")
    search_fields = ("course__code", "course__name", "class_section__name", "teacher__user__first_name")
    
    def get_course_code(self, obj):
        return obj.course.code
    get_course_code.short_description = "Course Code"
    
    def get_course_name(self, obj):
        return obj.course.name
    get_course_name.short_description = "Course Name"
    
    def get_section_name(self, obj):
        return obj.class_section.name
    get_section_name.short_description = "Section"
    
    def get_teacher_name(self, obj):
        if obj.teacher:
            return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}"
        return "Not Assigned"
    get_teacher_name.short_description = "Teacher"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'course', 'class_section', 'academic_session', 'teacher__user'
        )

@admin.register(ScheduleException)
class ScheduleExceptionAdmin(admin.ModelAdmin):
    list_display = ("id", "get_schedule_info", "exception_type", "exception_date", "get_substitute_teacher", "get_alternate_room")
    list_filter = ("exception_type", "exception_date", "schedule__academic_session")
    search_fields = ("schedule__course__code", "schedule__teacher__user__first_name", "reason")
    date_hierarchy = "exception_date"
    
    def get_schedule_info(self, obj):
        return f"{obj.schedule.course.code} - {obj.schedule.teacher.user.first_name}"
    get_schedule_info.short_description = "Original Schedule"
    
    def get_substitute_teacher(self, obj):
        if obj.substitute_teacher:
            return f"{obj.substitute_teacher.user.first_name} {obj.substitute_teacher.user.last_name}"
        return "No Substitute"
    get_substitute_teacher.short_description = "Substitute Teacher"
    
    def get_alternate_room(self, obj):
        if obj.alternate_room:
            return obj.alternate_room.room_number
        return "Same Room"
    get_alternate_room.short_description = "Alternate Room"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'schedule__course', 'schedule__teacher__user', 'substitute_teacher__user', 'alternate_room'
        )

@admin.register(GeneratedSchedule)
class GeneratedScheduleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "academic_session", "department", "generated_by", "generated_at", "is_active")
    list_filter = ("academic_session", "department", "is_active")
    search_fields = ("name", "department__name", "generated_by__email")
    readonly_fields = ("generated_at",)
    date_hierarchy = "generated_at"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'academic_session', 'department', 'generated_by'
        )