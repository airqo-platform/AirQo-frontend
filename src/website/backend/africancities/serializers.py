from rest_framework import serializers
from .models import AfricanCountry, City, Content, Image, Description

class ImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    @staticmethod
    def get_image(obj):
        return obj.image.url

    class Meta:
        fields =  ('id','image')
        model = Image

class DescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id','paragraph')
        model = Description

class ContentSerializer(serializers.ModelSerializer):
    image = ImageSerializer(read_only=True, many=True)
    description = DescriptionSerializer(read_only=True, many=True)

    class Meta:
        fields = ('id','title','description','image')
        model = Content

class CitySerializer(serializers.ModelSerializer):
    content = ContentSerializer(read_only=True, many=True)

    class Meta:
        fields = ('id','city_name','content')
        model = City

class AfricanCitySerializer(serializers.ModelSerializer):
    city = CitySerializer(read_only=True, many=True)
    country_flag = serializers.SerializerMethodField()

    @staticmethod
    def get_country_flag(obj):
        return obj.country_flag.url

    class Meta:
        fields = '__all__'
        model = AfricanCountry