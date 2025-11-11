from django.db import models
from django.conf import settings

# Create your models here.
class Email(models.Model):
    subject = models.CharField(max_length=255)
    body = models.TextField()
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_emails')
    recipient = models.EmailField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} - From: {self.sender} To: {self.recipient}"