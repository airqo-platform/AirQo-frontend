from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import BoardMember
from .serializers import BoardMemberSerializer


class BoardViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    ordering_fields = ('order', 'name')
    queryset = BoardMember.objects.all()
    serializer_class = BoardMemberSerializer
