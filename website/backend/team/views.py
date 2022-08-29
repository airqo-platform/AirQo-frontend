from itertools import chain
import environ
import os
from pathlib import Path
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Member
from .serializers import TeamMemberSerializer

# Read environment
env = environ.Env(
    # set casting, default value
    DEBUG=(bool, False)
)
BASE_DIR = Path(__file__).resolve().parent.parent
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))
DEBUG = env("DEBUG")

class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    ordering_fields = ('order', 'name')

    if(DEBUG):
        queryset = Member.objects.using("prod_database")
        
    else:
        queryset = Member.objects.all()
    
    serializer_class = TeamMemberSerializer