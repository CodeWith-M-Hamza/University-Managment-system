from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework import status, permissions
from .models import (
    Department, Teacher, Course, Room, TimeSlot, Schedule,
    AcademicSession, ClassSection, TeacherAssignment, Student, User,
    Program, CourseOffering, ScheduleException, GeneratedSchedule
)
from .serializers import (
    DepartmentSerializer, TeacherSerializer, CourseSerializer,
    RoomSerializer, TimeSlotSerializer, ScheduleSerializer,
    AcademicSessionSerializer, ClassSectionSerializer, 
    TeacherAssignmentSerializer, StudentSerializer, UserSerializer,
    TeacherCreateSerializer, ProgramSerializer, CourseOfferingSerializer,
    ScheduleExceptionSerializer, GeneratedScheduleSerializer,
    TeacherScheduleSerializer, SectionScheduleSerializer, RoomScheduleSerializer
)
from django.contrib.auth import get_user_model



# ------------------- Custom Permissions -------------------
class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'superadmin'


class IsChairperson(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in ['superadmin', 'chairperson']


# ------------------- Authentication -------------------
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        User = get_user_model()
        data = request.data
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('user_type', 'student')
        department_id = data.get('department')

        # Validation
        if not username or not email or not password:
            return Response(
                {'error': 'Username, email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'username': ['A user with that username already exists.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'email': ['A user with that email already exists.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type=user_type,
            department_id=department_id
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Prepare response
        response_data = {
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user_type
            },
            'access_token': access_token
        }

        # Create response
        response = Response(response_data, status=status.HTTP_201_CREATED)
        
        # Set cookies
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,  # Set to False in development
            samesite='Lax',
            max_age=60 * 60 * 24
        )
        
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=60 * 60 * 24 * 7
        )
        
        # Set CSRF token
        response.set_cookie(
            key='csrftoken',
            value=get_token(request),
            samesite='Lax'
        )

        return response

    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')
        print(f"the data of student is {data}")
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # ✅ CRITICAL: Include tokens in JSON response
            response_data = {
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': user.user_type
                },
                'access_token': access_token,  # ✅ This must be in the response
                'refresh_token': str(refresh)  # ✅ This must be in the response
            }

            # Create response
            response = Response(response_data, status=status.HTTP_200_OK)
            
            # You can keep the cookie setting if you want both methods
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=60 * 60 * 24
            )
            
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=60 * 60 * 24 * 7
            )
            
            # Set CSRF token
            response.set_cookie(
                key='csrftoken',
                value=get_token(request),
                samesite='Lax'
            )

            return response
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# ===============================verify token ===============================================
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """Verify if the JWT token in cookies is valid"""
    try:
        # The token is automatically validated by the IsAuthenticated permission
        user_data = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'user_type': request.user.user_type
        }
        return Response({
            'valid': True,
            'user': user_data
        })
    except Exception as e:
        return Response({'valid': False, 'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_user(request):
    response = Response({'message': 'Logout successful'})
    
    # Clear cookies
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    response.delete_cookie('csrftoken')
    
    return response

@ensure_csrf_cookie
@api_view(['GET'])
def get_csrf_token(request):
    response = Response({'message': 'CSRF token set'})
    response.set_cookie(
        key='csrftoken',
        value=get_token(request),
        samesite='Lax'
    )
    return response

# ------------------- User Management -------------------
@api_view(["GET", "PUT"])
def user_profile(request):
    if request.method == "GET":
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == "PUT":
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsSuperAdmin])
def user_list(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

# ------------------- Department -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def department_list(request):
    if request.method == "GET":
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def department_detail(request, pk):
    try:
        department = Department.objects.get(pk=pk)
    except Department.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = DepartmentSerializer(department)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = DepartmentSerializer(department, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        department.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Teacher -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def teacher_list(request):
    if request.method == "GET":
        teachers = Teacher.objects.all()
        serializer = TeacherSerializer(teachers, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        print("🟡 Received POST data:", request.data)
        
        if 'user' in request.data:
            user_data = request.data['user']
            flat_data = {
                'first_name': user_data.get('first_name'),
                'last_name': user_data.get('last_name'),
                'email': user_data.get('email'),
                'username': user_data.get('username'),
                'password': user_data.get('password', 'default123'),
                'employee_id': request.data.get('employee_id'),
                'department': request.data.get('department'),
                'max_lectures_per_week': request.data.get('max_lectures_per_week', 20),
                'phone': request.data.get('phone', '')
            }
            serializer = TeacherCreateSerializer(data=flat_data)
        else:
            serializer = TeacherSerializer(data=request.data)
        
        if serializer.is_valid():
            teacher = serializer.save()
            read_serializer = TeacherSerializer(teacher)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def teacher_detail(request, pk):
    try:
        teacher = Teacher.objects.get(pk=pk)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = TeacherSerializer(teacher)
        return Response(serializer.data)

    elif request.method == "PUT":
        try:
            print("🟡 Received PUT data:", request.data)
            
            user_data = request.data.get('user', {})
            teacher_data = request.data.copy()
            if 'user' in teacher_data:
                del teacher_data['user']
            
            serializer = TeacherSerializer(teacher, data=teacher_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                if user_data:
                    user = teacher.user
                    if 'first_name' in user_data:
                        user.first_name = user_data['first_name']
                    if 'last_name' in user_data:
                        user.last_name = user_data['last_name']
                    if 'email' in user_data:
                        user.email = user_data['email']
                    if 'username' in user_data:
                        user.username = user_data['username']
                    user.save()
                
                updated_serializer = TeacherSerializer(teacher)
                return Response(updated_serializer.data)
            else:
                print("❌ Teacher validation errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"❌ PUT Error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        teacher.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Course -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def course_list(request):
    if request.method == "GET":
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def course_detail(request, pk):
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = CourseSerializer(course)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = CourseSerializer(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Room -------------------

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def room_list(request):
    if request.method == "GET":
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        print("🎯 Received POST data:", request.data)  # DEBUG
        serializer = RoomSerializer(data=request.data)
        print("🎯 Serializer data:", serializer.initial_data)  # DEBUG
        
        if serializer.is_valid():
            print("✅ Serializer is valid")  # DEBUG
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Serializer errors:", serializer.errors)  # DEBUG
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def room_detail(request, pk):
    try:
        room = Room.objects.get(pk=pk)
    except Room.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = RoomSerializer(room)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = RoomSerializer(room, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- TimeSlot -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def timeslot_list(request):
    if request.method == "GET":
        slots = TimeSlot.objects.all()
        serializer = TimeSlotSerializer(slots, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = TimeSlotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def timeslot_detail(request, pk):
    try:
        slot = TimeSlot.objects.get(pk=pk)
    except TimeSlot.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = TimeSlotSerializer(slot)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = TimeSlotSerializer(slot, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        slot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Schedule -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def schedule_list(request):
    if request.method == "GET":
        department = request.query_params.get("department")
        academic_session = request.query_params.get("academic_session")
        class_section = request.query_params.get("class_section")
        teacher = request.query_params.get("teacher")
        room = request.query_params.get("room")
        
        queryset = Schedule.objects.all()
        
        if department:
            queryset = queryset.filter(department_id=department)
        if academic_session:
            queryset = queryset.filter(academic_session_id=academic_session)
        if class_section:
            queryset = queryset.filter(class_section_id=class_section)
        if teacher:
            queryset = queryset.filter(teacher_id=teacher)
        if room:
            queryset = queryset.filter(room_id=room)

        serializer = ScheduleSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ScheduleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def schedule_detail(request, pk):
    try:
        schedule = Schedule.objects.get(pk=pk)
    except Schedule.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ScheduleSerializer(schedule)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = ScheduleSerializer(schedule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Academic Session -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def academic_session_list(request):
    if request.method == "GET":
        sessions = AcademicSession.objects.all()
        serializer = AcademicSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = AcademicSessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def academic_session_detail(request, pk):
    try:
        session = AcademicSession.objects.get(pk=pk)
    except AcademicSession.DoesNotExist:
        return Response({"error": "Academic session not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = AcademicSessionSerializer(session)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = AcademicSessionSerializer(session, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Class Section -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def class_section_list(request):
    if request.method == "GET":
        sections = ClassSection.objects.all()
        serializer = ClassSectionSerializer(sections, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ClassSectionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def class_section_detail(request, pk):
    try:
        section = ClassSection.objects.get(pk=pk)
    except ClassSection.DoesNotExist:
        return Response({"error": "Class section not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ClassSectionSerializer(section)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = ClassSectionSerializer(section, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        section.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Teacher Assignment -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def teacher_assignment_list(request):
    if request.method == "GET":
        assignments = TeacherAssignment.objects.all()
        serializer = TeacherAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = TeacherAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def teacher_assignment_detail(request, pk):
    try:
        assignment = TeacherAssignment.objects.get(pk=pk)
    except TeacherAssignment.DoesNotExist:
        return Response({"error": "Teacher assignment not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = TeacherAssignmentSerializer(assignment)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = TeacherAssignmentSerializer(assignment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        assignment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Student -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def student_list(request):
    if request.method == "GET":
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = StudentSerializer(data=request.data)
        print(serializer)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def student_detail(request, pk):
    try:
        student = Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = StudentSerializer(student, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# =========================
# NEW VIEWS FOR ADDED MODELS
# =========================

# ------------------- Program -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def program_list(request):
    if request.method == "GET":
        programs = Program.objects.all()
        serializer = ProgramSerializer(programs, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ProgramSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def program_detail(request, pk):
    try:
        program = Program.objects.get(pk=pk)
    except Program.DoesNotExist:
        return Response({"error": "Program not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ProgramSerializer(program)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = ProgramSerializer(program, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        program.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Course Offering -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def course_offering_list(request):
    if request.method == "GET":
        offerings = CourseOffering.objects.all()
        serializer = CourseOfferingSerializer(offerings, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = CourseOfferingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def course_offering_detail(request, pk):
    try:
        offering = CourseOffering.objects.get(pk=pk)
    except CourseOffering.DoesNotExist:
        return Response({"error": "Course offering not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = CourseOfferingSerializer(offering)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = CourseOfferingSerializer(offering, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        offering.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Schedule Exception -------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def schedule_exception_list(request):
    if request.method == "GET":
        exceptions = ScheduleException.objects.all()
        serializer = ScheduleExceptionSerializer(exceptions, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ScheduleExceptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def schedule_exception_detail(request, pk):
    try:
        exception = ScheduleException.objects.get(pk=pk)
    except ScheduleException.DoesNotExist:
        return Response({"error": "Schedule exception not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ScheduleExceptionSerializer(exception)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = ScheduleExceptionSerializer(exception, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        exception.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def generated_schedule_list(request):
    if request.method == "GET":
        schedules = GeneratedSchedule.objects.all()
        serializer = GeneratedScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = GeneratedScheduleSerializer(data=request.data)
        if serializer.is_valid():
            # TEMPORARY FIX: Use the first available user
            # This avoids the AnonymousUser error
            try:
                user = User.objects.first()  # Get first user in database
                if user:
                    serializer.save(generated_by=user)
                else:
                    # If no users exist, create a default one
                    user = User.objects.create_user(
                        username='default_user',
                        email='default@example.com',
                        password='defaultpass123'
                    )
                    serializer.save(generated_by=user)
            except Exception as e:
                # Fallback: save without user
                serializer.save(generated_by=None)
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def generated_schedule_detail(request, pk):
    try:
        generated_schedule = GeneratedSchedule.objects.get(pk=pk)
    except GeneratedSchedule.DoesNotExist:
        return Response({"error": "Generated schedule not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = GeneratedScheduleSerializer(generated_schedule)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = GeneratedScheduleSerializer(generated_schedule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        generated_schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Utility Endpoints -------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def get_teacher_assignments(request, teacher_id):
    """Get all assignments for a specific teacher"""
    try:
        assignments = TeacherAssignment.objects.filter(teacher_id=teacher_id)
        serializer = TeacherAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_section_schedule(request, section_id):
    """Get complete schedule for a specific class section"""
    try:
        schedules = Schedule.objects.filter(class_section_id=section_id)
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_session_schedule(request, session_id):
    """Get all schedules for a specific academic session"""
    try:
        schedules = Schedule.objects.filter(academic_session_id=session_id)
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_teacher_schedule(request, teacher_id):
    """Get complete schedule for a specific teacher"""
    try:
        schedules = Schedule.objects.filter(teacher_id=teacher_id)
        serializer = TeacherScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_room_schedule(request, room_id):
    """Get complete schedule for a specific room"""
    try:
        schedules = Schedule.objects.filter(room_id=room_id)
        serializer = RoomScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_department_schedule(request, department_id):
    """Get all schedules for a specific department"""
    try:
        schedules = Schedule.objects.filter(department_id=department_id)
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def activate_generated_schedule(request, pk):
    """Activate a specific generated schedule"""
    try:
        generated_schedule = GeneratedSchedule.objects.get(pk=pk)
        generated_schedule.activate()
        return Response({'message': 'Schedule activated successfully'})
    except GeneratedSchedule.DoesNotExist:
        return Response({"error": "Generated schedule not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_schedule(request):
    """Get currently active schedule for a department"""
    try:
        department_id = request.query_params.get('department')
        if not department_id:
            return Response({'error': 'Department ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        active_schedule = GeneratedSchedule.objects.filter(
            department_id=department_id, 
            is_active=True
        ).first()
        
        if active_schedule:
            serializer = GeneratedScheduleSerializer(active_schedule)
            return Response(serializer.data)
        else:
            return Response({'message': 'No active schedule found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)