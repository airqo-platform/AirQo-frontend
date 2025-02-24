from django.test import TestCase
from django.contrib.auth.models import User
from backend.impact.models import ImpactNumber

class ImpactNumberTestCase(TestCase):
    def setUp(self):
        # Create a mock user for testing the with_author decorator
        self.user = User.objects.create_user(username='testuser', password='testpassword')

    def test_save_method(self):
        # Create an instance of ImpactNumber with initial values
        impact_number = ImpactNumber.objects.create(
            african_cities=8,
            champions=1500,
            deployed_monitors=200,
            data_records=67,
            research_papers=10,
            partners=300
        )

        # Modify some values
        impact_number.african_cities = 10
        impact_number.champions = 2000
        impact_number.deployed_monitors = 300
        impact_number.data_records = 100
        impact_number.research_papers = 20
        impact_number.partners = 400

        # Save the instance
        impact_number.save()

        # Get the instance from the database to check the updated values
        updated_impact_number = ImpactNumber.objects.first()

        # Check if the values have been updated
        self.assertEqual(updated_impact_number.african_cities, 10)
        self.assertEqual(updated_impact_number.champions, 2000)
        self.assertEqual(updated_impact_number.deployed_monitors, 300)
        self.assertEqual(updated_impact_number.data_records, 100)
        self.assertEqual(updated_impact_number.research_papers, 20)
        self.assertEqual(updated_impact_number.partners, 400)
