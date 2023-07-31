import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

Future<bool> displayRatingDialog(BuildContext context) async {
  DateTime lastRated = context.read<ProfileBloc>().state.lastRated;

  if (lastRated.add(const Duration(days: 180)).isAfter(DateTime.now())) {
    return false;
  }

  List<SearchHistory> searchHistory =
      context.read<SearchHistoryBloc>().state.history;
  if (searchHistory.length >= 5) {
    return true;
  }

  List<FavouritePlace> favouritePlaces =
      context.read<FavouritePlaceBloc>().state;
  if (favouritePlaces.length >= 5) {
    return true;
  }

  List<KyaLesson> completeKya = context
      .read<KyaBloc>()
      .state
      .lessons
      .where((kya) => kya.status == KyaLessonStatus.complete)
      .toList();
  if (completeKya.length >= 5) {
    return true;
  }

  return false;
}
