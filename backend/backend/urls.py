from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from users.views import LoginView
from users.views import get_csrf_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf/', get_csrf_token, name='csrf'),
    path('api/login/', LoginView.as_view(), name='login'),  # Move to /api/login/
    path('api/tickets/', include('tickets.urls')),  # Move to /api/tickets/
    path('api/emails/', include('emails.urls')),  # Move to /api/emails/
    
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),  # React catches everything else
]