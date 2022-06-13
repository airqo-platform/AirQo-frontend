from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Member
from .serializers import TeamMemberSerializer


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    ordering_fields = ('order', 'name')
    queryset = Member.objects.all()
    serializer_class = TeamMemberSerializer
