from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Ticket, Reply
from .serializers import TicketSerializer, ReplySerializer
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Ticket.objects.count()
        in_progress = Ticket.objects.filter(status='open').count()
        completed = Ticket.objects.filter(status='closed').count()
        unassigned = Ticket.objects.filter(assigned_to__isnull=True).count()
        high_priority = Ticket.objects.filter(priority='high').count()
        
        return Response({
            'total': total,
            'in_progress': in_progress,
            'completed': completed,
            'unassigned': unassigned,
            'high_priority': high_priority
        })
    
    @action(detail=False, methods=['get'])
    def chart_data(self, request):
        today = timezone.now().date()
        days_data = []
        
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            open_count = Ticket.objects.filter(
                created_at__date=date,
                status='open'
            ).count()
            closed_count = Ticket.objects.filter(
                created_at__date=date,
                status='closed'
            ).count()
            
            days_data.append({
                'date': date.strftime('%a'),
                'open': open_count,
                'closed': closed_count
            })
        
        return Response(days_data)
    
    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        recent_tickets = Ticket.objects.order_by('-created_at')[:5]
        recent_replies = Reply.objects.select_related('ticket').order_by('-created_at')[:5]
        
        activity = []
        
        for ticket in recent_tickets:
            activity.append({
                'type': 'ticket',
                'id': ticket.id,
                'subject': ticket.subject,
                'sender': ticket.sender,
                'status': ticket.status,
                'priority': ticket.priority,
                'created_at': ticket.created_at
            })
        
        for reply in recent_replies:
            activity.append({
                'type': 'reply',
                'id': reply.id,
                'ticket_subject': reply.ticket.subject,
                'sender': reply.sender,
                'is_staff_reply': reply.is_staff_reply,
                'created_at': reply.created_at
            })
        
        activity.sort(key=lambda x: x['created_at'], reverse=True)
        
        return Response(activity[:10])

class ReplyViewSet(viewsets.ModelViewSet):
    serializer_class = ReplySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_pk')
        return Reply.objects.filter(ticket_id=ticket_id, parent_reply__isnull=True)
    
    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_pk')
        user = self.request.user
        sender_email = user.email if user.email else f"{user.username}@example.com"
        
        serializer.save(
            ticket_id=ticket_id,
            created_by=user,
            sender=sender_email
        )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if instance.created_by != request.user:
            return Response(
                {'error': 'You can only delete notes you created.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, ticket_pk=None, pk=None):
        parent_reply = self.get_object()
        
        if not parent_reply.is_internal:
            return Response(
                {'error': 'Can only comment on internal notes.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        sender_email = user.email if user.email else f"{user.username}@example.com"
        body = request.data.get('body', '')
        
        if not body:
            return Response(
                {'error': 'Comment body is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment = Reply.objects.create(
            ticket_id=ticket_pk,
            parent_reply=parent_reply,
            body=body,
            is_staff_reply=True,
            is_internal=True,
            created_by=user,
            sender=sender_email
        )
        
        serializer = self.get_serializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    users = User.objects.all()
    user_data = [{'id': user.id, 'username': user.username, 'email': user.email} for user in users]
    return Response(user_data)