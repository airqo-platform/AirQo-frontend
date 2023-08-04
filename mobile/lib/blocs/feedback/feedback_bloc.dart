import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import 'package:flutter_bloc/flutter_bloc.dart';

part 'feedback_event.dart';
part 'feedback_state.dart';


class FeedbackBloc extends Bloc<FeedbackEvent, FeedbackState> {
  FeedbackBloc() : super(const FeedbackState.initial()) {
    on<InitializeFeedback>(_onInitializeFeedback);
    on<SetFeedbackType>(_onSetFeedbackType);
    on<GoToChannelStep>(_onGoToChannelStep);
    on<GoToFormStep>(_onGoToFormStep);
    on<SubmitFeedback>(_onSubmitFeedback);
    on<GoToTypeStep>(_onGoToTypeStep);
    on<SetFeedbackContact>(_onSetFeedbackContact);
    on<SetFeedback>(_onSetFeedback);
    on<SetFeedbackChannel>(_onSetFeedbackChannel);
  }

  void _onInitializeFeedback(
    InitializeFeedback event,
    Emitter<FeedbackState> emit,
  ) {
    if (state.blocStatus == FeedbackStateStatus.success) {
      return emit(
        const FeedbackState.initial().copyWith(
          emailAddress: event.profile.emailAddress,
          feedbackChannel: FeedbackChannel.email,
        ),
      );
    }

    return emit(
      state.copyWith(
        emailAddress: event.profile.emailAddress,
        feedbackChannel: FeedbackChannel.email,
      ),
    );
  }

  Future<void> _onSubmitFeedback(
    SubmitFeedback _,
    Emitter<FeedbackState> emit,
  ) async {
    _onClearErrors(emit);

    if (state.feedback.isEmpty) {
      return emit(
        state.copyWith(
          blocStatus: FeedbackStateStatus.error,
          errorMessage: 'Please type your message.',
        ),
      );
    }

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(
        state.copyWith(
          blocStatus: FeedbackStateStatus.error,
          errorMessage: FirebaseAuthError.noInternetConnection.message,
        ),
      );
    }

    emit(state.copyWith(blocStatus: FeedbackStateStatus.processing));

    final bool success = await AirqoApiClient().sendFeedback(
      UserFeedback(
        contactDetails: state.emailAddress,
        message: state.feedback,
        feedbackType: state.feedbackType,
      ),
    );

    return emit(
      state.copyWith(
        blocStatus:
            success ? FeedbackStateStatus.success : FeedbackStateStatus.error,
        errorMessage:
            success ? '' : 'Failed to submit feedback. Try again later.',
      ),
    );
  }

  void _onGoToChannelStep(
    GoToChannelStep _,
    Emitter<FeedbackState> emit,
  ) {
    _onClearErrors(emit);

    if (state.feedbackType == FeedbackType.none) {
      return emit(
        state.copyWith(
          blocStatus: FeedbackStateStatus.error,
          errorMessage: 'Please select a feedback type.',
        ),
      );
    }

    return emit(state.copyWith(step: FeedbackStep.channelStep));
  }

  void _onGoToFormStep(
    GoToFormStep _,
    Emitter<FeedbackState> emit,
  ) {
    _onClearErrors(emit);

    if (state.feedbackChannel == FeedbackChannel.none) {
      return emit(
        state.copyWith(
          blocStatus: FeedbackStateStatus.error,
          errorMessage: 'Please select a communication channel.',
        ),
      );
    }

    if (!state.emailAddress.isValidEmail()) {
      return emit(
        state.copyWith(
          blocStatus: FeedbackStateStatus.error,
          errorMessage: FirebaseAuthError.invalidEmailAddress.message,
        ),
      );
    }

    return emit(state.copyWith(step: FeedbackStep.formStep));
  }

  void _onGoToTypeStep(
    GoToTypeStep _,
    Emitter<FeedbackState> emit,
  ) {
    _onClearErrors(emit);

    return emit(
      state.copyWith(step: FeedbackStep.typeStep),
    );
  }

  void _onSetFeedbackContact(
    SetFeedbackContact event,
    Emitter<FeedbackState> emit,
  ) {
    _onClearErrors(emit);

    return emit(
      state.copyWith(emailAddress: event.contact),
    );
  }

  void _onSetFeedbackType(SetFeedbackType event, Emitter<FeedbackState> emit) {
    _onClearErrors(emit);

    return emit(state.copyWith(feedbackType: event.feedbackType));
  }

  void _onSetFeedback(SetFeedback event, Emitter<FeedbackState> emit) {
    _onClearErrors(emit);

    return emit(
      state.copyWith(feedback: event.feedback),
    );
  }

  void _onClearErrors(Emitter<FeedbackState> emit) {
    emit(
      state.copyWith(
        blocStatus: FeedbackStateStatus.initial,
        errorMessage: '',
      ),
    );
  }

  void _onSetFeedbackChannel(
    SetFeedbackChannel event,
    Emitter<FeedbackState> emit,
  ) {
    _onClearErrors(emit);

    return emit(
      state.copyWith(feedbackChannel: event.feedbackChannel),
    );
  }
}
