from rest_framework import viewsets
from .models import ImpactNumber
from .serializers import ImpactSerializer


class ImpactViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImpactNumber.objects.all()
    serializer_class = ImpactSerializer
