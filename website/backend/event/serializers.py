from rest_framework import serializers
from .models import Event, Program, Session, PartnerLogo, Inquiry

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id','inquiry','role','email')
        model = Inquiry

class SessionSerializer(serializers.ModelSerializer):
    html = serializers.SerializerMethodField()
    plain = serializers.SerializerMethodField()

    def get_html(self, instance):
        return str(instance.session_details.html)

    def get_plain(self, instance):
        return str(instance.session_details.plain)

    class Meta:
        fields = ('id','session_title','html','venue','start_time','end_time','plain')
        model = Session

class ProgramSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True, many=True)
    class Meta:
        fields = ('id','date','program_details','session')
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
    inquiry = InquirySerializer(read_only=True, many=True)
    program = ProgramSerializer(read_only=True, many=True)
    partner = PartnerLogoSerializer(read_only=True, many=True)
    event_image = serializers.SerializerMethodField()
    background_image = serializers.SerializerMethodField()
    html = serializers.SerializerMethodField()
    plain = serializers.SerializerMethodField()

    def get_html(self, instance):
        return str(instance.event_details.html)

    def get_plain(self, instance):
        return str(instance.event_details.plain)

    @staticmethod
    def get_event_image(obj):
        return obj.event_image.url
    
    @staticmethod
    def get_background_image(obj):
        return obj.background_image.url

    class Meta:
        fields = '__all__'
        model = Event