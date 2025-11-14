from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Email
from .serializers import EmailSerializer
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from tickets.models import Ticket
import json
import hmac
import hashlib

class EmailViewSet(viewsets.ModelViewSet):
    queryset = Email.objects.all()
    serializer_class = EmailSerializer
    permission_classes = [IsAuthenticated]


@csrf_exempt
def mailgun_webhook(request):
    if request.method == 'POST':
        # Verify the request is from Mailgun
        token = request.POST.get('token', '')
        timestamp = request.POST.get('timestamp', '')
        signature = request.POST.get('signature', '')
        
        # Get your Mailgun webhook signing key from settings
        from django.conf import settings
        signing_key = getattr(settings, 'MAILGUN_WEBHOOK_SIGNING_KEY', '')
        
        # Verify signature
        hmac_digest = hmac.new(
            key=signing_key.encode(),
            msg=f'{timestamp}{token}'.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(str(signature), str(hmac_digest)):
            return JsonResponse({'status': 'invalid signature'}, status=403)
        
        # Process the email
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