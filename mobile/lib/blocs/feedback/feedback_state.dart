part of 'feedback_bloc.dart';

class FeedbackState extends Equatable {
  const FeedbackState({
    required this.feedbackType,
    required this.feedbackChannel,
    required this.emailAddress,
    required this.feedback,
    required this.step,
    required this.errorMessage,
    required this.blocStatus,
  });

  const FeedbackState._({
    this.feedbackType = FeedbackType.none,
    this.feedbackChannel = FeedbackChannel.none,
    this.emailAddress = '',
    this.feedback = '',
    this.step = FeedbackStep.typeStep,
    this.errorMessage = '',
    this.blocStatus = BlocStatus.initial,
  });

  const FeedbackState.initial() : this._();

  FeedbackState copyWith({
    FeedbackType? feedbackType,
    FeedbackChannel? feedbackChannel,
    String? emailAddress,
    String? feedback,
    FeedbackStep? step,
    String? errorMessage,
    BlocStatus? blocStatus,
  }) {
    return FeedbackState(
      feedbackType: feedbackType ?? this.feedbackType,
      feedbackChannel: feedbackChannel ?? this.feedbackChannel,
      emailAddress: emailAddress ?? this.emailAddress,
      feedback: feedback ?? this.feedback,
      blocStatus: blocStatus ?? this.blocStatus,
      step: step ?? this.step,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  final FeedbackType feedbackType;
  final FeedbackChannel feedbackChannel;
  final String emailAddress;
  final String feedback;
  final FeedbackStep step;
  final String errorMessage;
  final BlocStatus blocStatus;

  @override
  List<Object> get props => [
        feedbackType,
        feedbackChannel,
        emailAddress,
        feedback,
        step,
        errorMessage,
        blocStatus,
      ];
}
