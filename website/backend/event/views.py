from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Event
from .serializers import EventSerializer

# Create your views here.

class EventViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Event.objects.all()
    serializer_class = EventSerializer

