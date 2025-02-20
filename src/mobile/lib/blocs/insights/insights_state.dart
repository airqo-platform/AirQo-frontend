part of 'insights_bloc.dart';

class InsightsState extends Equatable {
  const InsightsState(
     {
    required this.name,
    this.insights = const [],
    required this.selectedInsight,
  });

  InsightsState copyWith({
    String? name,
    Insight? selectedInsight,
    List<Insight>? insights,
  }) {
    return InsightsState(
      name: name ?? this.name,
      insights: insights ?? this.insights,
      selectedInsight: selectedInsight ?? this.selectedInsight,
    );
  }

  final Insight selectedInsight;
  final String name;
  final List<Insight> insights;

  @override
  List<Object?> get props => [
        selectedInsight,
        insights.map((e) => e.forecastPm2_5).toList(),
      ];
}
