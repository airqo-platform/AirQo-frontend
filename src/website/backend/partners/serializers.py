from rest_framework import serializers
from .models import Partner, PartnerDescription


class PartnerDescriptionsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ("id", "description", "partner", "order")
        model = PartnerDescription


class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = '__all__'
        ref_name = 'PartnerList'

    descriptions = PartnerDescriptionsSerializer(read_only=True, many=True)
    partner_image = serializers.SerializerMethodField()
    partner_logo = serializers.SerializerMethodField()

    @staticmethod
    def get_partner_logo(obj):
        return obj.partner_logo.url

    @staticmethod
    def get_partner_image(obj):
        if obj.partner_image:
            return obj.partner_image.url
