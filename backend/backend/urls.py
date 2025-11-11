from django.contrib import admin
from django.urls import path
from django.urls import include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tickets/', include('tickets.urls')),
    path('api/emails/', include('emails.urls')),
]
