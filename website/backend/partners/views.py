from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Partner
from .serializers import PartnerSerializer

# Create your views here.
class PartnerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
