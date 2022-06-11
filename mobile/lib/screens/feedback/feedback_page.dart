import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/feedback.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../models/enum_constants.dart';
import '../../services/rest_api.dart';
import '../../themes/colors.dart';
import 'feedback_page_widgets.dart';

class FeedbackPage extends StatefulWidget {
  const FeedbackPage({Key? key}) : super(key: key);

  @override
  _FeedbackPageState createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  int _step = 0;
  FeedbackType _feedbackType = FeedbackType.none;
  FeedbackChannel _feedbackChannel = FeedbackChannel.none;

  bool _loading = false;
  String _emailAddress = '';
  String _feedback = '';

  void _onFeedbackTypeChange(FeedbackType feedbackType) {
    setState(() => _feedbackType = feedbackType);
  }

  void _updateStep(int step) {
    setState(() => _step = step);
  }

  void _onFeedbackChannelChange(FeedbackChannel feedbackChannel) {
    setState(() => _feedbackChannel = feedbackChannel);
  }

  void _onEmailAddressChange(String emailAddress) {
    setState(() => _emailAddress = emailAddress);
  }

  void _onFeedbackChange(String feedback) {
    setState(() => _feedback = feedback);
  }

  void _onNextButtonClick() async {
    if (_step == 1 && _feedbackChannel != FeedbackChannel.none) {
      switch (_feedbackChannel) {
        case FeedbackChannel.whatsApp:
          _openWhatsapp();
          Future.delayed(
            const Duration(seconds: 2),
            () {
              Navigator.of(context).pop();
            },
          );
          return;
        case FeedbackChannel.email:
          if (!_emailAddress.isValidEmail()) {
            await showSnackBar(
              context,
              'Invalid email address',
            );
          } else {
            setState(() => _step = _step + 1);
          }
          return;
        case FeedbackChannel.none:
          return;
      }
    }
    if (_step == 2 && _feedbackChannel == FeedbackChannel.email) {
      if (_feedback.isEmpty) {
        await showSnackBar(
          context,
          'Enter your feedback',
        );
      } else {
        setState(() => _loading = true);
        final success = await AirqoApiClient().sendFeedback(
          UserFeedback(_emailAddress, _feedback, _feedbackType),
        );
        if (success) {
          await showSnackBar(
            context,
            Config.feedbackSuccessMessage,
          );
          Navigator.of(context).pop();
          setState(() => _loading = false);
        } else {
          await showSnackBar(
            context,
            Config.feedbackFailureMessage,
          );
          setState(() => _loading = false);
        }
      }
    }
  }

  void _openWhatsapp() async {
    final androidUrl =
        '${Config.appAndroidWhatsappUrl}${_feedbackType.stringValue()}';
    final iosUrl = '${Config.appIOSWhatsappUrl}${_feedbackType.stringValue()}';
    if (Platform.isIOS) {
      if (await canLaunchUrl(Uri.parse(iosUrl))) {
        await launchUrl(
          Uri.parse(iosUrl),
        );

        return;
      }
    } else {
      if (await canLaunchUrl(Uri.parse(androidUrl))) {
        await launchUrl(
          Uri.parse(androidUrl),
        );

        return;
      }
    }
    await showSnackBar(
      context,
      'Failed to open Whatsapp. Try again later',
    );
  }

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
              height: 37,
            ),
            FeedbackProgressBar(
              feedbackType: _feedbackType,
              index: _step,
              feedbackChannel: _feedbackChannel,
            ),
            Visibility(
              visible: _step == 0,
              child: FeedbackTypeStep(
                feedbackType: _onFeedbackTypeChange,
                initialSelection: _feedbackType,
              ),
            ),
            Visibility(
              visible: _step == 1,
              child: FeedbackChannelStep(
                feedbackChannel: _onFeedbackChannelChange,
                onEmailChange: _onEmailAddressChange,
                initialSelection: _feedbackChannel,
                initialEmailValue: _emailAddress,
              ),
            ),
            Visibility(
              visible: _step == 2 && _feedbackChannel == FeedbackChannel.email,
              child: FeedbackForm(
                onFeedbackChange: _onFeedbackChange,
                initialValue: _feedback,
              ),
            ),
            const Spacer(),
            FeedbackNavigationButtons(
              feedbackType: _feedbackType,
              onNextButtonClick: _onNextButtonClick,
              feedbackChannel: _feedbackChannel,
              isLoading: _loading,
              updateStep: _updateStep,
              step: _step,
            ),
            const SizedBox(
              height: 37,
            ),
          ],
        ),
      ),
    );
  }
}
