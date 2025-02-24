from django.utils import translation
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Partner
from .serializers import PartnerSerializer

# Create your views here.


class PartnerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer

    def list(self, request, *args, **kwargs):
        language = request.session.get('django_language')
        if language is None:
            language = request.COOKIES.get('django_language')
        if language is not None:
            translation.activate(language)
        return super().list(request, *args, **kwargs)
