from django.utils import translation
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Highlight, Tag
from .serializers import HighlightSerializer, TagSerializer


class BaseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)

    def list(self, request, *args, **kwargs):
        language = request.session.get('django_language')
        if language is None:
            language = request.COOKIES.get('django_language')
        if language is not None:
            translation.activate(language)
        return super().list(request, *args, **kwargs)


class HighlightViewSet(BaseViewSet):
    queryset = Highlight.objects.all()
    serializer_class = HighlightSerializer


class TagViewSet(BaseViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
