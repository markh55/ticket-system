from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, ReplyViewSet

router = DefaultRouter()
router.register(r'', TicketViewSet, basename='ticket')

# Map ReplyViewSet actions explicitly to nested URL patterns instead of using rest_framework_nested
replies_list = ReplyViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
replies_detail = ReplyViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

urlpatterns = [
    path('', include(router.urls)),
    path('<int:ticket_pk>/replies/', replies_list, name='ticket-replies-list'),
    path('<int:ticket_pk>/replies/<int:pk>/', replies_detail, name='ticket-replies-detail'),
]