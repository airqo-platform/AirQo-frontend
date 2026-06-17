import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

/// Fixed-height completion sheets aligned with Exposure modal styling.
class LearnCompletionSheet {
  LearnCompletionSheet._();

  static const heightFactor = 0.7;
  static const horizontalPadding = 20.0;

  static Color sheetBackground(BuildContext context) =>
      AppSurfaceColors.sheet(context);

  /// Wraps content at its natural height — used for lesson complete and level unlock.
  static Widget compactShell({
    required BuildContext context,
    required Widget child,
  }) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.viewPaddingOf(context).bottom,
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: sheetBackground(context),
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(LearnDesignTokens.sheetTopRadius),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            LearnDesignTokens.dragHandle(context),
            child,
          ],
        ),
      ),
    );
  }

  static Widget compactBody({
    required BuildContext context,
    required Widget content,
    required List<Widget> actions,
  }) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        horizontalPadding,
        0,
        horizontalPadding,
        16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          content,
          const SizedBox(height: 16),
          for (var i = 0; i < actions.length; i++) ...[
            if (i > 0) const SizedBox(height: 8),
            actions[i],
          ],
        ],
      ),
    );
  }

  static Widget shell({
    required BuildContext context,
    required Widget child,
  }) {
    final sheetHeight = MediaQuery.sizeOf(context).height * heightFactor;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.viewPaddingOf(context).bottom,
      ),
      child: SizedBox(
        height: sheetHeight,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: sheetBackground(context),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(LearnDesignTokens.sheetTopRadius),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              LearnDesignTokens.dragHandle(context),
              Expanded(child: child),
            ],
          ),
        ),
      ),
    );
  }

  static Widget body({
    required BuildContext context,
    required Widget content,
    required List<Widget> actions,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(
              horizontalPadding,
              0,
              horizontalPadding,
              8,
            ),
            child: content,
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(
            horizontalPadding,
            0,
            horizontalPadding,
            16,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: actions,
          ),
        ),
      ],
    );
  }
}
