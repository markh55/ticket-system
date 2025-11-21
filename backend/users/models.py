from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    signature = models.TextField(blank=True, default='')
    email_notifications = models.JSONField(default=dict, blank=True)
    in_app_notifications = models.JSONField(default=dict, blank=True)
    working_hours = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.username