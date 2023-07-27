part of 'kya_bloc.dart';

@JsonSerializable()
class KyaState extends Equatable {
  const KyaState({required this.lessons});

  factory KyaState.fromJson(Map<String, dynamic> json) =>
      _$KyaStateFromJson(json);

  Map<String, dynamic> toJson() => _$KyaStateToJson(this);

  KyaState copyWith({List<KyaLesson>? lessons}) => KyaState(
        lessons: lessons ?? this.lessons,
      );

  final List<KyaLesson> lessons;

  @override
  List<Object> get props {
    List<String> props = lessons.map((e) => e.activeTask.toString()).toList();
    props.addAll(lessons.map((e) => e.id).toList());
    props.addAll(lessons.map((e) => e.tasks.length.toString()).toList());
    props.addAll(lessons.map((e) => e.status.toString()).toList());
    props.add(lessons.length.toString());
    return props;
  }
}
