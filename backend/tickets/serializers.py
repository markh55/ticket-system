from rest_framework import serializers
from .models import Ticket, Reply
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketSerializer(serializers.ModelSerializer):
    assigned_to = serializers.SerializerMethodField()
    
    class Meta:
        model = Ticket
        fields = '__all__'
    
    def get_assigned_to(self, obj):
        if obj.assigned_to:
            return {
                'id': obj.assigned_to.id,
                'username': obj.assigned_to.username,
                'email': obj.assigned_to.email
            }
        return None

class ReplySerializer(serializers.ModelSerializer):
    created_by_info = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Reply
        fields = '__all__'
        read_only_fields = ('created_by', 'sender', 'ticket')
    
    def get_created_by_info(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'email': obj.created_by.email
            }
        return None
    
    def get_comments(self, obj):
        if obj.is_internal and obj.comments.exists():
            comments = obj.comments.all()
            return ReplySerializer(comments, many=True).data
        return []