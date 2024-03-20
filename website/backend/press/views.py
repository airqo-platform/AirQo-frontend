from django.utils import translation
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Press
from .serializers import PressSerializer


class PressViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Press.objects.all()
    serializer_class = PressSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        language = request.session.get('django_language')
        if language is None:
            language = request.COOKIES.get('django_language')
        if language is not None:
            translation.activate(language)
        return super().list(request, *args, **kwargs)
