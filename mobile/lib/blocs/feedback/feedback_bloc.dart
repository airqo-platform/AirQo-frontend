import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../models/enum_constants.dart';

part 'feedback_event.dart';
part 'feedback_state.dart';

class FeedbackBloc extends Bloc<FeedbackEvent, FeedbackState> {
  FeedbackBloc()
      : super(
          const FeedbackState(
            feedbackType: FeedbackType.none,
            feedbackChannel: FeedbackChannel.none,
            contact: '',
            feedback: '',
            loading: false,
          ),
        ) {
    on<SetFeedbackType>(_onSetFeedbackType);
    on<SetFeedbackContact>(_onSetFeedbackContact);
    on<GoToTypeStep>(_onGoToTypeStep);
    on<GoToChannelStep>(_onGoToChannelStep);
    on<GoToFormStep>(_onGoToFormStep);
    on<SetFeedbackChannel>(_onSetFeedbackChannel);
    on<FeedbackFormError>(_onFeedbackFormError);
    on<SetFeedback>(_onSetFeedback);
    on<ClearFeedback>(_onClearFeedback);
  }

  void _onFeedbackFormError(
    FeedbackFormError event,
    Emitter<FeedbackState> emit,
  ) {
    emit(
      FeedbackLoadingState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: true,
      ),
    );

    return emit(
      FeedbackErrorState(
        event.error,
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: false,
      ),
    );
  }

  void _onGoToTypeStep(
    GoToTypeStep event,
    Emitter<FeedbackState> emit,
  ) {
    emit(
      FeedbackLoadingState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: true,
      ),
    );

    return emit(
      FeedbackTypeState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: false,
      ),
    );
  }

  void _onGoToChannelStep(
    GoToChannelStep event,
    Emitter<FeedbackState> emit,
  ) {
    emit(
      FeedbackLoadingState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: true,
      ),
    );

    return emit(
      FeedbackChannelState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: false,
      ),
    );
  }

  void _onGoToFormStep(
    GoToFormStep event,
    Emitter<FeedbackState> emit,
  ) {
    emit(
      FeedbackLoadingState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: true,
      ),
    );

    return emit(
      FeedbackFormState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: false,
      ),
    );
  }

  void _onClearFeedback(
    ClearFeedback event,
    Emitter<FeedbackState> emit,
  ) {
    return emit(
      const FeedbackTypeState(
        feedbackType: FeedbackType.none,
        feedbackChannel: FeedbackChannel.none,
        contact: '',
        feedback: '',
        loading: false,
      ),
    );
  }

  void _onSetFeedback(
    SetFeedback event,
    Emitter<FeedbackState> emit,
  ) {
    emit(
      FeedbackLoadingState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: true,
      ),
    );

    return emit(
      FeedbackFormState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: event.feedback,
        loading: false,
      ),
    );
  }

  void _onSetFeedbackContact(
    SetFeedbackContact event,
    Emitter<FeedbackState> emit,
  ) {
    emit(
      FeedbackLoadingState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: true,
      ),
    );

    return emit(
      FeedbackChannelState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: event.contact,
        feedback: state.feedback,
        loading: false,
      ),
    );
  }

  void _onSetFeedbackType(
    SetFeedbackType event,
    Emitter<FeedbackState> emit,
  ) {
    emit(
      FeedbackLoadingState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: true,
      ),
    );

    return emit(
      FeedbackTypeState(
        feedbackType: event.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: false,
      ),
    );
  }

  void _onSetFeedbackChannel(
    SetFeedbackChannel event,
    Emitter<FeedbackState> emit,
  ) {
    emit(
      FeedbackLoadingState(
        feedbackType: state.feedbackType,
        feedbackChannel: state.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: true,
      ),
    );

    return emit(
      FeedbackChannelState(
        feedbackType: state.feedbackType,
        feedbackChannel: event.feedbackChannel,
        contact: state.contact,
        feedback: state.feedback,
        loading: false,
      ),
    );
  }
}
