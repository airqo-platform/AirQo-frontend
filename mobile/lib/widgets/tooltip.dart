import 'dart:core';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../models/enum_constants.dart';
import '../themes/app_theme.dart';
import '../themes/colors.dart';

class ToolTip {
  ToolTip(this.context, this._tipType,
      {double? height, double? width, VoidCallback? onDismiss}) {
    dismissCallback = onDismiss;
    _popupHeight = height ?? 64.0;
    _popupWidth = width ?? 261.0;
  }
  late double _popupWidth;
  late double _popupHeight;

  double arrowHeight = 10.0;
  bool _isDownArrow = true;

  bool _isVisible = false;

  final ToolTipType _tipType;

  late OverlayEntry _entry;
  late Offset _offset;
  late Rect _showRect;

  VoidCallback? dismissCallback;

  late Size _screenSize;

  BuildContext context;

  LayoutBuilder buildPopupLayout(Offset offset) {
    return LayoutBuilder(builder: (context, constraints) {
      return GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: dismiss,
        child: Material(
          color: Colors.transparent,
          child: Stack(
            children: <Widget>[
              // triangle arrow
              Positioned(
                left: _showRect.left + _showRect.width / 2.0 - 7.5,
                top: _isDownArrow
                    ? offset.dy + _popupHeight
                    : offset.dy - arrowHeight,
                child: CustomPaint(
                  size: Size(15.0, arrowHeight),
                  painter: TrianglePainter(
                      isDownArrow: _isDownArrow,
                      color: CustomColors.appColorBlack),
                ),
              ),
              // popup content
              Positioned(
                // left: offset.dx,
                // right: offset.dx,
                left: 16,
                right: 16,
                top: offset.dy,
                child: Container(
                  padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
                  width: MediaQuery.of(context).size.width,
                  height: 64,
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8.0),
                      color: CustomColors.appColorBlack),
                  child: Row(
                    children: [
                      Expanded(
                        child: getToolTipText(),
                      ),
                      const SizedBox(
                        width: 32,
                      ),
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: CustomColors.toolTipGreyColor,
                          shape: BoxShape.circle,
                        ),
                        child: SvgPicture.asset(
                          'assets/icon/tooltip_close.svg',
                          semanticsLabel: 'Close',
                          height: 20,
                          width: 20,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            ],
          ),
        ),
      );
    });
  }

  void dismiss() {
    if (!_isVisible) {
      return;
    }
    _entry.remove();
    _isVisible = false;
    dismissCallback?.call();
  }

  // TODO: change forecast wording
  RichText getToolTipText() {
    switch (_tipType) {
      case ToolTipType.favouritePlaces:
        return RichText(
            text: TextSpan(children: [
          TextSpan(text: 'Tap the ', style: CustomTextStyle.overline1(context)),
          WidgetSpan(
              child: SvgPicture.asset(
            'assets/icon/heart.svg',
            semanticsLabel: 'Favorite',
            height: 13.33,
            width: 13.12,
          )),
          TextSpan(
              text: ' Favorite icon on any location air quality '
                  'to save them here for later.',
              style: CustomTextStyle.overline1(context)),
        ]));
      case ToolTipType.forYou:
        return RichText(
            text: TextSpan(
                text: 'All your complete tasks will show up here',
                style: CustomTextStyle.overline1(context)));
      case ToolTipType.info:
        return RichText(
            text: TextSpan(children: [
          TextSpan(
              text: 'Tap this ', style: CustomTextStyle.overline1(context)),
          WidgetSpan(
              child: SvgPicture.asset(
            'assets/icon/info_icon_grey.svg',
            semanticsLabel: 'Info',
            height: 16,
            width: 15.56,
          )),
          TextSpan(
              text: ' icon to understand what '
                  'air quality analytics mean.',
              style: CustomTextStyle.overline1(context)),
        ]));
      case ToolTipType.forecast:
        return RichText(
            text: TextSpan(
                text: 'Tap Forecast to view air quality analytics '
                    'for the next 24 hours',
                style: CustomTextStyle.overline1(context)));
      default:
        return RichText(
            text: TextSpan(children: [
          TextSpan(text: 'Tap the ', style: CustomTextStyle.overline1(context)),
          WidgetSpan(
              child: SvgPicture.asset(
            'assets/icon/heart.svg',
            semanticsLabel: 'Favorite',
            height: 13.33,
            width: 13.12,
          )),
          TextSpan(
              text: ' Favorite on any location air quality '
                  'to save them here for later.',
              style: CustomTextStyle.overline1(context)),
        ]));
    }
  }

  void show({Rect? rect, GlobalKey? widgetKey}) {
    if (rect == null && widgetKey == null) {
      debugPrint("both 'rect' and 'key' can't be null");
      return;
    }

    _showRect = rect ?? _getWidgetGlobalRect(widgetKey!);
    _screenSize = window.physicalSize / window.devicePixelRatio;

    _calculatePosition(context);

    _entry = OverlayEntry(builder: (context) {
      return buildPopupLayout(_offset);
    });

    Overlay.of(context)!.insert(_entry);
    _isVisible = true;
  }

  Offset _calculateOffset(BuildContext context) {
    var dx = _showRect.left + _showRect.width / 2.0 - _popupWidth / 2.0;
    if (dx < 10.0) {
      dx = 10.0;
    }

    if (dx + _popupWidth > _screenSize.width && dx > 10.0) {
      final tempDx = _screenSize.width - _popupWidth - 10;
      if (tempDx > 10) dx = tempDx;
    }

    var dy = _showRect.top - _popupHeight;

    if (_tipType == ToolTipType.favouritePlaces ||
        _tipType == ToolTipType.forYou) {
      dy = arrowHeight + _showRect.height + _showRect.top;
      _isDownArrow = false;
    } else if (dy <= MediaQuery.of(context).padding.top + 10) {
      // not enough space above, show popup under the widget.
      dy = arrowHeight + _showRect.height + _showRect.top;
      _isDownArrow = false;
    } else {
      dy -= arrowHeight;
      _isDownArrow = true;
    }

    return Offset(dx, dy);
  }

  void _calculatePosition(BuildContext context) {
    _offset = _calculateOffset(context);
  }

  Rect _getWidgetGlobalRect(GlobalKey key) {
    final renderBox = key.currentContext!.findRenderObject() as RenderBox;
    final offset = renderBox.localToGlobal(Offset.zero);
    return Rect.fromLTWH(
        offset.dx, offset.dy, renderBox.size.width, renderBox.size.height);
  }
}

class TrianglePainter extends CustomPainter {
  TrianglePainter({this.isDownArrow = true, required this.color});
  bool isDownArrow;
  Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    final paint = Paint()
      ..strokeWidth = 2.0
      ..color = color
      ..style = PaintingStyle.fill;

    if (isDownArrow) {
      path
        ..moveTo(0.0, -1.0)
        ..lineTo(size.width, -1.0)
        ..lineTo(size.width / 2.0, size.height);
    } else {
      path
        ..moveTo(size.width / 2.0, 0.0)
        ..lineTo(0.0, size.height + 1)
        ..lineTo(size.width, size.height + 1);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return true;
  }
}
