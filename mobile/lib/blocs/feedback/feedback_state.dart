part of 'feedback_bloc.dart';

enum FeedbackStatus {
  initial,
  processing,
  error,
  success,
}

class FeedbackState extends Equatable {
  const FeedbackState({
    this.feedbackType = FeedbackType.none,
    this.feedbackChannel = FeedbackChannel.none,
    this.emailAddress = '',
    this.feedback = '',
    this.step = FeedbackStep.typeStep,
    this.errorMessage = '',
    this.status = FeedbackStatus.initial,
  });

  FeedbackState copyWith({
    FeedbackType? feedbackType,
    FeedbackChannel? feedbackChannel,
    String? emailAddress,
    String? feedback,
    FeedbackStep? step,
    String? errorMessage,
    FeedbackStatus? status,
  }) {
    return FeedbackState(
      feedbackType: feedbackType ?? this.feedbackType,
      feedbackChannel: feedbackChannel ?? this.feedbackChannel,
      emailAddress: emailAddress ?? this.emailAddress,
      feedback: feedback ?? this.feedback,
      status: status ?? this.status,
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
  final FeedbackStatus status;

  @override
  List<Object> get props => [
        feedbackType,
        feedbackChannel,
        emailAddress,
        feedback,
        step,
        errorMessage,
        status,
      ];
}
