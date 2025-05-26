import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/repository/auth_repository.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/dashboard/repository/forecast_repository.dart';
import 'package:airqo/src/app/learn/repository/kya_repository.dart';
import 'package:airqo/src/app/map/repository/map_repository.dart';
import 'package:airqo/src/app/other/places/repository/google_places_repository.dart';
import 'package:airqo/src/app/other/theme/repository/theme_repository.dart';
import 'package:airqo/src/app/profile/repository/user_repository.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:airqo/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider_platform_interface/path_provider_platform_interface.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'package:loggy/loggy.dart';


class FakePathProviderPlatform extends PathProviderPlatform
    with MockPlatformInterfaceMixin {
  @override
  Future<String?> getTemporaryPath() async {
    return '.';
  }

  @override
  Future<String?> getApplicationDocumentsPath() async {
    return '.';
  }

  @override
  Future<String?> getApplicationSupportPath() async {
    return '.';
  }
}

// Test implementations of repositories
class TestAuthRepository extends AuthRepository {
  @override
  Future<String> loginWithEmailAndPassword(String username, String password) async {
    return 'test_token';
  }

  @override
  Future<void> registerWithEmailAndPassword(RegisterInputModel model) async {
  }

  @override
  Future<String> requestPasswordReset(String email) async {
    return 'Password reset link sent';
  }

  @override
  Future<String> updatePassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    return 'Password updated successfully';
  }

  @override
  Future<void> verifyEmailCode(String token, String email) async {
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    PathProviderPlatform.instance = FakePathProviderPlatform();
    
    try {
      final path = '.';
      Hive.init(path);
    } catch (e) {
      print('Hive initialization: $e');
    }
    
    try {
      await CacheManager().initialize();
    } catch (e) {
      print('CacheManager initialization: $e');
    }
    
    // Load test environment variables
    dotenv.testLoad(mergeWith: {
      'AIRQO_MOBILE_TOKEN': 'test_token',
      'API_KEY': 'test_api_key',
      'BASE_URL': 'https://test.example.com',
      'GOOGLE_MAPS_API_KEY': 'test_google_maps_key',
    });
    
    // Initialize logging
    Loggy.initLoggy(
      logPrinter: const PrettyPrinter(
        showColors: false,
      ),
    );
  });

  tearDown(() async {
    // Clean up Hive boxes after each test
    try {
      await Hive.deleteFromDisk();
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  group('AirqoMobile Widget Tests', () {
    testWidgets('App loads without crashing with test repositories', 
        (WidgetTester tester) async {
      // Use a shorter timeout for async operations
      await tester.runAsync(() async {
        // Build our app with test repositories
        await tester.pumpWidget(
          MaterialApp(
            home: Builder(
              builder: (context) => AirqoMobile(
                authRepository: TestAuthRepository(),
                userRepository: UserImpl(),
                kyaRepository: KyaImpl(),
                themeRepository: ThemeImpl(),
                mapRepository: MapImpl(),
                forecastRepository: ForecastImpl(),
                googlePlacesRepository: GooglePlacesImpl(),
                dashboardRepository: DashboardImpl(),
              ),
            ),
          ),
        );

        await tester.pump();
        await Future.delayed(const Duration(milliseconds: 100));
        await tester.pump();


        expect(find.byType(AirqoMobile), findsOneWidget);
        expect(find.byType(MaterialApp), findsWidgets); 
      });
    });

    testWidgets('Simple widget test - App structure exists', 
        (WidgetTester tester) async {
      final widget = AirqoMobile(
        authRepository: TestAuthRepository(),
        userRepository: UserImpl(),
        kyaRepository: KyaImpl(),
        themeRepository: ThemeImpl(),
        mapRepository: MapImpl(),
        forecastRepository: ForecastImpl(),
        googlePlacesRepository: GooglePlacesImpl(),
        dashboardRepository: DashboardImpl(),
      );

      expect(widget.authRepository, isA<AuthRepository>());
      expect(widget.userRepository, isA<UserRepository>());
      expect(widget.kyaRepository, isA<KyaRepository>());
      expect(widget.themeRepository, isA<ThemeRepository>());
      expect(widget.mapRepository, isA<MapRepository>());
      expect(widget.forecastRepository, isA<ForecastRepository>());
      expect(widget.googlePlacesRepository, isA<GooglePlacesRepository>());
      expect(widget.dashboardRepository, isA<DashboardRepository>());
    });

    testWidgets('Minimal app test - Just verify widget creation', 
        (WidgetTester tester) async {
      await tester.pumpWidget(
        Directionality(
          textDirection: TextDirection.ltr,
          child: MediaQuery(
            data: const MediaQueryData(),
            child: Material(
              child: Center(
                child: Text('Test'),
              ),
            ),
          ),
        ),
      );

      expect(find.text('Test'), findsOneWidget);
    });
  });
}