from django.test import TestCase
from .models import Partner

class PartnerModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        Partner.objects.create(
            partner_name="Test Partner",
            partner_logo="test_images/test_logo.png",
            order=1,
        )

    def test_partner_name_max_length(self):
        partner = Partner.objects.get(id=1)
        max_length = partner._meta.get_field("partner_name").max_length
        self.assertEqual(len(partner.partner_name), max_length)

    def test_str_method(self):
        partner = Partner.objects.get(id=1)
        expected_string = f"Partner - {partner.partner_name}"
        self.assertEqual(str(partner), expected_string)

    def test_ordering(self):
        partner1 = Partner.objects.create(
            partner_name="Partner 1",
            partner_logo="logo1.jpg",
            order=2,
        )
        partner2 = Partner.objects.create(
            partner_name="Partner 2",
            partner_logo="logo2.jpg",
            order=3,
        )
        partner3 = Partner.objects.create(
            partner_name="Partner 3",
            partner_logo="logo3.jpg",
            order=1,
        )

        partner_entries = Partner.objects.all()
        self.assertEqual(partner_entries[0], partner3)
        self.assertEqual(partner_entries[1], partner1)
        self.assertEqual(partner_entries[2], partner2)
