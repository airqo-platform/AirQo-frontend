from django.utils import translation
from rest_framework import viewsets
from .models import FAQ
from .serializers import FAQSerializer


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = []

    def list(self, request, *args, **kwargs):
        language = request.session.get('django_language')
        if language is None:
            language = request.COOKIES.get('django_language')
        if language is not None:
            translation.activate(language)
        return super().list(request, *args, **kwargs)
