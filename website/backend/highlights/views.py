from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Highlight, Tag
from .serializers import HighlightSerializer, TagSerializer

class HighlightViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Highlight.objects.all()
    serializer_class = HighlightSerializer

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Tag.objects.all()
    serializer_class = TagSerializer