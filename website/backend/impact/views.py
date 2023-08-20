from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import ImpactNumber
from .serializers import ImpactSerializer

class ImpactViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = ImpactNumber.objects.all()
    serializer_class = ImpactSerializer
