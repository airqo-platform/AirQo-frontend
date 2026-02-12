import 'package:airqo/src/app/shared/widgets/spinner.dart';
import 'package:flutter/material.dart';

class AirQoButton extends StatelessWidget {
  final String label;
  final Color textColor;
  final bool loading;
  final Widget? icon;
  final VoidCallback onPressed;
  final Color color;
  const AirQoButton(
      {super.key,
      required this.label,
      this.icon,
      this.loading = false,
      required this.textColor,
      required this.color,
      required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: SizedBox(
        height: 56,
        child: ElevatedButton(
          style: ButtonStyle(
              shape: WidgetStatePropertyAll(RoundedRectangleBorder()),
              elevation: WidgetStatePropertyAll(0),
              backgroundColor: WidgetStatePropertyAll(color)),
          onPressed: loading ? null : onPressed,
          child: Center(
            child: loading
                ? Spinner()
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (icon != null) icon!,
                      SizedBox(
                        width: 4,
                      ),
                      Text(
                        label,
                        style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: textColor),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
