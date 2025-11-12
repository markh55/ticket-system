from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmailViewSet
from .views import mailgun_webhook

router = DefaultRouter()
router.register(r'', EmailViewSet, basename='email')

urlpatterns = [
    path('', include(router.urls)),
    path('mailgun-webhook/', mailgun_webhook, name='mailgun-webhook'),
]