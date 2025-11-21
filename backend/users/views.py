from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

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