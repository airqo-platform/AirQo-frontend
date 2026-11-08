import 'dart:async';

import 'package:airqo/src/app/dashboard/bloc/dashboard/dashboard_bloc.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/repository/dashboard_repository.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';

/// Always fails to load, as when the app starts offline with nothing cached.
class _FailingDashboardRepository extends DashboardRepository {
  int fetchCount = 0;

  @override
  Future<AirQualityResponse> fetchAirQualityReadings(
      {bool forceRefresh = false}) async {
    fetchCount++;
    throw Exception(
        'Unable to load data. Please check your connection and try again.');
  }

  @override
  Future<void> clearCache() async {}

  @override
  Stream<AirQualityResponse> get airQualityStream =>
      const Stream<AirQualityResponse>.empty();
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  // DashboardBloc creates a UserPreferencesImpl, which reads dotenv.
  dotenv.testLoad(fileInput: 'AIRQO_API_TOKEN=test-token');

  late _FailingDashboardRepository repository;
  late DashboardBloc bloc;

  setUp(() {
    repository = _FailingDashboardRepository();
    bloc = DashboardBloc(repository);
  });

  tearDown(() => bloc.close());

  Future<void> loadIntoErrorState() async {
    bloc.add(const LoadDashboard());
    await bloc.stream.firstWhere((s) => s is DashboardLoadingError);
    expect(repository.fetchCount, 1);
  }

  test('reloads when the connection returns after a failed load', () async {
    await loadIntoErrorState();

    bloc.add(const ConnectionStatusChanged(
      isConnected: true,
      connectionType: ConnectionType.wifi,
    ));
    await bloc.stream.firstWhere((s) => s is DashboardLoadingError);

    expect(repository.fetchCount, 2);
  });

  test('does not reload while still offline', () async {
    await loadIntoErrorState();

    bloc.add(const ConnectionStatusChanged(
      isConnected: false,
      connectionType: ConnectionType.none,
    ));
    await pumpEventQueue();

    expect(repository.fetchCount, 1);
    expect(bloc.state, isA<DashboardLoadingError>());
  });
}
