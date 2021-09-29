from rest_framework import viewsets
from .models import FAQ
from .serializers import FAQSerializer


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
