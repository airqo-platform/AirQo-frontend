import 'package:app/models/enum_constants.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import '../../blocs/feedback/feedback_bloc.dart';
import '../../constants/config.dart';
import '../../models/feedback.dart';
import '../../services/rest_api.dart';
import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/buttons.dart';
import '../home_page.dart';

class FeedbackBackButton extends StatelessWidget {
  const FeedbackBackButton({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 120,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: CustomColors.appColorBlue.withOpacity(0.1),
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Back',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: CustomColors.appColorBlue,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

class FeedbackNextButton extends StatelessWidget {
  const FeedbackNextButton({
    super.key,
    required this.text,
    required this.buttonColor,
  });
  final String text;
  final Color buttonColor;

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
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
            ),
          ),
          const SizedBox(
            width: 11,
          ),
          SvgPicture.asset(
            'assets/icon/next_arrow.svg',
            semanticsLabel: 'Share',
            height: 17.42,
            width: 10.9,
          ),
        ],
      ),
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
      buildWhen: (previous, current) {
        if (current is FeedbackErrorState || current is FeedbackLoadingState) {
          return false;
        }

        return true;
      },
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
                color:
                    state is FeedbackChannelState || state is FeedbackFormState
                        ? CustomColors.appColorBlue
                        : CustomColors.greyColor,
              ),
            ),
            Container(
              height: 16,
              width: 16,
              decoration: BoxDecoration(
                color: state.feedbackChannel != FeedbackChannel.none &&
                        state.contact != '' &&
                        (state is FeedbackChannelState ||
                            state is FeedbackFormState)
                    ? CustomColors.appColorBlue
                    : CustomColors.greyColor,
                shape: BoxShape.circle,
              ),
            ),
            Expanded(
              child: Divider(
                thickness: 2,
                color: state is FeedbackFormState
                    ? CustomColors.appColorBlue
                    : CustomColors.greyColor,
              ),
            ),
            Container(
              height: 16,
              width: 16,
              decoration: BoxDecoration(
                color: state.feedback != '' && state is FeedbackFormState
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
      padding: const EdgeInsets.only(left: 16, right: 16),
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
                  ? Border.all(
                      color: CustomColors.appColorBlue,
                      width: 0,
                    )
                  : Border.all(
                      color: CustomColors.greyColor,
                      width: 3,
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
        BlocBuilder<FeedbackBloc, FeedbackState>(builder: (context, state) {
          return Container(
            height: 255,
            alignment: Alignment.center,
            padding: const EdgeInsets.only(left: 15, right: 15),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.all(
                Radius.circular(8.0),
              ),
              border: Border.all(color: Colors.white),
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
                        SetFeedback(feedback: feedback),
                      );
                },
                onFieldSubmitted: (String feedback) {
                  if (feedback == '') {
                    context.read<FeedbackBloc>().add(
                          const FeedbackFormError('Enter feedback'),
                        );

                    return;
                  }
                  context.read<FeedbackBloc>().add(
                        SetFeedback(feedback: feedback),
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
        }),
      ],
    );
  }
}

class FeedbackNavigationButtons extends StatelessWidget {
  const FeedbackNavigationButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FeedbackBloc, FeedbackState>(
      buildWhen: (previous, current) {
        if (current is FeedbackErrorState) {
          return false;
        }

        return previous is FeedbackLoadingState;
      },
      builder: (context, state) {
        if (state is FeedbackLoadingState) {
          return const CircularProgressIndicator();
        }

        if (state is FeedbackTypeState) {
          return GestureDetector(
            onTap: () {
              if (state.feedbackType != FeedbackType.none) {
                context.read<FeedbackBloc>().add(
                      const GoToChannelStep(),
                    );
              }
            },
            child: NextButton(
              buttonColor: state.feedbackType == FeedbackType.none
                  ? CustomColors.appColorBlue.withOpacity(0.24)
                  : CustomColors.appColorBlue,
            ),
          );
        }

        if (state is FeedbackChannelState) {
          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                child: const FeedbackBackButton(),
                onTap: () {
                  context.read<FeedbackBloc>().add(
                        const GoToTypeStep(),
                      );
                },
              ),
              GestureDetector(
                onTap: () {
                  if (state.feedbackChannel != FeedbackChannel.none &&
                      state.contact == '') {
                    context.read<FeedbackBloc>().add(
                          const FeedbackFormError('Enter your email address'),
                        );

                    return;
                  }
                  if (!state.contact.isValidEmail()) {
                    context.read<FeedbackBloc>().add(
                          const FeedbackFormError('Invalid email address'),
                        );

                    return;
                  }
                  context.read<FeedbackBloc>().add(
                        const GoToFormStep(),
                      );
                },
                child: FeedbackNextButton(
                  text: 'Next',
                  buttonColor: state.feedbackChannel == FeedbackChannel.none ||
                          !state.contact.isValidEmail()
                      ? CustomColors.appColorBlue.withOpacity(0.24)
                      : CustomColors.appColorBlue,
                ),
              ),
            ],
          );
        }

        if (state is FeedbackFormState) {
          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                child: const FeedbackBackButton(),
                onTap: () {
                  context.read<FeedbackBloc>().add(
                        const GoToChannelStep(),
                      );
                },
              ),
              GestureDetector(
                onTap: () async {
                  if (state.feedback == '') {
                    context.read<FeedbackBloc>().add(
                          const FeedbackFormError('Enter your feedback'),
                        );

                    return;
                  }
                  loadingScreen(context);
                  await AirqoApiClient()
                      .sendFeedback(
                        UserFeedback(
                          contactDetails: state.contact,
                          message: state.feedback,
                          feedbackType: state.feedbackType,
                        ),
                      )
                      .then((value) => {
                            Navigator.of(context).pop(),
                            context.read<FeedbackBloc>().add(
                                  FeedbackFormError(
                                    value
                                        ? Config.feedbackSuccessMessage
                                        : Config.feedbackFailureMessage,
                                  ),
                                ),
                            if (value)
                              {
                                context.read<FeedbackBloc>().add(
                                      FeedbackFormError(
                                        Config.feedbackSuccessMessage,
                                      ),
                                    ),
                                context
                                    .read<FeedbackBloc>()
                                    .add(const ClearFeedback()),
                                Navigator.pushAndRemoveUntil(
                                  context,
                                  MaterialPageRoute(builder: (context) {
                                    return const HomePage(refresh: true);
                                  }),
                                  (r) => false,
                                ),
                              },
                          });
                },
                child: FeedbackNextButton(
                  text: 'Next',
                  buttonColor: state.feedback == ''
                      ? CustomColors.appColorBlue.withOpacity(0.24)
                      : CustomColors.appColorBlue,
                ),
              ),
            ],
          );
        }

        return Container();
      },
    );
  }
}

class FeedbackTypeStep extends StatelessWidget {
  const FeedbackTypeStep({Key? key}) : super(key: key);

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
          SetFeedbackType(feedbackType: feedbackType),
        );
  }
}

class FeedbackChannelStep extends StatelessWidget {
  const FeedbackChannelStep({Key? key}) : super(key: key);

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
                    const SetFeedbackChannel(
                      feedbackChannel: FeedbackChannel.email,
                    ),
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
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.all(
                  Radius.circular(8.0),
                ),
                border: Border.all(color: Colors.white),
              ),
              child: TextFormField(
                initialValue: state.contact,
                onFieldSubmitted: (String email) {
                  if (!email.isValidEmail()) {
                    context.read<FeedbackBloc>().add(
                          const FeedbackFormError('Invalid email address'),
                        );

                    return;
                  }
                  context.read<FeedbackBloc>().add(
                        SetFeedbackContact(contact: email),
                      );
                },
                style: Theme.of(context).textTheme.bodyText1,
                enableSuggestions: true,
                cursorWidth: 1,
                autofocus: false,
                onChanged: (String email) {
                  if (email.isValidEmail()) {
                    context.read<FeedbackBloc>().add(
                          SetFeedbackContact(contact: email),
                        );
                  } else {
                    context.read<FeedbackBloc>().add(
                          const SetFeedbackContact(contact: ''),
                        );
                  }
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
