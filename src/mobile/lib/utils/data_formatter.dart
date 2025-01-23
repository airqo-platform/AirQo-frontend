import 'package:flutter_bloc/flutter_bloc.dart';
// ignore: depend_on_referenced_packages, required by EventTransformer
import 'package:stream_transform/stream_transform.dart';

EventTransformer<Event> debounce<Event>(Duration duration) {
  return (events, mapper) => events.debounce(duration).switchMap(mapper);
}
