group('getDailyForecast', () {
    const tCity = 'London';
    final tForecast = ForecastModel(temperature: 20, condition: 'Sunny');

    test('should return ForecastModel when remote data source returns valid data', () async {
      when(mockRemoteDataSource.fetchDailyForecast(any))
          .thenAnswer((_) async => tForecast);
      final result = await repository.getDailyForecast(tCity);
      expect(result, equals(tForecast));
      verify(mockRemoteDataSource.fetchDailyForecast(tCity));
      verifyNoMoreInteractions(mockRemoteDataSource);
    });

    test('should throw RepositoryException on DioError', () {
      when(mockRemoteDataSource.fetchDailyForecast(any))
          .thenThrow(DioError(requestOptions: RequestOptions(path: '')));
      expect(
        () => repository.getDailyForecast(tCity),
        throwsA(isA<RepositoryException>()),
      );
    });

    test('should throw RepositoryException on unexpected error', () {
      when(mockRemoteDataSource.fetchDailyForecast(any))
          .thenThrow(Exception('Unexpected error'));
      expect(
        () => repository.getDailyForecast(tCity),
        throwsA(isA<RepositoryException>()),
      );
    });
  });
</newLines>

<startLine>72</startLine>
<endLine>72</endLine>
<newLines>  group('getWeeklyForecast', () {
    const tCity = 'Paris';
    final tWeeklyForecast = [
      ForecastModel(temperature: 15, condition: 'Cloudy'),
      ForecastModel(temperature: 18, condition: 'Rain'),
    ];

    test('should return list of ForecastModel when remote data source returns valid data', () async {
      when(mockRemoteDataSource.fetchWeeklyForecast(any))
          .thenAnswer((_) async => tWeeklyForecast);
      final result = await repository.getWeeklyForecast(tCity);
      expect(result, equals(tWeeklyForecast));
      verify(mockRemoteDataSource.fetchWeeklyForecast(tCity));
      verifyNoMoreInteractions(mockRemoteDataSource);
    });

    test('should throw RepositoryException on DioError', () {
      when(mockRemoteDataSource.fetchWeeklyForecast(any))
          .thenThrow(DioError(requestOptions: RequestOptions(path: '')));
      expect(
        () => repository.getWeeklyForecast(tCity),
        throwsA(isA<RepositoryException>()),
      );
    });

    test('should throw RepositoryException on unexpected error', () {
      when(mockRemoteDataSource.fetchWeeklyForecast(any))
          .thenThrow(Exception('Unexpected error'));
      expect(
        () => repository.getWeeklyForecast(tCity),
        throwsA(isA<RepositoryException>()),
      );
    });
  });