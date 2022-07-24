from rest_framework import viewsets
from .models import Career
from .serializers import CareerSerializer


class CareerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer
