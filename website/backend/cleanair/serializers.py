from rest_framework import serializers
from .models import CleanAirResource, ForumEvent, Engagement, Partner, Program, Session, Support, Person, Objective, ForumResource, ResourceFile


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
    sub_text_html = serializers.SerializerMethodField()
    sessions = SessionSerializer(many=True)

    def get_sub_text_html(self, obj):
        html = obj.sub_text.html
        return '' if html.strip() == '<p><br></p>' else html

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


class ResourceFileSerializer(serializers.ModelSerializer):
    resource_summary_html = serializers.SerializerMethodField()

    def get_resource_summary_html(self, obj):
        html = obj.resource_summary.html
        return '' if html.strip() == '<p><br></p>' else html

    class Meta:
        model = ResourceFile
        fields = ['file', 'resource_summary_html']


class ForumResourceSerializer(serializers.ModelSerializer):
    resource_files = ResourceFileSerializer(many=True, read_only=True)

    class Meta:
        model = ForumResource
        fields = '__all__'


class ForumEventSerializer(serializers.ModelSerializer):
    forum_resources = ForumResourceSerializer(many=True, read_only=True)
    engagements = EngagementSerializer(read_only=True)
    partners = PartnerSerializer(many=True, read_only=True)
    supports = SupportSerializer(many=True, read_only=True)
    programs = ProgramSerializer(many=True, read_only=True)
    persons = PersonSerializer(many=True, read_only=True)
    background_image = serializers.SerializerMethodField()
    introduction_html = serializers.SerializerMethodField()
    sponsorship_opportunities_about_html = serializers.SerializerMethodField()
    sponsorship_opportunities_schedule_html = serializers.SerializerMethodField()
    sponsorship_opportunities_partners_html = serializers.SerializerMethodField()
    sponsorship_packages_html = serializers.SerializerMethodField()
    schedule_details_html = serializers.SerializerMethodField()
    travel_logistics_vaccination_details_html = serializers.SerializerMethodField()
    travel_logistics_visa_details_html = serializers.SerializerMethodField()
    registration_details_html = serializers.SerializerMethodField()
    Speakers_text_section_html = serializers.SerializerMethodField()
    Committee_text_section_html = serializers.SerializerMethodField()
    partners_text_section_html = serializers.SerializerMethodField()
    glossary_details_html = serializers.SerializerMethodField()
    travel_logistics_accommodation_details_html = serializers.SerializerMethodField()

    def get_travel_logistics_accommodation_details_html(self, obj):
        html = obj.travel_logistics_accommodation_details.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_glossary_details_html(self, obj):
        html = obj.glossary_details.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_partners_text_section_html(self, obj):
        html = obj.partners_text_section.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_sponsorship_opportunities_partners_html(self, obj):
        html = obj.sponsorship_opportunities_partners.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_sponsorship_opportunities_about_html(self, obj):
        html = obj.sponsorship_opportunities_about.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_sponsorship_opportunities_schedule_html(self, obj):
        html = obj.sponsorship_opportunities_schedule.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_sponsorship_packages_html(self, obj):
        html = obj.sponsorship_packages.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_sponsorship_details_html(self, obj):
        html = obj.sponsorship_opportunities.html
        return '' if html.strip() == '<p><br></p>' else html

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

    def get_registration_details_html(self, obj):
        html = obj.registration_details.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_schedule_details_html(self, obj):
        html = obj.schedule_details.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_travel_logistics_vaccination_details_html(self, obj):
        html = obj.travel_logistics_vaccination_details.html
        return '' if html.strip() == '<p><br></p>' else html

    def get_travel_logistics_visa_details_html(self, obj):
        html = obj.travel_logistics_visa_details.html
        return '' if html.strip() == '<p><br></p>' else html

    class Meta:
        model = ForumEvent
        exclude = ['introduction', 'Speakers_text_section', "travel_logistics_accommodation_details", "glossary_details", "schedule_details", "partners_text_section", "sponsorship_opportunities_about", "sponsorship_opportunities_schedule", "sponsorship_packages",
                   'Committee_text_section', 'registration_details', 'travel_logistics_vaccination_details', 'order', 'author', 'updated_by', "sponsorship_opportunities_partners"]
