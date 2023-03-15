from rest_framework import serializers
from .models import Event, Program, Session, PartnerLogo, Inquiry

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id','inquiry','role','email')
        model = Inquiry

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id','session_title','session_details','venue','start_time','end_time')
        model = Session

class ProgramSerializer(serializers.ModelSerializer):
    sessions = SessionSerializer(read_only=True, many=True)
    class Meta:
        fields = ('id','date','program_details','sessions')
        model = Program

class PartnerLogoSerializer(serializers.ModelSerializer):
    partner_logo = serializers.SerializerMethodField()

    @staticmethod
    def get_partner_logo(obj):
        return obj.partner_logo.url

    class Meta:
        fields = ('id','name','partner_logo')
        model = PartnerLogo

class EventSerializer(serializers.ModelSerializer):
    inquiries = InquirySerializer(read_only=True, many=True)
    programs = ProgramSerializer(read_only=True, many=True)
    partner_logos = PartnerLogoSerializer(read_only=True, many=True)
    event_image = serializers.SerializerMethodField()
    background_image = serializers.SerializerMethodField()

    @staticmethod
    def get_event_image(obj):
        return obj.event_image.url
    
    @staticmethod
    def get_background_image(obj):
        return obj.background_image.url

    class Meta:
        fields = '__all__'
        model = Event