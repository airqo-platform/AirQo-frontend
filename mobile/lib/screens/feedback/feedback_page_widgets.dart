import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

class FeedbackStartButton extends StatelessWidget {
  const FeedbackStartButton({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FeedbackBloc, FeedbackState>(
      builder: (context, state) {
        final Color buttonColor = state.feedbackType == FeedbackType.none
            ? CustomColors.appColorBlue.withOpacity(0.24)
            : CustomColors.appColorBlue;

        return GestureDetector(
          onTap: () {
            context.read<FeedbackBloc>().add(const GoToChannelStep());
          },
          child: Container(
            height: 48,
            padding: const EdgeInsets.all(13),
            decoration: BoxDecoration(
              color: buttonColor,
              borderRadius: const BorderRadius.all(
                Radius.circular(8.0),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Spacer(),
                const Text(
                  'Next',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(
                  width: 11,
                ),
                SvgPicture.asset(
                  'assets/icon/next_arrow.svg',
                  height: 17.42,
                  width: 10.9,
                  color: Colors.white,
                ),
                const Spacer(),
              ],
            ),
          ),
        );
      },
    );
  }
}

class FeedbackBackButton extends StatelessWidget {
  const FeedbackBackButton({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FeedbackBloc, FeedbackState>(
      builder: (context, state) {
        if (state.step == FeedbackStep.typeStep) {
          return Container();
        }

        return GestureDetector(
          onTap: () {
            switch (state.step) {
              case FeedbackStep.typeStep:
                break;
              case FeedbackStep.channelStep:
                context.read<FeedbackBloc>().add(
                      const GoToTypeStep(),
                    );
                break;
              case FeedbackStep.formStep:
                context.read<FeedbackBloc>().add(
                      const GoToChannelStep(),
                    );
                break;
            }
          },
          child: FeedbackNavigationButton(
            text: 'Back',
            buttonColor: CustomColors.appColorBlue.withOpacity(0.1),
            textColor: CustomColors.appColorBlue,
          ),
        );
      },
    );
  }
}

class FeedbackNextButton extends StatelessWidget {
  const FeedbackNextButton({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FeedbackBloc, FeedbackState>(
      builder: (context, state) {
        Color buttonColor = CustomColors.appColorBlue;
        String buttonText = 'Next';
        String? svg = 'assets/icon/next_arrow.svg';

        switch (state.step) {
          case FeedbackStep.typeStep:
            if (state.feedbackType == FeedbackType.none) {
              buttonColor = CustomColors.appColorBlue.withOpacity(0.24);
            }
            break;
          case FeedbackStep.channelStep:
            if (state.feedbackChannel == FeedbackChannel.none ||
                !state.emailAddress.isValidEmail()) {
              buttonColor = CustomColors.appColorBlue.withOpacity(0.24);
            }
            break;
          case FeedbackStep.formStep:
            buttonText = 'Send';
            svg = null;
            if (state.feedback.isEmpty) {
              buttonColor = CustomColors.appColorBlue.withOpacity(0.24);
            }
            break;
        }

        return GestureDetector(
          onTap: () {
            switch (state.step) {
              case FeedbackStep.typeStep:
                context.read<FeedbackBloc>().add(
                      const GoToChannelStep(),
                    );
                break;
              case FeedbackStep.channelStep:
                context.read<FeedbackBloc>().add(
                      const GoToFormStep(),
                    );
                break;
              case FeedbackStep.formStep:
                context.read<FeedbackBloc>().add(
                      const SubmitFeedback(),
                    );
                break;
            }
          },
          child: FeedbackNavigationButton(
            text: buttonText,
            buttonColor: buttonColor,
            svg: svg,
            textColor: Colors.white,
          ),
        );
      },
    );
  }
}

class FeedbackProgressBar extends StatelessWidget {
  const FeedbackProgressBar({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FeedbackBloc, FeedbackState>(
      builder: (context, state) {
        return Row(
          children: [
            Container(
              height: 16,
              width: 16,
              decoration: BoxDecoration(
                color: state.feedbackType == FeedbackType.none
                    ? CustomColors.greyColor
                    : CustomColors.appColorBlue,
                shape: BoxShape.circle,
              ),
            ),
            Expanded(
              child: Divider(
                thickness: 2,
                color: state.step != FeedbackStep.typeStep
                    ? CustomColors.appColorBlue
                    : CustomColors.greyColor,
              ),
            ),
            Container(
              height: 16,
              width: 16,
              decoration: BoxDecoration(
                color: state.feedbackChannel != FeedbackChannel.none &&
                            state.emailAddress.isValidEmail() &&
                            state.step == FeedbackStep.channelStep ||
                        state.step == FeedbackStep.formStep
                    ? CustomColors.appColorBlue
                    : CustomColors.greyColor,
                shape: BoxShape.circle,
              ),
            ),
            Expanded(
              child: Divider(
                thickness: 2,
                color: state.step == FeedbackStep.formStep
                    ? CustomColors.appColorBlue
                    : CustomColors.greyColor,
              ),
            ),
            Container(
              height: 16,
              width: 16,
              decoration: BoxDecoration(
                color: state.feedback.isNotEmpty &&
                        state.step == FeedbackStep.formStep
                    ? CustomColors.appColorBlue
                    : CustomColors.greyColor,
                shape: BoxShape.circle,
              ),
            ),
          ],
        );
      },
    );
  }
}

class FeedbackCard extends StatelessWidget {
  const FeedbackCard({
    super.key,
    required this.active,
    required this.title,
  });

  final bool active;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      height: 56,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Row(
        children: [
          Container(
            height: 24,
            width: 24,
            decoration: BoxDecoration(
              color: active ? CustomColors.appColorBlue : Colors.white,
              shape: BoxShape.circle,
              border: active
                  ? Border.fromBorderSide(
                      BorderSide(
                        color: CustomColors.appColorBlue,
                        width: 0,
                      ),
                    )
                  : Border.fromBorderSide(
                      BorderSide(
                        color: CustomColors.greyColor,
                        width: 3,
                      ),
                    ),
            ),
          ),
          const SizedBox(
            width: 16,
          ),
          Text(
            title,
            style: Theme.of(context).textTheme.bodyText1,
          ),
        ],
      ),
    );
  }
}

class FeedbackForm extends StatelessWidget {
  const FeedbackForm({super.key});
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Go Ahead, Tell Us More?',
          style: CustomTextStyle.headline9(context),
        ),
        const SizedBox(
          height: 16,
        ),
        BlocBuilder<FeedbackBloc, FeedbackState>(
          builder: (context, state) {
            return Container(
              height: 255,
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: 15),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(
                  Radius.circular(8.0),
                ),
                border: Border.fromBorderSide(
                  BorderSide(color: Colors.white),
                ),
              ),
              child: Center(
                child: TextFormField(
                  initialValue: state.feedback,
                  style: Theme.of(context).textTheme.bodyText2,
                  enableSuggestions: false,
                  cursorWidth: 1,
                  maxLines: 12,
                  cursorColor: CustomColors.appColorBlue,
                  keyboardType: TextInputType.text,
                  onChanged: (String feedback) {
                    context.read<FeedbackBloc>().add(
                          SetFeedback(feedback),
                        );
                  },
                  onFieldSubmitted: (String feedback) {
                    context.read<FeedbackBloc>().add(
                          SetFeedback(feedback),
                        );
                  },
                  decoration: InputDecoration(
                    focusedBorder: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    hintText: 'Please tell us the details',
                    hintStyle: Theme.of(context).textTheme.bodyText2?.copyWith(
                          color: CustomColors.appColorBlack.withOpacity(0.32),
                        ),
                    counterStyle: Theme.of(context).textTheme.bodyText2,
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class FeedbackNavigationButton extends StatelessWidget {
  const FeedbackNavigationButton({
    super.key,
    required this.text,
    required this.buttonColor,
    required this.textColor,
    this.svg,
  });

  final Color buttonColor;
  final Color textColor;
  final String text;
  final String? svg;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 120,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: buttonColor,
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: textColor,
              fontSize: 14,
            ),
          ),
          Visibility(
            visible: svg != null,
            child: const SizedBox(
              width: 11,
            ),
          ),
          Visibility(
            visible: svg != null,
            child: SvgPicture.asset(
              svg ?? 'assets/icon/next_arrow.svg',
              height: 17.42,
              width: 10.9,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}

class FeedbackTypeStep extends StatelessWidget {
  const FeedbackTypeStep({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FeedbackBloc, FeedbackState>(builder: (context, state) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'What Type Of Feedback?',
            style: CustomTextStyle.headline9(context),
          ),
          const SizedBox(
            height: 16,
          ),
          GestureDetector(
            onTap: () {
              _updateType(context, FeedbackType.reportAirPollution);
            },
            child: FeedbackCard(
              title: FeedbackType.reportAirPollution.toString(),
              active: state.feedbackType == FeedbackType.reportAirPollution,
            ),
          ),
          const SizedBox(
            height: 4,
          ),
          GestureDetector(
            onTap: () {
              _updateType(context, FeedbackType.inquiry);
            },
            child: FeedbackCard(
              title: FeedbackType.inquiry.toString(),
              active: state.feedbackType == FeedbackType.inquiry,
            ),
          ),
          const SizedBox(
            height: 4,
          ),
          GestureDetector(
            onTap: () {
              _updateType(context, FeedbackType.suggestion);
            },
            child: FeedbackCard(
              title: FeedbackType.suggestion.toString(),
              active: state.feedbackType == FeedbackType.suggestion,
            ),
          ),
          const SizedBox(
            height: 4,
          ),
          GestureDetector(
            onTap: () {
              _updateType(context, FeedbackType.appBugs);
            },
            child: FeedbackCard(
              title: FeedbackType.appBugs.toString(),
              active: state.feedbackType == FeedbackType.appBugs,
            ),
          ),
        ],
      );
    });
  }

  void _updateType(BuildContext context, FeedbackType feedbackType) {
    context.read<FeedbackBloc>().add(
          SetFeedbackType(feedbackType),
        );
  }
}

class FeedbackChannelStep extends StatelessWidget {
  const FeedbackChannelStep({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Send Us Feedback Via Email',
          style: CustomTextStyle.headline9(context),
        ),
        const SizedBox(
          height: 16,
        ),
        BlocBuilder<FeedbackBloc, FeedbackState>(builder: (context, state) {
          return GestureDetector(
            onTap: () {
              context.read<FeedbackBloc>().add(
                    const SetFeedbackChannel(FeedbackChannel.email),
                  );
            },
            child: FeedbackCard(
              title: FeedbackChannel.email.toString(),
              active: state.feedbackChannel == FeedbackChannel.email,
            ),
          );
        }),
        const SizedBox(
          height: 4,
        ),
        BlocBuilder<FeedbackBloc, FeedbackState>(builder: (context, state) {
          return Visibility(
            visible: state.feedbackChannel == FeedbackChannel.email,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(
                  Radius.circular(8.0),
                ),
                border: Border.fromBorderSide(
                  BorderSide(color: Colors.white),
                ),
              ),
              child: TextFormField(
                initialValue: state.emailAddress,
                onFieldSubmitted: (String email) {
                  context.read<FeedbackBloc>().add(
                        SetFeedbackContact(email),
                      );
                },
                style: Theme.of(context).textTheme.bodyText1,
                enableSuggestions: true,
                cursorWidth: 1,
                autofocus: false,
                onChanged: (String email) {
                  context.read<FeedbackBloc>().add(
                        SetFeedbackContact(email),
                      );
                },
                cursorColor: CustomColors.appColorBlue,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
                  fillColor: Colors.white,
                  focusedBorder: OutlineInputBorder(
                    borderSide:
                        const BorderSide(color: Colors.white, width: 1.0),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderSide:
                        const BorderSide(color: Colors.white, width: 1.0),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  border: OutlineInputBorder(
                    borderSide:
                        const BorderSide(color: Colors.white, width: 1.0),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  hintText: 'Enter your email',
                  hintStyle: Theme.of(context).textTheme.bodyText1?.copyWith(
                        color: CustomColors.appColorBlack.withOpacity(0.32),
                      ),
                  prefixStyle: Theme.of(context).textTheme.bodyText1?.copyWith(
                        color: CustomColors.appColorBlack.withOpacity(0.32),
                      ),
                  errorStyle: const TextStyle(
                    fontSize: 0,
                  ),
                ),
              ),
            ),
          );
        }),
        const SizedBox(
          height: 16,
        ),
      ],
    );
  }
}
