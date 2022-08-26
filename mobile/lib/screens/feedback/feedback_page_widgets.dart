import 'package:app/models/enum_constants.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../themes/app_theme.dart';
import '../../themes/colors.dart';
import '../../widgets/buttons.dart';
import '../../widgets/text_fields.dart';

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

class FeedbackTypeAvatar extends StatelessWidget {
  const FeedbackTypeAvatar({
    super.key,
    required this.active,
  });
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
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
    );
  }
}

class FeedbackProgressBar extends StatelessWidget {
  const FeedbackProgressBar({
    super.key,
    required this.feedbackType,
    required this.index,
    required this.feedbackChannel,
  });

  final int index;
  final FeedbackType feedbackType;
  final FeedbackChannel feedbackChannel;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          height: 16,
          width: 16,
          decoration: BoxDecoration(
            color: feedbackType == FeedbackType.none
                ? CustomColors.greyColor
                : CustomColors.appColorBlue,
            shape: BoxShape.circle,
          ),
        ),
        Expanded(
          child: Divider(
            thickness: 2,
            color:
                index >= 1 ? CustomColors.appColorBlue : CustomColors.greyColor,
          ),
        ),
        Container(
          height: 16,
          width: 16,
          decoration: BoxDecoration(
            color: feedbackChannel != FeedbackChannel.none && index >= 1
                ? CustomColors.appColorBlue
                : CustomColors.greyColor,
            shape: BoxShape.circle,
          ),
        ),
        Expanded(
          child: Divider(
            thickness: 2,
            color: index >= 2 || feedbackChannel == FeedbackChannel.whatsApp
                ? CustomColors.appColorBlue
                : CustomColors.greyColor,
          ),
        ),
        Container(
          height: 16,
          width: 16,
          decoration: BoxDecoration(
            color: index >= 2 || feedbackChannel == FeedbackChannel.whatsApp
                ? CustomColors.appColorBlue
                : CustomColors.greyColor,
            shape: BoxShape.circle,
          ),
        ),
      ],
    );
  }
}

class EmailFeedbackInputField extends StatelessWidget {
  const EmailFeedbackInputField({
    super.key,
    required this.onEmailChange,
    required this.initialValue,
  });
  final Function(String) onEmailChange;
  final String initialValue;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      alignment: Alignment.center,
      padding: const EdgeInsets.only(left: 15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
        border: Border.all(color: Colors.white),
      ),
      child: Center(
        child: TextFormField(
          initialValue: initialValue,
          autofocus: true,
          style: Theme.of(context).textTheme.bodyText2,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: CustomColors.appColorBlue,
          keyboardType: TextInputType.emailAddress,
          onChanged: onEmailChange,
          decoration: InputDecoration(
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            hintText: 'Enter your email',
            suffixIcon: GestureDetector(
              onTap: () {
                onEmailChange('');
              },
              child: const TextInputCloseButton(),
            ),
            hintStyle: Theme.of(context).textTheme.bodyText2?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                ),
          ),
        ),
      ),
    );
  }
}

class FeedbackFormInputField extends StatelessWidget {
  const FeedbackFormInputField({
    super.key,
    required this.onFeedbackChange,
    required this.initialValue,
  });
  final Function(String) onFeedbackChange;
  final String initialValue;

  @override
  Widget build(BuildContext context) {
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
          autofocus: true,
          initialValue: initialValue,
          style: Theme.of(context).textTheme.bodyText2,
          enableSuggestions: false,
          cursorWidth: 1,
          maxLines: 12,
          cursorColor: CustomColors.appColorBlue,
          keyboardType: TextInputType.emailAddress,
          onChanged: onFeedbackChange,
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
  }
}

class FeedbackCard extends StatelessWidget {
  const FeedbackCard({
    super.key,
    required this.activeCard,
    required this.index,
    required this.title,
    required this.updateIndex,
  });

  final int activeCard;
  final int index;
  final String title;
  final Function(int) updateIndex;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => updateIndex(index),
      child: Container(
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
            FeedbackTypeAvatar(active: index == activeCard),
            const SizedBox(
              width: 16,
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodyText1,
            ),
          ],
        ),
      ),
    );
  }
}

class FeedbackForm extends StatelessWidget {
  const FeedbackForm({
    super.key,
    required this.onFeedbackChange,
    required this.initialValue,
  });
  final Function(String) onFeedbackChange;
  final String initialValue;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(
          height: 32,
        ),
        Text(
          'Go Ahead, Tell Us More?',
          style: CustomTextStyle.headline9(context),
        ),
        const SizedBox(
          height: 16,
        ),
        FeedbackFormInputField(
          onFeedbackChange: onFeedbackChange,
          initialValue: initialValue,
        ),
      ],
    );
  }
}

class FeedbackNavigationButtons extends StatelessWidget {
  const FeedbackNavigationButtons({
    super.key,
    required this.step,
    required this.feedbackType,
    required this.feedbackChannel,
    required this.updateStep,
    required this.isLoading,
    required this.onNextButtonClick,
  });
  final int step;
  final FeedbackType feedbackType;
  final FeedbackChannel feedbackChannel;
  final Function(int) updateStep;
  final bool isLoading;
  final VoidCallback onNextButtonClick;

  @override
  Widget build(BuildContext context) {
    return step == 0
        ? GestureDetector(
            onTap: () {
              if (feedbackType != FeedbackType.none) {
                updateStep(1);
              }
            },
            child: NextButton(
              buttonColor: feedbackType == FeedbackType.none
                  ? CustomColors.appColorBlue.withOpacity(0.24)
                  : CustomColors.appColorBlue,
            ),
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                child: const FeedbackBackButton(),
                onTap: () {
                  updateStep(step - 1);
                },
              ),
              GestureDetector(
                onTap: onNextButtonClick,
                child: step == 2 || feedbackChannel == FeedbackChannel.whatsApp
                    ? FeedbackNextButton(
                        text: 'Send',
                        buttonColor: isLoading
                            ? CustomColors.appColorBlue.withOpacity(0.24)
                            : CustomColors.appColorBlue,
                      )
                    : FeedbackNextButton(
                        text: 'Next',
                        buttonColor: CustomColors.appColorBlue,
                      ),
              ),
            ],
          );
  }
}

class FeedbackTypeStep extends StatefulWidget {
  const FeedbackTypeStep({
    super.key,
    required this.feedbackType,
    required this.initialSelection,
  });
  final Function(FeedbackType) feedbackType;
  final FeedbackType initialSelection;
  @override
  State<FeedbackTypeStep> createState() => _FeedbackTypeStepState();
}

class _FeedbackTypeStepState extends State<FeedbackTypeStep> {
  late int activeCard;

  @override
  void initState() {
    super.initState();
    switch (widget.initialSelection) {
      case FeedbackType.inquiry:
        setState(() => activeCard = 0);
        break;
      case FeedbackType.suggestion:
        setState(() => activeCard = 1);
        break;
      case FeedbackType.appBugs:
        setState(() => activeCard = 2);
        break;
      case FeedbackType.reportAirPollution:
        setState(() => activeCard = 3);
        break;
      case FeedbackType.none:
        setState(() => activeCard = -1);
        break;
    }
  }

  void _updateIndex(int index) {
    setState(
      () {
        activeCard = index;
        switch (index) {
          case 0:
            widget.feedbackType(FeedbackType.reportAirPollution);
            break;
          case 1:
            widget.feedbackType(FeedbackType.inquiry);
            break;
          case 2:
            widget.feedbackType(FeedbackType.suggestion);
            break;
          case 3:
            widget.feedbackType(FeedbackType.appBugs);
            break;
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(
          height: 32,
        ),
        Text(
          'What Type Of Feedback?',
          style: CustomTextStyle.headline9(context),
        ),
        const SizedBox(
          height: 16,
        ),
        FeedbackCard(
          title: FeedbackType.reportAirPollution.toString(),
          activeCard: activeCard,
          index: 0,
          updateIndex: _updateIndex,
        ),
        const SizedBox(
          height: 4,
        ),
        FeedbackCard(
          title: FeedbackType.inquiry.toString(),
          activeCard: activeCard,
          index: 1,
          updateIndex: _updateIndex,
        ),
        const SizedBox(
          height: 4,
        ),
        FeedbackCard(
          title: FeedbackType.suggestion.toString(),
          activeCard: activeCard,
          index: 2,
          updateIndex: _updateIndex,
        ),
        const SizedBox(
          height: 4,
        ),
        FeedbackCard(
          title: FeedbackType.appBugs.toString(),
          activeCard: activeCard,
          index: 3,
          updateIndex: _updateIndex,
        ),
      ],
    );
  }
}

class FeedbackChannelStep extends StatefulWidget {
  const FeedbackChannelStep({
    super.key,
    required this.feedbackChannel,
    required this.onEmailChange,
    required this.initialSelection,
    required this.initialEmailValue,
  });
  final Function(FeedbackChannel) feedbackChannel;
  final Function(String) onEmailChange;
  final FeedbackChannel initialSelection;
  final String initialEmailValue;
  @override
  State<FeedbackChannelStep> createState() => _FeedbackChannelStepState();
}

class _FeedbackChannelStepState extends State<FeedbackChannelStep> {
  late int activeCard;

  @override
  void initState() {
    super.initState();
    switch (widget.initialSelection) {
      case FeedbackChannel.email:
        setState(() => activeCard = 0);
        break;
      case FeedbackChannel.whatsApp:
        setState(() => activeCard = 1);
        break;
      case FeedbackChannel.none:
        setState(() => activeCard = -1);
        break;
    }
  }

  void _updateIndex(int index) {
    setState(
      () {
        activeCard = index;
        switch (index) {
          case 0:
            widget.feedbackChannel(FeedbackChannel.email);
            break;
          case 1:
            widget.feedbackChannel(FeedbackChannel.whatsApp);
            break;
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(
          height: 32,
        ),
        Text(
          'Send Us Feedback Via Email',
          style: CustomTextStyle.headline9(context),
        ),
        const SizedBox(
          height: 16,
        ),
        FeedbackCard(
          title: FeedbackChannel.email.toString(),
          activeCard: activeCard,
          index: 0,
          updateIndex: _updateIndex,
        ),
        const SizedBox(
          height: 4,
        ),
        Visibility(
          visible: activeCard == 0,
          child: EmailFeedbackInputField(
            onEmailChange: widget.onEmailChange,
            initialValue: widget.initialEmailValue,
          ),
        ),
        const SizedBox(
          height: 16,
        ),
        Visibility(
          visible: false,
          child: FeedbackCard(
            title: FeedbackChannel.whatsApp.toString(),
            activeCard: activeCard,
            index: 1,
            updateIndex: _updateIndex,
          ),
        ),
      ],
    );
  }
}
