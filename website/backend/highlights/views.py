from rest_framework import viewsets
from .models import Highlight
from .serializers import HighlightSerializer

# Create your views here.
class HighlightViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Highlight.objects.all()
    serializer_class = HighlightSerializer