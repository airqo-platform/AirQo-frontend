part of 'feedback_bloc.dart';

abstract class FeedbackEvent extends Equatable {
  const FeedbackEvent();
}

class InitializeFeedback extends FeedbackEvent {
  const InitializeFeedback();

  @override
  List<Object?> get props => [];
}

class SetFeedbackType extends FeedbackEvent {
  const SetFeedbackType(this.feedbackType);

  final FeedbackType feedbackType;

  @override
  List<Object?> get props => [];
}

class GoToTypeStep extends FeedbackEvent {
  const GoToTypeStep();

  @override
  List<Object?> get props => [];
}

class GoToFormStep extends FeedbackEvent {
  const GoToFormStep();

  @override
  List<Object?> get props => [];
}

class SubmitFeedback extends FeedbackEvent {
  const SubmitFeedback();

  @override
  List<Object?> get props => [];
}

class GoToChannelStep extends FeedbackEvent {
  const GoToChannelStep();

  @override
  List<Object?> get props => [];
}

class SetFeedbackContact extends FeedbackEvent {
  const SetFeedbackContact(this.contact);

  final String contact;

  @override
  List<Object?> get props => [];
}

class SetFeedback extends FeedbackEvent {
  const SetFeedback(this.feedback);
  final String feedback;

  @override
  List<Object?> get props => [];
}

class SetFeedbackChannel extends FeedbackEvent {
  const SetFeedbackChannel(this.feedbackChannel);

  final FeedbackChannel feedbackChannel;

  @override
  List<Object?> get props => [];
}
