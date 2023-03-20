part of 'insights_bloc.dart';

class InsightsState extends Equatable {
  const InsightsState({
    this.insights = const [],
    this.selectedInsight,
  });

  InsightsState copyWith({
    Insight? selectedInsight,
    List<Insight>? insights,
  }) {
    return InsightsState(
      insights: insights ?? this.insights,
      selectedInsight: selectedInsight ?? this.selectedInsight,
    );
  }

  final Insight? selectedInsight;
  final List<Insight> insights;

  @override
  List<Object?> get props => [
        selectedInsight,
        insights,
      ];
}
