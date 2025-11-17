from rest_framework import serializers
from .models import Ticket, Reply
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class TicketSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    
    class Meta:
        model = Ticket
        fields = ['id', 'subject', 'body', 'sender', 'status', 'priority', 'assigned_to', 'created_at', 'updated_at']

class ReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Reply
        fields = ['id', 'ticket', 'sender', 'body', 'is_staff_reply', 'created_at']