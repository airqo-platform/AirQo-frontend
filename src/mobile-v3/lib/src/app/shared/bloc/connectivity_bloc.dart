import 'dart:async';
import 'dart:io' show InternetAddress;
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:loggy/loggy.dart';

part 'connectivity_event.dart';
part 'connectivity_state.dart';

class ConnectivityBloc extends Bloc<ConnectivityEvent, ConnectivityState> {
  final Connectivity _connectivity;
  StreamSubscription? _connectivitySubscription;
  Timer? _resetDismissTimer;

  ConnectivityBloc(this._connectivity) : super(ConnectivityInitial()) {
    _checkInitialConnectivity();

    _connectivitySubscription =
        _connectivity.onConnectivityChanged.listen((result) async {
      logDebug('Connectivity changed: $result');
      final isConnected =
          result != ConnectivityResult.none && await _hasInternetConnection();
      add(ConnectivityChanged(isConnected));
    });

    on<ConnectivityChanged>((event, emit) {
      if (event.isConnected) {
        logInfo('Emitting ConnectivityOnline');
        emit(ConnectivityOnline());
      } else {
        final reappeared = state is ConnectivityOffline &&
            (state as ConnectivityOffline).isDismissed;
        logInfo(
            'Emitting ConnectivityOffline(isDismissed: false, reappeared: $reappeared)');
        emit(ConnectivityOffline(isDismissed: false, reappeared: reappeared));
      }
    });

    on<ConnectivityCheckRequested>((event, emit) async {
      var connectivityResult = await _connectivity.checkConnectivity();
      logDebug('Connectivity check result: $connectivityResult');
      bool isConnected = connectivityResult != ConnectivityResult.none &&
          await _hasInternetConnection();
      if (isConnected) {
        logInfo('Emitting ConnectivityOnline');
        emit(ConnectivityOnline());
      } else {
        final reappeared = state is ConnectivityOffline &&
            (state as ConnectivityOffline).isDismissed;
        logInfo(
            'Emitting ConnectivityOffline(isDismissed: false, reappeared: $reappeared)');
        emit(ConnectivityOffline(isDismissed: false, reappeared: reappeared));
      }
    });

    on<ConnectivityBannerDismissed>((event, emit) {
      if (state is ConnectivityOffline) {
        logInfo('Banner dismissed, starting 5-minute timer');
        emit(const ConnectivityOffline(isDismissed: true, reappeared: false));
        _resetDismissTimer?.cancel();
        _resetDismissTimer = Timer(const Duration(minutes: 5), () {
          logInfo('Timer expired, re-checking connectivity');
          add(ConnectivityCheckRequested());
        });
      }
    });
  }

  Future<bool> _hasInternetConnection() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  Future<void> _checkInitialConnectivity() async {
    try {
      var connectivityResult = await _connectivity.checkConnectivity();
      logDebug('Initial connectivity check result: $connectivityResult');
      bool isConnected = connectivityResult != ConnectivityResult.none &&
          await _hasInternetConnection();
      add(ConnectivityChanged(isConnected));
    } catch (_) {
      add(ConnectivityChanged(false));
    }
  }

  @override
  Future<void> close() {
    _connectivitySubscription?.cancel();
    _resetDismissTimer?.cancel();
    return super.close();
  }
}
