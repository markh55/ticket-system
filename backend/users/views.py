from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group, Permission
import csv

User = get_user_model()

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    profile_picture_url = None
    if hasattr(user, 'profile_picture') and user.profile_picture:
        profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_superuser': user.is_superuser,
        'is_staff': user.is_staff,
        'profile_picture': profile_picture_url,
        'signature': getattr(user, 'signature', ''),
        'email_notifications': getattr(user, 'email_notifications', {}),
        'in_app_notifications': getattr(user, 'in_app_notifications', {}),
        'working_hours': getattr(user, 'working_hours', {}),
    })

@require_http_methods(["GET"])
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    users = User.objects.all()
    user_data = [{'id': user.id, 'username': user.username, 'email': user.email} for user in users]
    return Response(user_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({'old_password': 'Wrong password'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    user = request.user
    
    user.email = request.data.get('email', user.email)
    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    
    user.save()
    
    profile_picture_url = None
    if hasattr(user, 'profile_picture') and user.profile_picture:
        profile_picture_url = request.build_absolute_uri(user.profile_picture.url)
    
    return Response({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_superuser': user.is_superuser,
        'profile_picture': profile_picture_url,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    user = request.user
    
    if 'profile_picture' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    profile_picture = request.FILES['profile_picture']
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if profile_picture.content_type not in allowed_types:
        return Response({'error': 'Invalid file type. Use JPEG, PNG, GIF, or WebP'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file size (e.g., max 5MB)
    max_size = 5 * 1024 * 1024
    if profile_picture.size > max_size:
        return Response({'error': 'File too large. Maximum size is 5MB'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.profile_picture = profile_picture
    user.save()
    
    return Response({
        'message': 'Profile picture updated successfully',
        'profile_picture': request.build_absolute_uri(user.profile_picture.url)
    }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_picture(request):
    user = request.user
    
    if user.profile_picture:
        user.profile_picture.delete(save=True)
    
    return Response({'message': 'Profile picture deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_signature(request):
    user = request.user
    signature = request.data.get('signature', '')
    
    user.signature = signature
    user.save()
    
    return Response({
        'message': 'Signature saved successfully',
        'signature': user.signature
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_notifications(request):
    user = request.user
    
    email_notifications = request.data.get('email_notifications', {})
    in_app_notifications = request.data.get('in_app_notifications', {})
    
    user.email_notifications = email_notifications
    user.in_app_notifications = in_app_notifications
    user.save()
    
    return Response({
        'message': 'Notification preferences saved successfully',
        'email_notifications': user.email_notifications,
        'in_app_notifications': user.in_app_notifications
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_working_hours(request):
    user = request.user
    working_hours = request.data.get('working_hours', {})
    
    user.working_hours = working_hours
    user.save()
    
    return Response({
        'message': 'Working hours saved successfully',
        'working_hours': user.working_hours
    }, status=status.HTTP_200_OK)

# Admin - Get all users
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.all()
    user_data = [{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active,
        'role': user.groups.first().id if user.groups.exists() else None
    } for user in users]
    return Response(user_data)

# Admin - Create user
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_user(request):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    role_id = request.data.get('role')
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    
    if role_id:
        try:
            group = Group.objects.get(id=role_id)
            user.groups.add(group)
        except Group.DoesNotExist:
            pass
    
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

# Admin - Update user
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    user.username = request.data.get('username', user.username)
    user.email = request.data.get('email', user.email)
    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    user.is_active = request.data.get('is_active', user.is_active)
    
    role_id = request.data.get('role')
    if role_id:
        user.groups.clear()
        try:
            group = Group.objects.get(id=role_id)
            user.groups.add(group)
        except Group.DoesNotExist:
            pass
    
    user.save()
    return Response({'message': 'User updated successfully'}, status=status.HTTP_200_OK)

# Admin - Delete user
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# Admin - Get all roles
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_roles_list(request):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    groups = Group.objects.all()
    roles_data = [{
        'id': group.id,
        'name': group.name,
        'permissions': {perm.codename: True for perm in group.permissions.all()}
    } for group in groups]
    return Response(roles_data)

# Admin - Create role
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_role(request):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    name = request.data.get('name')
    permissions = request.data.get('permissions', {})
    
    if Group.objects.filter(name=name).exists():
        return Response({'error': 'Role already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    group = Group.objects.create(name=name)
    
    for perm_codename, enabled in permissions.items():
        if enabled:
            try:
                permission = Permission.objects.get(codename=perm_codename)
                group.permissions.add(permission)
            except Permission.DoesNotExist:
                pass
    
    return Response({'message': 'Role created successfully'}, status=status.HTTP_201_CREATED)

# Admin - Update role
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_role(request, role_id):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        group = Group.objects.get(id=role_id)
    except Group.DoesNotExist:
        return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)
    
    group.name = request.data.get('name', group.name)
    permissions = request.data.get('permissions', {})
    
    group.permissions.clear()
    for perm_codename, enabled in permissions.items():
        if enabled:
            try:
                permission = Permission.objects.get(codename=perm_codename)
                group.permissions.add(permission)
            except Permission.DoesNotExist:
                pass
    
    group.save()
    return Response({'message': 'Role updated successfully'}, status=status.HTTP_200_OK)

# Admin - Delete role
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_role(request, role_id):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        group = Group.objects.get(id=role_id)
        group.delete()
        return Response({'message': 'Role deleted successfully'}, status=status.HTTP_200_OK)
    except Group.DoesNotExist:
        return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)

# Admin - Export data
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_export_data(request, data_type):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{data_type}_export.csv"'
    
    writer = csv.writer(response)
    
    if data_type == 'users':
        writer.writerow(['ID', 'Username', 'Email', 'First Name', 'Last Name', 'Active'])
        users = User.objects.all()
        for user in users:
            writer.writerow([user.id, user.username, user.email, user.first_name, user.last_name, user.is_active])
    
    elif data_type == 'tickets':
        from tickets.models import Ticket
        
        # Get filter parameters from request body
        date_from = request.data.get('date_from')
        date_to = request.data.get('date_to')
        status_filter = request.data.get('status')
        priority_filter = request.data.get('priority')
        assigned_to_filter = request.data.get('assigned_to')
        
        # Apply filters
        tickets = Ticket.objects.all()
        
        if date_from:
            tickets = tickets.filter(created_at__gte=date_from)
        if date_to:
            tickets = tickets.filter(created_at__lte=date_to)
        if status_filter:
            tickets = tickets.filter(status=status_filter)
        if priority_filter:
            tickets = tickets.filter(priority=priority_filter)
        if assigned_to_filter:
            tickets = tickets.filter(assigned_to_id=assigned_to_filter)
        
        writer.writerow(['ID', 'Subject', 'Sender', 'Status', 'Priority', 'Assigned To', 'Created At', 'Updated At'])
        for ticket in tickets:
            assigned_name = ticket.assigned_to.username if ticket.assigned_to else 'Unassigned'
            writer.writerow([
                ticket.id,
                ticket.subject,
                ticket.sender,
                ticket.status,
                ticket.priority,
                assigned_name,
                ticket.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                ticket.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
    
    return response