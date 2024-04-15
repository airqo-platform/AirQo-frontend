from rest_framework import serializers
from .models import CleanAirResource, ForumEvent, Engagement, Partner, Program, Session, Support, Person, Objective


class CleanAirResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CleanAirResource
        fields = '__all__'


class ObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objective
        exclude = ['order']


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
        exclude = ['order']


class SessionSerializer(serializers.ModelSerializer):
    session_details_html = serializers.SerializerMethodField()

    def get_session_details_html(self, obj):
        html = obj.session_details.html
        return '' if html.strip() == '<p><br></p>' else html

    class Meta:
        model = Session
        exclude = ['order', 'session_details']


class ProgramSerializer(serializers.ModelSerializer):
    sessions = SessionSerializer(many=True)

    class Meta:
        model = Program
        exclude = ['order']


class SupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Support
        exclude = ['order']


class PersonSerializer(serializers.ModelSerializer):
    picture = serializers.SerializerMethodField()
    bio_html = serializers.SerializerMethodField()

    def get_bio_html(self, obj):
        html = obj.bio.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_picture(self, obj):
        return obj.picture.url

    class Meta:
        model = Person
        exclude = ['bio', 'order']


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
    Speakers_text_section_html = serializers.SerializerMethodField()
    Committee_text_section_html = serializers.SerializerMethodField()

    def get_Speakers_text_section_html(self, obj):
        html = obj.Speakers_text_section.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_Committee_text_section_html(self, obj):
        html = obj.Committee_text_section.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_introduction_html(self, obj):
        html = obj.introduction.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_background_image(self, obj):
        if obj.background_image is not None:
            return obj.background_image.url
        else:
            return None

    def get_travel_logistics_html(self, obj):
        html = obj.travel_logistics.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_registration_details_html(self, obj):
        html = obj.registration_details.html
        return '' if html.strip() == '<p><br></p>' else html

    class Meta:
        model = ForumEvent
        exclude = ['introduction', 'Speakers_text_section',
                   'Committee_text_section', 'registration_details', 'travel_logistics', 'order', 'author', 'updated_by']
