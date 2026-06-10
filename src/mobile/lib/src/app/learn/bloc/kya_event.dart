part of 'kya_bloc.dart';


abstract class KyaEvent extends Equatable {
  const KyaEvent();

  @override
  List<Object?> get props => [];
}

class LoadLessons extends KyaEvent {
  final bool forceRefresh;
  
  const LoadLessons({this.forceRefresh = false});
  
  @override
  List<Object?> get props => [forceRefresh];
}

class RefreshLessons extends KyaEvent {
  final LessonResponseModel? currentModel;
  
  const RefreshLessons({this.currentModel});
  
  @override
  List<Object?> get props => [currentModel];
}