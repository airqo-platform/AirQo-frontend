from django.utils import translation
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import CleanAirResource, ForumEvent
from .serializers import CleanAirResourceSerializer, ForumEventSerializer


class CleanAirResourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CleanAirResource.objects.all()
    serializer_class = CleanAirResourceSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        language = request.session.get('django_language')
        if language is None:
            language = request.COOKIES.get('django_language')
        if language is not None:
            translation.activate(language)
        return super().list(request, *args, **kwargs)


class ForumEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ForumEvent.objects.all()
    serializer_class = ForumEventSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        language = request.session.get('django_language')
        if language is None:
            language = request.COOKIES.get('django_language')
        if language is not None:
            translation.activate(language)
        return super().list(request, *args, **kwargs)
