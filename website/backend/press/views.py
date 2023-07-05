from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Press
from .serializers import PressSerializer

class PressViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Press.objects.all()
    serializer_class = PressSerializer
