import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/core/utils/app_loggy_setup.dart';

class LoggingBlocObserver extends BlocObserver {
  @override
  void onError(BlocBase bloc, Object error, StackTrace stackTrace) {
    super.onError(bloc, error, stackTrace);
    Object().logError('Bloc error in ${bloc.runtimeType}', error, stackTrace);
  }
}