from django.contrib import admin
from .models import (
    User, Department, Teacher, Course, Room,
    TimeSlot, Schedule, AcademicSession, ClassSection,
    TeacherAssignment, Student, Program, CourseOffering,
    ScheduleException, GeneratedSchedule
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "user_type", "get_department", "is_active")
    list_filter = ("user_type", "department", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")
    
    def get_department(self, obj):
        return obj.department.name if obj.department else "No Department"
    get_department.short_description = "Department"


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name")
    search_fields = ("code", "name")


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("id", "get_full_name", "employee_id", "department", "phone", "max_lectures_per_week")
    list_filter = ("department",)
    search_fields = ("employee_id", "user__first_name", "user__last_name", "user__email")

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = "Name"


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "credit_hours", "course_type", "department")
    list_filter = ("course_type", "department")
    search_fields = ("code", "name")


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("id", "room_number", "room_type", "capacity", "department")
    list_filter = ("room_type", "department")
    search_fields = ("room_number",)


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ("id", "day", "slot_name", "start_time", "end_time")
    list_filter = ("day", "start_time", "end_time")
    search_fields = ("slot_name",)


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "teacher", "room", "get_day", "time_slot", "academic_session", "class_section")
    list_filter = ("teacher", "room", "time_slot__day", "academic_session", "class_section")
    search_fields = ("course__name", "teacher__user__first_name", "teacher__user__last_name", "class_section__name")
    
    def get_day(self, obj):
        return obj.time_slot.day.title()
    get_day.short_description = "Day"


@admin.register(AcademicSession)
class AcademicSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "session_type", "department", "start_date", "end_date", "is_active")
    list_filter = ("session_type", "department", "is_active")
    search_fields = ("name", "department__name")
    date_hierarchy = "start_date"


@admin.register(ClassSection)
class ClassSectionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "section_code", "department", "academic_session", "semester", "year", "total_students")
    list_filter = ("department", "academic_session", "section_code", "semester", "year")
    search_fields = ("name", "department__name")
    list_select_related = ("department", "academic_session")


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


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "get_student_name", "roll_number", "class_section", "department", "academic_session", "admission_date")
    list_filter = ("department", "academic_session", "class_section")
    search_fields = ("roll_number", "user__first_name", "user__last_name", "user__email")
    
    def get_student_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_student_name.short_description = "Student Name"


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "degree_type", "department", "duration_years", "total_credits")
    list_filter = ("degree_type", "department")
    search_fields = ("code", "name", "department__name")
    list_select_related = ("department",)


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
