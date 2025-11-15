from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Ticket, Reply
from .serializers import TicketSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Ticket.objects.count()
        in_progress = Ticket.objects.filter(status='open').count()
        completed = Ticket.objects.filter(status='closed').count()
        
        return Response({
            'total': total,
            'in_progress': in_progress,
            'completed': completed
        })
    
    @action(detail=False, methods=['get'])
    def chart_data(self, request):
        # Get ticket counts by status for the last 7 days
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
                'date': date.strftime('%a'),  # Mon, Tue, etc.
                'open': open_count,
                'closed': closed_count
            })
        
        return Response(days_data)
    
    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        # Get last 5 tickets
        recent_tickets = Ticket.objects.order_by('-created_at')[:5]
        
        # Get last 5 replies
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
        
        # Sort by created_at and return top 10
        activity.sort(key=lambda x: x['created_at'], reverse=True)
        
        return Response(activity[:10])