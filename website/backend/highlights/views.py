from rest_framework import viewsets
from .models import Highlight, Tag
from .serializers import HighlightSerializer, TagSerializer

class HighlightViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Highlight.objects.all()
    serializer_class = HighlightSerializer

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer