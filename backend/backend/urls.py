from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from users.views import LoginView, current_user
from users.views import get_csrf_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf/', get_csrf_token, name='csrf'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/user/', current_user, name='current_user'),  # to show user info in frontend sidebar
    path('api/tickets/', include('tickets.urls')),
    path('api/emails/', include('emails.urls')),

    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]