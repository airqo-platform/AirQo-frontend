from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import CleanAirResource
from .serializers import CleanAirResourceSerializer

class CleanAirResourceViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = CleanAirResource.objects.all()
    serializer_class = CleanAirResourceSerializer
