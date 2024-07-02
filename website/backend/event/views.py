from django.db.models import Prefetch
from django.utils import translation
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Event, Inquiry, Program, Session, PartnerLogo, Resource
from .serializers import EventSerializer


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.prefetch_related(
        Prefetch('inquiry'),
        Prefetch('program'),
        Prefetch('partner'),
        Prefetch('resource'),
    )
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        language = request.session.get('django_language')
        if language is None:
            language = request.COOKIES.get('django_language')
        if language is not None:
            translation.activate(language)
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
