part of 'feedback_bloc.dart';

class FeedbackState extends Equatable {
  const FeedbackState(
      {required this.feedbackType,
      required this.feedbackChannel,
      required this.contact,
      required this.feedback,
      required this.loading});

  final FeedbackType feedbackType;
  final FeedbackChannel feedbackChannel;
  final String contact;
  final String feedback;
  final bool loading;

  @override
  List<Object> get props => [];
}

class FeedbackTypeState extends FeedbackState {
  const FeedbackTypeState(
      {required super.feedbackType,
      required super.feedbackChannel,
      required super.contact,
      required super.feedback,
      required super.loading});

  @override
  List<Object> get props => [];
}

class FeedbackSubmissionState extends FeedbackState {
  const FeedbackSubmissionState(
      {required super.feedbackType,
      required super.feedbackChannel,
      required super.contact,
      required super.feedback,
      required super.loading});

  @override
  List<Object> get props => [];
}

class FeedbackErrorState extends FeedbackState {
  const FeedbackErrorState(this.error,
      {required super.feedbackType,
      required super.feedbackChannel,
      required super.contact,
      required super.feedback,
      required super.loading});

  final String error;

  @override
  List<Object> get props => [];
}

class FeedbackFormState extends FeedbackState {
  const FeedbackFormState(
      {required super.feedbackType,
      required super.feedbackChannel,
      required super.contact,
      required super.feedback,
      required super.loading});

  @override
  List<Object> get props => [];
}

class FeedbackChannelState extends FeedbackState {
  const FeedbackChannelState(
      {required super.feedbackType,
      required super.feedbackChannel,
      required super.contact,
      required super.feedback,
      required super.loading});

  @override
  List<Object> get props => [];
}

class FeedbackLoadingState extends FeedbackState {
  const FeedbackLoadingState(
      {required super.feedbackType,
      required super.feedbackChannel,
      required super.contact,
      required super.feedback,
      required super.loading});

  @override
  List<Object> get props => [];
}
