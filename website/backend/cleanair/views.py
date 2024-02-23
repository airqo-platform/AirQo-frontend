from django.utils import translation
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import CleanAirResource
from .serializers import CleanAirResourceSerializer


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
