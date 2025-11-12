from rest_framework import viewsets
from .models import Email
from .serializers import EmailSerializer
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from tickets.models import Ticket
import json

class EmailViewSet(viewsets.ModelViewSet):
    queryset = Email.objects.all()
    serializer_class = EmailSerializer


@csrf_exempt
def mailgun_webhook(request):
    if request.method == 'POST':
        sender = request.POST.get('sender')
        subject = request.POST.get('subject', 'No Subject')
        body = request.POST.get('body-plain', '')
        
        # Create ticket from email
        Ticket.objects.create(
            subject=subject,
            body=body,
            sender=sender,
            status='open',
            priority='medium'
        )
        
        return JsonResponse({'status': 'success'})
    
    return JsonResponse({'status': 'failed'}, status=400)