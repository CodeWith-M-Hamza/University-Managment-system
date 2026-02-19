from django.urls import path
from . import views

urlpatterns = [
    # =====================================================
    # 🔐 Authentication
    # =====================================================
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/csrf-token/', views.get_csrf_token, name='csrf-token'),
    path('api/auth/verify/', views.verify_token, name='verify_token'),

    # =====================================================
    # 👤 User Management
    # =====================================================
    path('users/', views.user_list, name='user-list'),
    path('users/profile/', views.user_profile, name='user-profile'),

    # =====================================================
    # 🏫 Departments
    # =====================================================
    path('departments/', views.department_list, name='departments-list'),
    path('departments/<int:pk>/', views.department_detail, name='departments-detail'),

    # =====================================================
    # 👨‍🏫 Teachers
    # =====================================================
    path('teachers/', views.teacher_list, name='teachers-list'),
    path('teachers/<int:pk>/', views.teacher_detail, name='teachers-detail'),

    # =====================================================
    # 📚 Courses
    # =====================================================
    path('courses/', views.course_list, name='courses-list'),
    path('courses/<int:pk>/', views.course_detail, name='courses-detail'),

    # =====================================================
    # 🏠 Rooms
    # =====================================================
    path('rooms/', views.room_list, name='rooms-list'),
    path('rooms/<int:pk>/', views.room_detail, name='rooms-detail'),

    # =====================================================
    # ⏰ Time Slots
    # =====================================================
    path('time-slots/', views.timeslot_list, name='timeslots-list'),
    path('time-slots/<int:pk>/', views.timeslot_detail, name='timeslots-detail'),

    # =====================================================
    # 📅 Schedules
    # =====================================================
    path('schedule/', views.schedule_list, name='schedule-list'),
    path('schedule/<int:pk>/', views.schedule_detail, name='schedule-detail'),

    # =====================================================
    # 🗓 Academic Sessions
    # =====================================================
    path('sessions/', views.academic_session_list, name='academic-session-list'),
    path('sessions/<int:pk>/', views.academic_session_detail, name='academic-session-detail'),

    # =====================================================
    # 🧑‍🏫 Class Sections
    # =====================================================
    path('class-sections/', views.class_section_list, name='class-section-list'),
    path('class-sections/<int:pk>/', views.class_section_detail, name='class-section-detail'),

    # =====================================================
    # 🧾 Teacher Assignments
    # =====================================================
    path('teacher-assignments/', views.teacher_assignment_list, name='teacher-assignment-list'),
    path('teacher-assignments/<int:pk>/', views.teacher_assignment_detail, name='teacher-assignment-detail'),

    # =====================================================
    # 🎓 Students
    # =====================================================
    path('students/', views.student_list, name='student-list'),
    path('students/<int:pk>/', views.student_detail, name='student-detail'),

    # =====================================================
    # 🎯 Programs (NEW)
    # =====================================================
    path('programs/', views.program_list, name='program-list'),
    path('programs/<int:pk>/', views.program_detail, name='program-detail'),

    # =====================================================
    # 📖 Course Offerings (NEW)
    # =====================================================
    path('course-offerings/', views.course_offering_list, name='course-offering-list'),
    path('course-offerings/<int:pk>/', views.course_offering_detail, name='course-offering-detail'),

    # =====================================================
    # ⚠️ Schedule Exceptions (NEW)
    # =====================================================
    path('schedule-exceptions/', views.schedule_exception_list, name='schedule-exception-list'),
    path('schedule-exceptions/<int:pk>/', views.schedule_exception_detail, name='schedule-exception-detail'),

    # =====================================================
    # 📊 Generated Schedules (NEW)
    # =====================================================
    path('generated-schedules/', views.generated_schedule_list, name='generated-schedule-list'),
    path('generated-schedules/<int:pk>/', views.generated_schedule_detail, name='generated-schedule-detail'),
    path('generated-schedules/<int:pk>/activate/', views.activate_generated_schedule, name='activate-generated-schedule'),

    # =====================================================
    # 🧠 Utility Endpoints
    # =====================================================
    path('teachers/<int:teacher_id>/assignments/', views.get_teacher_assignments, name='teacher-assignments'),
    path('class-sections/<int:section_id>/schedule/', views.get_section_schedule, name='section-schedule'),
    path('sessions/<int:session_id>/schedule/', views.get_session_schedule, name='session-schedule'),
    
    # =====================================================
    # 🔄 Enhanced Utility Endpoints (NEW)
    # =====================================================
    path('teachers/<int:teacher_id>/schedule/', views.get_teacher_schedule, name='teacher-schedule'),
    path('rooms/<int:room_id>/schedule/', views.get_room_schedule, name='room-schedule'),
    path('departments/<int:department_id>/schedule/', views.get_department_schedule, name='department-schedule'),
    path('active-schedule/', views.get_active_schedule, name='active-schedule'),
]