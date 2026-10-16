import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/utils/measurement_location_utils.dart';
import 'package:airqo/src/app/shared/services/feature_flag_service.dart';
import 'package:airqo/src/app/shared/utils/spoken_place.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  SpokenPlace place({
    String? name,
    String? searchName,
    String? generatedName,
    String? city,
    String? region,
    String? county,
  }) {
    return spokenPlace(
      name: name,
      searchName: searchName,
      generatedName: generatedName,
      city: city,
      region: region,
      county: county,
    );
  }

  test('Uhuru Park drops the Kilimani bucket and the site id', () {
    final result = place(
      name: 'Uhuru Park',
      searchName: 'Kilimani 435',
      generatedName: 'site_435',
      city: 'Nairobi',
      region: 'Nairobi County',
    );

    expect(result.title, 'Uhuru Park');
    expect(result.quietLine, 'Nairobi, Nairobi County');
    expect(result.title.contains('Kilimani'), isFalse);
    expect(result.quietLine.contains('Kilimani'), isFalse);
    expect(result.title.contains('435'), isFalse);
    expect(result.quietLine.contains('435'), isFalse);
  });

  test('a street replaces wabigalo, and an area word does not', () {
    final withRoad = place(
      name: 'wabigalo',
      searchName: 'Mbogo Road',
      generatedName: 'site_150',
      city: 'Kampala',
      region: 'Central Region',
    );
    final areaOnly = place(
      name: 'wabigalo',
      searchName: 'Mbogo',
      generatedName: 'site_151',
      city: 'Kampala',
      region: 'Central Region',
    );

    expect(withRoad.title, 'Mbogo Road');
    expect(areaOnly.title, 'Wabigalo');
    expect(withRoad.quietLine, 'Kampala, Central Region');
    expect(areaOnly.quietLine, 'Kampala, Central Region');
    expect(areaOnly.quietLine.contains('Mbogo'), isFalse);
    expect(areaOnly.title.contains('Mbogo'), isFalse);
  });

  test('Tank Hill Road is its own title, and the same hill stays the hill', () {
    final road = place(
      name: 'Muyenga tank hill',
      searchName: 'Tank Hill Road',
      generatedName: 'site_165',
      city: 'Kampala',
      region: 'Central Region',
    );
    final hill = place(
      name: 'Muyenga tank hill',
      searchName: 'Muyenga tank hill',
      generatedName: 'site_140',
      city: 'Kampala',
      region: 'Central Region',
    );

    expect(road.title, 'Tank Hill Road');
    expect(hill.title, 'Muyenga tank hill');
    expect(road.quietLine, 'Kampala, Central Region');
    expect(hill.quietLine, 'Kampala, Central Region');
  });

  test('both Salama Road monitors stay Salama Road', () {
    final kawempe = place(
      name: 'Salama Road',
      searchName: 'Kawempe Division 637',
      generatedName: 'site_637',
      city: 'Kampala',
      region: 'Central Region',
    );
    final makindye = place(
      name: 'Salama Road',
      searchName: 'Makindye Division',
      generatedName: 'site_679',
      city: 'Kampala',
      region: 'Central Region',
    );

    for (final result in [kawempe, makindye]) {
      expect(result.title, 'Salama Road');
      expect(result.quietLine, 'Kampala, Central Region');
      expect(result.title.toLowerCase().contains('division'), isFalse);
      expect(result.quietLine.toLowerCase().contains('division'), isFalse);
      expect(result.title.contains('Kawempe'), isFalse);
      expect(result.title.contains('Makindye'), isFalse);
      expect(result.quietLine.contains('Kawempe'), isFalse);
      expect(result.quietLine.contains('Makindye'), isFalse);
      expect(result.title.contains('637'), isFalse);
      expect(result.title.contains('679'), isFalse);
    }
  });

  test('Katwe 1 keeps the number that is part of the place', () {
    final result = place(
      name: 'Katwe 1',
      searchName: 'Katwe 1',
      generatedName: 'site_141',
      city: 'Kampala',
      region: 'Central Region',
    );

    expect(result.title, 'Katwe 1');
    expect(result.quietLine, 'Kampala, Central Region');
  });

  test('Munyonyo drops the site label and the division bucket', () {
    final result = place(
      name: 'Munyonyo Site 2',
      searchName: 'Makindye Division 705',
      generatedName: 'site_705',
      city: 'Kampala',
      region: 'Central Region',
    );

    expect(result.title, 'Munyonyo');
    expect(result.quietLine, 'Kampala, Central Region');
    expect(result.title.contains('Site'), isFalse);
    expect(result.title.contains('Makindye'), isFalse);
    expect(result.title.contains('705'), isFalse);
    expect(result.quietLine.contains('Makindye'), isFalse);
  });

  test('KampalaCentral yields to the street', () {
    final result = place(
      name: 'KampalaCentral',
      searchName: 'Kimathi Avenue',
      city: 'Kampala',
      region: 'Central Region',
    );

    expect(result.title, 'Kimathi Avenue');
    expect(result.quietLine, 'Kampala, Central Region');
    expect(result.title.contains('Kampala'), isFalse);
  });

  test('an ops nickname keeps the place and drops the city it repeats', () {
    final result = place(
      name: 'Golf Course Kampala. Site 1. Training Area',
      searchName: 'Makindye Division',
      generatedName: 'site_1',
      city: 'Kampala',
      region: 'Central Region',
    );

    expect(result.title, 'Golf Course Training Area');
    expect(result.quietLine, 'Kampala, Central Region');
    expect(result.title.contains('Site'), isFalse);
    expect(result.title.contains('Makindye'), isFalse);
  });

  test('flag off keeps today\'s search name and country line', () {
    FeatureFlagService.instance.debugSetEnabled(
      AppFeatureFlag.spokenPlaceTitles,
      false,
    );
    addTearDown(() {
      FeatureFlagService.instance.debugSetEnabled(
        AppFeatureFlag.spokenPlaceTitles,
        true,
      );
    });

    final measurement = Measurement(
      siteDetails: SiteDetails(
        name: 'Uhuru Park',
        searchName: 'Kilimani 435',
        generatedName: 'site_435',
        city: 'Nairobi',
        region: 'Nairobi County',
        country: 'Kenya',
      ),
    );

    expect(measurementDisplayName(measurement), 'Kilimani 435');
    expect(
      measurementLocationDescription(measurement),
      'Nairobi, Nairobi County, Kenya',
    );
  });
}
