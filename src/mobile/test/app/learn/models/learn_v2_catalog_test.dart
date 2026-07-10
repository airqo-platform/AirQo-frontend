import 'dart:convert';

import 'package:airqo/src/app/learn/models/learn_v2_catalog.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('LearnV2CatalogResponse.fromJson', () {
    test('accepts numeric fields sent as doubles', () {
      final response = learnV2CatalogResponseFromJson(json.encode({
        'success': true,
        'catalog_version': '2026-06-01',
        'max_points': 2400.0,
        'stages': [
          {'index': 1.0, 'name': 'Aware'},
        ],
        'courses': [
          {
            '_id': 'c1',
            'course_number': 2.0,
            'title': 'Course',
            'units': [
              {
                '_id': 'u1',
                'title': 'Unit',
                'lessons': [
                  {
                    '_id': 'l1',
                    'title': 'Lesson',
                    'activities': [
                      {'_id': 'a1', 'type': 'article', 'order': 3.0},
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }));

      expect(response.maxPoints, 2400);
      expect(response.stages.single.index, 1);
      expect(response.courses.single.courseNumber, 2);
      expect(
        response.courses.single.units.single.lessons.single.activities.single
            .order,
        3,
      );
    });

    test('defaults missing or non-numeric fields to zero', () {
      final response = learnV2CatalogResponseFromJson(json.encode({
        'success': true,
        'catalog_version': 'v',
        'max_points': 'lots',
        'courses': <dynamic>[],
      }));

      expect(response.maxPoints, 0);
    });
  });
}
