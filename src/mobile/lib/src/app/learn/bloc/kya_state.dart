part of 'kya_bloc.dart';

abstract class KyaState extends Equatable {
  const KyaState();
  
  @override
  List<Object?> get props => [];
}

class KyaInitial extends KyaState {}

class LessonsLoading extends KyaState {}

class LessonsRefreshing extends KyaState {
  final LearnV2CatalogResponse? currentModel;

  const LessonsRefreshing({this.currentModel});

  @override
  List<Object?> get props => [currentModel];
}

class LessonsLoaded extends KyaState {
  final LearnV2CatalogResponse model;
  final bool fromCache;

  const LessonsLoaded(this.model, {this.fromCache = false});

  @override
  List<Object> get props => [model, fromCache];
}

class LessonsLoadingError extends KyaState {
  final String message;
  final LearnV2CatalogResponse? cachedModel;
  final bool isOffline;

  const LessonsLoadingError({
    required this.message,
    this.cachedModel,
    this.isOffline = false,
  });

  @override
  List<Object?> get props => [message, cachedModel, isOffline];
}