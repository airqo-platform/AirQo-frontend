import 'dart:async';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'dart:io' show InternetAddress;

part 'connectivity_event.dart';
part 'connectivity_state.dart';

class ConnectivityBloc extends Bloc<ConnectivityEvent, ConnectivityState> {
  final Connectivity _connectivity;
  StreamSubscription? _connectivitySubscription;
  bool _bannerDismissed = false;
  bool get isBannerDismissed => _bannerDismissed;

  ConnectivityBloc(this._connectivity) : super(ConnectivityInitial()) {
    _checkInitialConnectivity();

    _connectivitySubscription =
        _connectivity.onConnectivityChanged.listen((result) {
      debugPrint('Connectivity changed: $result');
      add(ConnectivityChanged(result != ConnectivityResult.none));
    });

    on<ConnectivityChanged>((event, emit) {
      if (event.isConnected) {
        emit(ConnectivityOnline());
      } else {
        emit(ConnectivityOffline());
      }
    });
  }

  Future<bool> _hasInternetConnection() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  Future<void> _checkInitialConnectivity() async {
    try {
      var connectivityResult = await _connectivity.checkConnectivity();
      debugPrint('Initial connectivity check result: $connectivityResult');

      bool isConnected = connectivityResult != ConnectivityResult.none &&
          await _hasInternetConnection();
      add(ConnectivityChanged(isConnected));
    } catch (e) {
      add(ConnectivityChanged(false));
    }
  }

  @override
  Future<void> close() {
    _connectivitySubscription?.cancel();
    return super.close();
  }

  @override
  void onEvent(ConnectivityEvent event) {
    if (event is ConnectivityBannerDismissed) {
      _bannerDismissed = true;
    }
    super.onEvent(event);
  }

  Stream<ConnectivityState> mapEventToState(ConnectivityEvent event) async* {
    if (event is ConnectivityChanged) {
      yield event.isConnected ? ConnectivityOnline() : ConnectivityOffline();
    } else if (event is ConnectivityBannerDismissed) {
      _bannerDismissed = true;
      yield state;
    }
  }
}
