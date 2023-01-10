from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Publication
from .serializers import PublicationSerializer

# Create your views here.
class PublicationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
