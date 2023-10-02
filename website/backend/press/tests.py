from django.test import TestCase
from .models import Press

class PressModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        Press.objects.create(
            article_title="Test Article",
            article_intro="Test Intro",
            date_published="2023-09-12",
        )

    def test_article_title_max_length(self):
        press = Press.objects.get(id=1)
        max_length = press._meta.get_field("article_title").max_length
        self.assertEqual(len(press.article_title), max_length)

    def test_str_method(self):
        press = Press.objects.get(id=1)
        self.assertEqual(str(press), press.article_title)

    def test_ordering(self):
        press1 = Press.objects.create(
            article_title="Article 1",
            article_intro="Intro 1",
            date_published="2023-09-13",
        )
        press2 = Press.objects.create(
            article_title="Article 2",
            article_intro="Intro 2",
            date_published="2023-09-14",
        )
        press3 = Press.objects.create(
            article_title="Article 3",
            article_intro="Intro 3",
            date_published="2023-09-15",
        )

        press_entries = Press.objects.all()
        self.assertEqual(press_entries[0], press3)
        self.assertEqual(press_entries[1], press2)
        self.assertEqual(press_entries[2], press1)
