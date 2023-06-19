from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import AfricanCountry
from .serializers import AfricanCitySerializer

# Create your views here.

class AfricanCityViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = AfricanCountry.objects.all()
    serializer_class = AfricanCitySerializer