import 'package:app/blocs/blocs.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import 'feedback_page_widgets.dart';

class FeedbackPage extends StatefulWidget {
  const FeedbackPage({super.key});

  @override
  State<FeedbackPage> createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: const AppTopBar('Send Feedback'),
      body: Container(
        padding: const EdgeInsets.only(left: 16, right: 16),
        color: CustomColors.appBodyColor,
        child: Column(
          children: [
            const SizedBox(
              height: 27,
            ),
            const FeedbackProgressBar(),
            const SizedBox(
              height: 27,
            ),
            BlocConsumer<FeedbackBloc, FeedbackState>(
              listenWhen: (previous, current) {
                return current is FeedbackErrorState;
              },
              listener: (context, state) {
                if (state is FeedbackErrorState) {
                  showSnackBar(context, state.error);
                }
              },
              buildWhen: (previous, current) {
                if (current is FeedbackErrorState) {
                  return false;
                }

                return previous is FeedbackLoadingState;
              },
              builder: (context, state) {
                if (state is FeedbackChannelState) {
                  return const FeedbackChannelStep();
                }

                if (state is FeedbackFormState) {
                  return const FeedbackForm();
                }

                return const FeedbackTypeStep();
              },
            ),
            const Spacer(),
            const FeedbackNavigationButtons(),
            const SizedBox(
              height: 37,
            ),
          ],
        ),
      ),
    );
  }
}
