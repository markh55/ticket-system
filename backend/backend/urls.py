from django.contrib import admin
from django.urls import path
from django.urls import include
from emails.views import mailgun_webhook

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tickets/', include('tickets.urls')),
    path('api/emails/', include('emails.urls')),
    path('webhook/', mailgun_webhook, name='mailgun-webhook'),
]
