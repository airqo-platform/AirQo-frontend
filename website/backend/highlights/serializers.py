from rest_framework import serializers
from .models import Highlight, Tag

class HighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Highlight
        fields = '__all__'
    image = serializers.SerializerMethodField()

    @staticmethod
    def get_image(obj):
        return obj.image.url

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'
