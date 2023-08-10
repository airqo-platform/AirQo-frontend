from rest_framework import serializers
from .models import Press


class PressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Press
        fields = '__all__'
    publisher_logo = serializers.SerializerMethodField()

    @staticmethod
    def get_publisher_logo(obj):
        if obj.publisher_logo:
            return obj.publisher_logo.url
        else:
            return None
