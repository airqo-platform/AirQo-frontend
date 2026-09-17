import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/dashboard/utils/measurement_location_utils.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/shared/utils/location_label.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('normalizeLocationLabel', () {
    test('rewrites Cameroun to Cameroon inside place strings', () {
      expect(
        normalizeLocationLabel('Mendong Yaoundé, Cameroun'),
        'Mendong Yaoundé, Cameroon',
      );
      expect(
        normalizeLocationLabel('Yaoundé, cameroun'),
        'Yaoundé, Cameroon',
      );
      expect(normalizeLocationLabel('Cameroon'), 'Cameroon');
      expect(normalizeLocationLabel('Nairobi, Kenya'), 'Nairobi, Kenya');
    });

    test('countriesMatch treats Cameroun and Cameroon as the same country', () {
      expect(countriesMatch('Cameroun', 'Cameroon'), isTrue);
      expect(countriesMatch('cameroun', 'CAMEROON'), isTrue);
      expect(countriesMatch('Kenya', 'Cameroon'), isFalse);
    });
  });

  group('display surfaces', () {
    test('SiteDetails constructor normalizes Cameroun fields', () {
      final details = SiteDetails(
        name: 'Mendong Yaoundé, Cameroun',
        searchName: 'Mendong, Cameroun',
        locationName: 'Yaoundé, Cameroun',
        city: 'Yaoundé, Cameroun',
        country: 'Cameroun',
      );

      expect(details.name, 'Mendong Yaoundé, Cameroon');
      expect(details.searchName, 'Mendong, Cameroon');
      expect(details.locationName, 'Yaoundé, Cameroon');
      expect(details.city, 'Yaoundé, Cameroon');
      expect(details.country, 'Cameroon');
    });

    test('measurement helpers and country flags stay on Cameroon', () {
      final measurement = Measurement(
        siteDetails: SiteDetails(
          searchName: 'Mendong Yaoundé, Cameroun',
          name: 'Mendong Yaoundé, Cameroun',
          city: 'Yaoundé',
          country: 'Cameroun',
        ),
      );

      expect(
        measurementDisplayName(measurement),
        'Mendong Yaoundé, Cameroon',
      );
      expect(
        measurementLocationDescription(measurement),
        'Yaoundé, Cameroon',
      );
      expect(CountryModel.getFlagFromCountryName('Cameroun'), '🇨🇲');
    });

    test('saved favorites and Exposure labels use Cameroon', () {
      final site = SelectedSite.fromJson({
        '_id': 'site-1',
        'name': 'Mendong Yaoundé, Cameroun',
        'search_name': 'Yaoundé, Cameroun',
      });
      expect(site.visibleName, 'Mendong Yaoundé, Cameroon');
      expect(site.visibleSearchName, 'Yaoundé, Cameroon');

      final place = DeclaredPlace.fromJson({
        'site_id': 'site-1',
        'display_name': 'Home',
        'location_name': 'Mendong Yaoundé, Cameroun',
        'city': 'Yaoundé, Cameroun',
        'type': 'home',
      });
      expect(place.visibleLocationName, 'Mendong Yaoundé, Cameroon');
      expect(place.visibleCity, 'Yaoundé, Cameroon');
    });
  });
}
