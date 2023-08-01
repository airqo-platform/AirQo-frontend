from rest_framework import serializers
from .models import ImpactNumber


class ImpactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactNumber
        fields = '__all__'