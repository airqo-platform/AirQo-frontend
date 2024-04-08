from rest_framework import serializers
from .models import CleanAirResource, ForumEvent, Engagement, Partner, Program, Session, Support, Person, Objective


class CleanAirResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CleanAirResource
        fields = '__all__'


class ObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objective
        fields = '__all__'


class EngagementSerializer(serializers.ModelSerializer):
    objectives = ObjectiveSerializer(many=True, read_only=True)

    class Meta:
        model = Engagement
        fields = '__all__'


class PartnerSerializer(serializers.ModelSerializer):
    partner_logo = serializers.SerializerMethodField()

    def get_partner_logo(self, obj):
        return obj.partner_logo.url

    class Meta:
        model = Partner
        fields = '__all__'


class SessionSerializer(serializers.ModelSerializer):
    session_details_html = serializers.SerializerMethodField()

    def get_session_details_html(self, obj):
        return obj.session_details.html

    class Meta:
        model = Session
        fields = '__all__'


class ProgramSerializer(serializers.ModelSerializer):
    sessions = SessionSerializer(many=True)

    class Meta:
        model = Program
        fields = '__all__'


class SupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Support
        fields = '__all__'


class PersonSerializer(serializers.ModelSerializer):
    picture = serializers.SerializerMethodField()

    def get_picture(self, obj):
        return obj.picture.url

    class Meta:
        model = Person
        fields = '__all__'


class ForumEventSerializer(serializers.ModelSerializer):
    engagements = EngagementSerializer(read_only=True)
    partners = PartnerSerializer(many=True, read_only=True)
    supports = SupportSerializer(many=True, read_only=True)
    programs = ProgramSerializer(many=True, read_only=True)
    persons = PersonSerializer(many=True, read_only=True)
    background_image = serializers.SerializerMethodField()
    introduction_html = serializers.SerializerMethodField()
    travel_logistics_html = serializers.SerializerMethodField()
    registration_details_html = serializers.SerializerMethodField()

    def get_introduction_html(self, obj):
        return obj.introduction.html

    def get_background_image(self, obj):
        if obj.background_image is not None:
            return obj.background_image.url
        else:
            return None

    def get_travel_logistics_html(self, obj):
        return obj.travel_logistics.html

    def get_registration_details_html(self, obj):
        return obj.registration_details.html

    class Meta:
        model = ForumEvent
        fields = '__all__'
