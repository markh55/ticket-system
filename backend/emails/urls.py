from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmailViewSet
from .views import mailgun_webhook

router = DefaultRouter()
router.register(r'emails', EmailViewSet, basename='email')  # Changed from r'' to r'emails'

urlpatterns = [
    path('mailgun-webhook/', mailgun_webhook, name='mailgun-webhook'),  # Put webhook FIRST
    path('', include(router.urls)),  # Router comes second
]