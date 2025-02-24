from django.test import TestCase
from .models import Event

class EventModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        Event.objects.create(
            title="Test Event",
            title_subtext="Test Subtext",
            start_date="2023-09-12",
            event_image="test_images/test_image_2.png",  
            event_details="This is a test event.",
        )

    def test_title_max_length(self):
        event = Event.objects.get(id=1)
        max_length = event._meta.get_field("title").max_length
        self.assertEqual(len(event.title), max_length)

    def test_str_method(self):
        event = Event.objects.get(id=1)
        self.assertEqual(str(event), event.title)

    def test_generate_unique_title(self):
        event = Event.objects.get(id=1)
        unique_title = event.generate_unique_title()
        self.assertIsNotNone(unique_title)
        self.assertNotEqual(unique_title, event.title)

    def test_ordering(self):
        event1 = Event.objects.create(title="Event 1", title_subtext="Subtext 1", start_date="2023-09-13", event_image="image1.jpg", event_details="Event 1")
        event2 = Event.objects.create(title="Event 2", title_subtext="Subtext 2", start_date="2023-09-14", event_image="image2.jpg", event_details="Event 2")
        event3 = Event.objects.create(title="Event 3", title_subtext="Subtext 3", start_date="2023-09-15", event_image="image3.jpg", event_details="Event 3")

        events = Event.objects.all()
        self.assertEqual(events[0], event3)
        self.assertEqual(events[1], event2)
        self.assertEqual(events[2], event1)

