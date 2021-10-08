from rest_framework import viewsets
from .models import Member
from .serializers import TeamMemberSerializer


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Member.objects.all()
    serializer_class = TeamMemberSerializer
