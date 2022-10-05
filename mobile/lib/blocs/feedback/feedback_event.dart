part of 'feedback_bloc.dart';

abstract class FeedbackEvent extends Equatable {
  const FeedbackEvent();
}

class ClearFeedback extends FeedbackEvent {
  const ClearFeedback();

  @override
  List<Object?> get props => ['clear feedback'];
}

class SetFeedbackType extends FeedbackEvent {
  const SetFeedbackType({required this.feedbackType});

  final FeedbackType feedbackType;

  @override
  List<Object?> get props => ['set feedback type'];
}

class GoToChannelStep extends FeedbackEvent {
  const GoToChannelStep();

  @override
  List<Object?> get props => ['go to channel'];
}

class GoToTypeStep extends FeedbackEvent {
  const GoToTypeStep();

  @override
  List<Object?> get props => ['go to type'];
}

class GoToFormStep extends FeedbackEvent {
  const GoToFormStep();

  @override
  List<Object?> get props => ['go to form'];
}

class FeedbackFormError extends FeedbackEvent {
  const FeedbackFormError(this.error);
  final String error;

  @override
  List<Object?> get props => ['feedback error'];
}

class SetFeedbackChannel extends FeedbackEvent {
  const SetFeedbackChannel({required this.feedbackChannel});

  final FeedbackChannel feedbackChannel;

  @override
  List<Object?> get props => ['feedback channel'];
}

class SetFeedbackContact extends FeedbackEvent {
  const SetFeedbackContact({required this.contact});

  final String contact;

  @override
  List<Object?> get props => ['feedback contact'];
}

class SetFeedback extends FeedbackEvent {
  const SetFeedback({required this.feedback});

  final String feedback;

  @override
  List<Object?> get props => ['set feedback'];
}
