from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from users.views import (
    LoginView, current_user, users_list, change_password, update_user_profile,
    get_csrf_token, upload_profile_picture, delete_profile_picture,
    save_signature, save_notifications, save_working_hours,
    admin_users_list, admin_create_user, admin_update_user, admin_delete_user,
    admin_roles_list, admin_create_role, admin_update_role, admin_delete_role,
    admin_export_data
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

    # Admin endpoints
    path('api/admin/users/', admin_users_list, name='admin_users_list'),
    path('api/admin/users/create/', admin_create_user, name='admin_create_user'),
    path('api/admin/users/<int:user_id>/update/', admin_update_user, name='admin_update_user'),
    path('api/admin/users/<int:user_id>/delete/', admin_delete_user, name='admin_delete_user'),
    path('api/admin/roles/', admin_roles_list, name='admin_roles_list'),
    path('api/admin/roles/create/', admin_create_role, name='admin_create_role'),
    path('api/admin/roles/<int:role_id>/update/', admin_update_role, name='admin_update_role'),
    path('api/admin/roles/<int:role_id>/delete/', admin_delete_role, name='admin_delete_role'),
    path('api/admin/export/<str:data_type>/', admin_export_data, name='admin_export_data'),

    path('api/tickets/', include('tickets.urls')),
    path('api/emails/', include('emails.urls')),

    # Catch-all: serve React app for any other route
    re_path(r'^.*', TemplateView.as_view(template_name='index.html')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)