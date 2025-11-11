from rest_framework import viewsets
from .models import Email
from .serializers import EmailSerializer

class EmailViewSet(viewsets.ModelViewSet):
    queryset = Email.objects.all()
    serializer_class = EmailSerializer