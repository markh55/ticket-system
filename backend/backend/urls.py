from django.contrib import admin
from django.urls import path
from django.urls import include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('emails/', include('emails.urls')),
    path('tickets/', include('tickets.urls')),
]
