import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_v2_catalog.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  tearDown(LearnCatalog.resetMeta);

  LearnV2CatalogResponse catalogWith({
    List<LearnV2Stage> stages = const [],
    int maxPoints = 0,
  }) {
    return LearnV2CatalogResponse(
      success: true,
      catalogVersion: '2026-06-01',
      stages: stages,
      maxPoints: maxPoints,
      courses: const [],
    );
  }

  group('LearnCatalogMeta.fromCatalog', () {
    test('sorts server stages by index and drops empty names', () {
      final meta = LearnCatalogMeta.fromCatalog(catalogWith(
        stages: const [
          LearnV2Stage(index: 2, name: 'Observer'),
          LearnV2Stage(index: 0, name: 'Curious'),
          LearnV2Stage(index: 1, name: ''),
        ],
        maxPoints: 2400,
      ));

      expect(meta.stages.map((s) => s.name), ['Curious', 'Observer']);
      expect(meta.maxPoints, 2400);
    });

    test('falls back to the built-in ladder when the server sends none', () {
      final meta = LearnCatalogMeta.fromCatalog(catalogWith());

      expect(meta.stages, LearnCatalogMeta.fallback.stages);
      expect(meta.stages.first.name, 'Curious');
      expect(meta.maxPoints, isNull, reason: 'max_points 0 means unknown');
    });
  });

  group('LearnCatalog meta swap', () {
    test('applyCatalogMeta swaps the snapshot and resetMeta restores it', () {
      LearnCatalog.applyCatalogMeta(catalogWith(
        stages: const [LearnV2Stage(index: 0, name: 'Novice')],
        maxPoints: 100,
      ));

      expect(LearnCatalog.stages.single.name, 'Novice');
      expect(LearnCatalog.meta.maxPoints, 100);

      LearnCatalog.resetMeta();
      expect(LearnCatalog.stages, LearnCatalogMeta.fallback.stages);
    });

    test('maxPoints prefers the server value over local computation',
        () async {
      SharedPreferences.setMockInitialValues({});
      final progress = LearnProgressService.withPrefs(
        await SharedPreferences.getInstance(),
      );

      // No server value: falls back to local computation (0 for no courses).
      expect(LearnCatalog.maxPoints(const [], progress), 0);

      LearnCatalog.applyCatalogMeta(catalogWith(maxPoints: 2400));
      expect(LearnCatalog.maxPoints(const [], progress), 2400);
    });
  });
}
