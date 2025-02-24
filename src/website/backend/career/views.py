from django.utils import translation
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Career, Department
from .serializers import CareerSerializer, DepartmentSerializer


class BaseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)

    def list(self, request, *args, **kwargs):
        language = request.session.get('django_language')
        if language is None:
            language = request.COOKIES.get('django_language')
        if language is not None:
            translation.activate(language)
        return super().list(request, *args, **kwargs)


class DepartmentViewSet(BaseViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class CareerViewSet(BaseViewSet):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer
