import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'feedback_page_widgets.dart';

class FeedbackPage extends StatelessWidget {
  const FeedbackPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: const AppTopBar('Send Feedback'),
      body: AppSafeArea(
        horizontalPadding: 16,
        verticalPadding: 20,
        widget: Column(
          children: [
            const FeedbackProgressBar(),
            const SizedBox(
              height: 27,
            ),
            MultiBlocListener(
              listeners: [
                BlocListener<FeedbackBloc, FeedbackState>(
                  listener: (context, _) {
                    loadingScreen(context);
                  },
                  listenWhen: (previous, current) {
                    return current.blocStatus == BlocStatus.processing;
                  },
                ),
                BlocListener<FeedbackBloc, FeedbackState>(
                  listener: (context, _) {
                    Navigator.pop(context);
                  },
                  listenWhen: (previous, current) {
                    return previous.blocStatus == BlocStatus.processing;
                  },
                ),
                BlocListener<FeedbackBloc, FeedbackState>(
                  listener: (context, state) {
                    showSnackBar(context, state.errorMessage);
                  },
                  listenWhen: (previous, current) {
                    return previous != current &&
                        current.blocStatus == BlocStatus.error &&
                        current.errorMessage.isNotEmpty;
                  },
                ),
                BlocListener<FeedbackBloc, FeedbackState>(
                  listener: (context, _) {
                    showSnackBar(context, 'Thanks for your feedback.');
                    context
                        .read<FeedbackBloc>()
                        .add(const InitializeFeedback());
                    Navigator.pop(context);
                  },
                  listenWhen: (previous, current) {
                    return current.blocStatus == BlocStatus.success;
                  },
                ),
              ],
              child: Container(),
            ),
            BlocBuilder<FeedbackBloc, FeedbackState>(
              buildWhen: (previous, current) {
                return previous.step != current.step;
              },
              builder: (context, state) {
                switch (state.step) {
                  case FeedbackStep.typeStep:
                    return const FeedbackTypeStep();
                  case FeedbackStep.channelStep:
                    return const FeedbackChannelStep();
                  case FeedbackStep.formStep:
                    return const FeedbackForm();
                }
              },
            ),
            const Spacer(),
            BlocBuilder<FeedbackBloc, FeedbackState>(
              buildWhen: (previous, current) {
                return previous.step != current.step;
              },
              builder: (context, state) {
                switch (state.step) {
                  case FeedbackStep.typeStep:
                    return const FeedbackStartButton();
                  case FeedbackStep.channelStep:
                  case FeedbackStep.formStep:
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        FeedbackBackButton(),
                        FeedbackNextButton(),
                      ],
                    );
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
