from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from users.views import (
    LoginView, current_user, users_list, change_password, update_user_profile,
    get_csrf_token, upload_profile_picture, delete_profile_picture,
    save_signature, save_notifications, save_working_hours
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf/', get_csrf_token, name='csrf'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/user/', current_user, name='current_user'), 
    path('api/users/', users_list, name='users_list'),
    path('api/change-password/', change_password, name='change_password'),
    path('api/user/update/', update_user_profile, name='update_profile'),
    
    # New profile endpoints
    path('api/user/profile-picture/', upload_profile_picture, name='upload_profile_picture'),
    path('api/user/profile-picture/delete/', delete_profile_picture, name='delete_profile_picture'),
    path('api/user/signature/', save_signature, name='save_signature'),
    path('api/user/notifications/', save_notifications, name='save_notifications'),
    path('api/user/working-hours/', save_working_hours, name='save_working_hours'),
    
    path('api/tickets/', include('tickets.urls')),
    path('api/emails/', include('emails.urls')),

    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)