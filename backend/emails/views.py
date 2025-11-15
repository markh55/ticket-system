from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Email
from .serializers import EmailSerializer
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from tickets.models import Ticket
from users.models import User
import json
import hmac
import hashlib
from django.conf import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

class EmailViewSet(viewsets.ModelViewSet):
    queryset = Email.objects.all()
    serializer_class = EmailSerializer
    permission_classes = [IsAuthenticated]


@csrf_exempt
@require_http_methods(["POST"])
def mailgun_webhook(request):
    # Log everything we receive
    logger.info("=" * 50)
    logger.info("MAILGUN WEBHOOK RECEIVED")
    logger.info(f"Method: {request.method}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"POST data: {dict(request.POST)}")
    logger.info(f"Body: {request.body}")
    logger.info("=" * 50)
    
    try:
        # Verify the request is from Mailgun
        token = request.POST.get('token', '')
        timestamp = request.POST.get('timestamp', '')
        signature = request.POST.get('signature', '')
        
        logger.info(f"Token: {token}")
        logger.info(f"Timestamp: {timestamp}")
        logger.info(f"Signature: {signature}")
        logger.info(f"Signing key from settings: {settings.MAILGUN_WEBHOOK_SIGNING_KEY}")
        
        # Verify signature
        signing_key = settings.MAILGUN_WEBHOOK_SIGNING_KEY.encode()
        hmac_digest = hmac.new(
            key=signing_key,
            msg=f'{timestamp}{token}'.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        logger.info(f"Computed HMAC: {hmac_digest}")
        logger.info(f"Received signature: {signature}")
        
        if not hmac.compare_digest(str(signature), str(hmac_digest)):
            logger.error("SIGNATURE VERIFICATION FAILED!")
            return JsonResponse({'error': 'Invalid signature'}, status=403)
        
        logger.info("Signature verified successfully")
        
        # Extract email data
        sender = request.POST.get('sender', '')
        subject = request.POST.get('subject', 'No Subject')
        body_plain = request.POST.get('body-plain', '')
        body_html = request.POST.get('body-html', '')
        
        logger.info(f"Sender: {sender}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body plain length: {len(body_plain)}")
        
        # Use plain text body, fallback to HTML if plain text is empty
        description = body_plain if body_plain else body_html
        
        # Get or create user based on email
        user, created = User.objects.get_or_create(
            email=sender,
            defaults={
                'username': sender.split('@')[0],
                'first_name': sender.split('@')[0],
            }
        )
        
        logger.info(f"User: {user.email} (created: {created})")
        
        # Create ticket with correct field names
        ticket = Ticket.objects.create(
            title=subject,
            description=description,
            status='open',
            priority='medium',
            created_by=user,
        )
        
        logger.info(f"Ticket created successfully: ID={ticket.id}")
        
        return JsonResponse({
            'status': 'success',
            'ticket_id': ticket.id,
            'message': 'Ticket created successfully'
        }, status=201)
        
    except Exception as e:
        logger.error(f"ERROR in webhook: {str(e)}", exc_info=True)
        return JsonResponse({
            'error': str(e)
        }, status=500)