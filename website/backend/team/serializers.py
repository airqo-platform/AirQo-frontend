from rest_framework import serializers
from .models import Member


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

    picture = serializers.SerializerMethodField()

    @staticmethod
    def get_picture(obj):
        return obj.picture.url
