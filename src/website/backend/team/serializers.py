from rest_framework import serializers
from .models import Member, MemberBiography

class MemberBiographySerializer(serializers.ModelSerializer):
    class Meta:
        fields = ("id", "description", "member", "order")
        model = MemberBiography

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = '__all__'

    picture = serializers.SerializerMethodField()
    descriptions = MemberBiographySerializer(read_only=True, many=True)

    @staticmethod
    def get_picture(obj):
        return obj.picture.url
