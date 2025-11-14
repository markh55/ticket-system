from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from emails.views import mailgun_webhook
from users.views import LoginView
from users.views import get_csrf_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf/', get_csrf_token, name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('tickets/', include('tickets.urls')),
    path('emails/', include('emails.urls')),
    path('webhook/', mailgun_webhook, name='mailgun-webhook'),
    
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),

]