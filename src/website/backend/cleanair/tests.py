from django.test import TestCase
from .models import CleanAirResource

class CleanAirResourceModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        CleanAirResource.objects.create(
            resource_title="Test Resource",
            order=1,
        )

    def test_resource_title_max_length(self):
        resource = CleanAirResource.objects.get(id=1)
        max_length = resource._meta.get_field("resource_title").max_length
        self.assertEqual(len(resource.resource_title), max_length)

    def test_str_method(self):
        resource = CleanAirResource.objects.get(id=1)
        self.assertEqual(str(resource), resource.resource_title)

    def test_ordering(self):
        resource1 = CleanAirResource.objects.create(
            resource_title="Resource 1",
            order=2,
        )
        resource2 = CleanAirResource.objects.create(
            resource_title="Resource 2",
            order=3,
        )
        resource3 = CleanAirResource.objects.create(
            resource_title="Resource 3",
            order=1,
        )

        resource_entries = CleanAirResource.objects.all()
        self.assertEqual(resource_entries[0], resource3)
        self.assertEqual(resource_entries[1], resource1)
        self.assertEqual(resource_entries[2], resource2)

