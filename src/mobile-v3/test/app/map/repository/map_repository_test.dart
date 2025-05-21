import 'package:flutter_test/flutter_test.dart';
import 'package:dio/dio.dart';
import 'package:mobile_v3/app/core/api_client.dart';
import 'package:mobile_v3/app/core/exceptions.dart';
import 'package:mobile_v3/app/map/model/map_data.dart';
import 'package:mobile_v3/app/map/repository/map_repository.dart';

class FakeApiClient implements ApiClient {
  final Future<Response> Function(String path) getHandler;
  final Future<Response> Function(String path, {dynamic data}) postHandler;
  final Future<Response> Function(String path, {dynamic data}) putHandler;
  final Future<Response> Function(String path) deleteHandler;

  FakeApiClient({
    required this.getHandler,
    required this.postHandler,
    required this.putHandler,
    required this.deleteHandler,
  });

  @override
  Future<Response> get(String path) => getHandler(path);

  @override
  Future<Response> post(String path, {dynamic data}) => postHandler(path, data: data);

  @override
  Future<Response> put(String path, {dynamic data}) => putHandler(path, data: data);

  @override
  Future<Response> delete(String path) => deleteHandler(path);
}

Response makeResponse(int statusCode, dynamic data) {
  return Response(
    requestOptions: RequestOptions(path: ''),
    statusCode: statusCode,
    data: data,
  );
}

void main() {
  group('MapRepository.fetchMaps', () {
    test('returns a list of MapData on HTTP 200', () async {
      final fakeJson = [
        {'id': '1', 'name': 'One'},
        {'id': '2', 'name': 'Two'},
      ];
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => makeResponse(200, fakeJson),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      final result = await repository.fetchMaps();
      expect(result, hasLength(2));
      expect(result[0].id, '1');
      expect(result[0].name, 'One');
    });

    test('returns an empty list on HTTP 200 with empty payload', () async {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => makeResponse(200, []),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      final result = await repository.fetchMaps();
      expect(result, isEmpty);
    });

    test('throws ApiException on non-200 status', () {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => makeResponse(500, {}),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      expect(repository.fetchMaps(), throwsA(isA<ApiException>()));
    });
  });

  group('MapRepository.fetchMapById', () {
    test('returns MapData on HTTP 200', () async {
      final fakeJson = {'id': '42', 'name': 'The Answer'};
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => makeResponse(200, fakeJson),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      final result = await repository.fetchMapById('42');
      expect(result.id, '42');
      expect(result.name, 'The Answer');
    });

    test('throws NotFoundException on HTTP 404', () {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => makeResponse(404, {}),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      expect(repository.fetchMapById('unknown'), throwsA(isA<NotFoundException>()));
    });

    test('throws ApiException on other non-200/404 status', () {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => makeResponse(500, {}),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      expect(repository.fetchMapById('error'), throwsA(isA<ApiException>()));
    });
  });

  group('MapRepository.createMap', () {
    test('completes without error on HTTP 201', () async {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => throw UnimplementedError(),
        postHandler: (_, {data}) async => makeResponse(201, {}),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      await repository.createMap(MapData(id: '1', name: 'New'));
    });

    test('throws ApiException on non-201 status', () {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => throw UnimplementedError(),
        postHandler: (_, {data}) async => makeResponse(400, {}),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      expect(repository.createMap(MapData(id: '1', name: 'New')), throwsA(isA<ApiException>()));
    });
  });

  group('MapRepository.updateMap', () {
    test('completes without error on HTTP 200', () async {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => throw UnimplementedError(),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (path, {data}) async => makeResponse(200, {}),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      await repository.updateMap('1', MapData(id: '1', name: 'Updated'));
    });

    test('throws ApiException on non-200 status', () {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => throw UnimplementedError(),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (path, {data}) async => makeResponse(404, {}),
        deleteHandler: (_) async => throw UnimplementedError(),
      ));
      expect(repository.updateMap('1', MapData(id: '1', name: 'Updated')), throwsA(isA<ApiException>()));
    });
  });

  group('MapRepository.deleteMap', () {
    test('completes without error on HTTP 204', () async {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => throw UnimplementedError(),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => makeResponse(204, {}),
      ));
      await repository.deleteMap('1');
    });

    test('throws ApiException on non-204 status', () {
      final repository = MapRepository(FakeApiClient(
        getHandler: (_) async => throw UnimplementedError(),
        postHandler: (_, {data}) async => throw UnimplementedError(),
        putHandler: (_, {data}) async => throw UnimplementedError(),
        deleteHandler: (_) async => makeResponse(500, {}),
      ));
      expect(repository.deleteMap('1'), throwsA(isA<ApiException>()));
    });
  });
}