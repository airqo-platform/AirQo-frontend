// Testing frameworks: flutter_test, mockito
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mobile_v3/app/dashboard/repository/dashboard_repository.dart';
import 'package:mobile_v3/app/dashboard/model/dashboard.dart';
import 'package:mobile_v3/app/api/api_client.dart';

class MockApiClient extends Mock implements ApiClient {}

void main() {
  group('DashboardRepository', () {
    late MockApiClient mockApiClient;
    late DashboardRepository repository;

    setUp(() {
      mockApiClient = MockApiClient();
      repository = DashboardRepository(mockApiClient);
    });

    test('fetchDashboard returns Dashboard when ApiClient returns valid data', () async {
      final sample = Dashboard(id: 1, title: 'Home', widgets: []);
      when(mockApiClient.getDashboard(1)).thenAnswer((_) async => sample);

      final result = await repository.fetchDashboard(1);

      expect(result, equals(sample));
      verify(mockApiClient.getDashboard(1)).called(1);
    });

    test('fetchDashboard throws ArgumentError for invalid userId', () {
      expect(() => repository.fetchDashboard(-1), throwsA(isA<ArgumentError>()));
    });

    test('fetchDashboard propagates exception from ApiClient', () async {
      when(mockApiClient.getDashboard(2)).thenThrow(Exception('Network failure'));

      expect(() => repository.fetchDashboard(2), throwsA(isA<Exception>()));
    });

    test('updateDashboard completes when ApiClient updates successfully', () async {
      final dash = Dashboard(id: 3, title: 'Stats', widgets: []);
      when(mockApiClient.updateDashboard(dash)).thenAnswer((_) async => null);

      await repository.updateDashboard(dash);

      verify(mockApiClient.updateDashboard(dash)).called(1);
    });

    test('updateDashboard propagates exception from ApiClient', () async {
      final dash = Dashboard(id: 4, title: 'Profile', widgets: []);
      when(mockApiClient.updateDashboard(dash)).thenThrow(Exception('Update failed'));

      expect(() => repository.updateDashboard(dash), throwsA(isA<Exception>()));
    });
  });
}