import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:flutter/material.dart';

class StatusNotification extends StatefulWidget {
  final String message;
  final bool isSuccess;
  final bool isInfo;
  final Duration duration;
  final VoidCallback? onDismissed;
  final VoidCallback? onTap;

  const StatusNotification({
    super.key,
    required this.message,
    this.isSuccess = true,
    this.isInfo = false,
    this.duration = const Duration(seconds: 3),
    this.onDismissed,
    this.onTap,
  });

  @override
  State<StatusNotification> createState() => _StatusNotificationState();
}

class _StatusNotificationState extends State<StatusNotification> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _offsetAnimation;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _offsetAnimation = Tween<Offset>(
      begin: const Offset(0, 1), // Start from bottom
      end: Offset.zero,           // End at original position
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));
    
    // Start the entrance animation
    _controller.forward();
    
    // Set up auto-dismiss after duration
    Future.delayed(widget.duration, () {
      if (mounted) {
        _controller.reverse().then((_) {
          if (widget.onDismissed != null) {
            widget.onDismissed!();
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Widget icon;
    if (widget.isInfo) {
      bgColor = Colors.blue.shade700;
      icon = const Icon(
        Icons.notifications_outlined,
        color: Colors.white,
        size: 24,
      );
    } else if (widget.isSuccess) {
      bgColor = Colors.green.shade800;
      icon = const Icon(
        Icons.check_circle,
        color: Colors.white,
        size: 24,
      );
    } else {
      bgColor = Colors.red.shade800;
      icon = SystemGlyph.error(context, size: 24, color: Colors.white);
    }

    return SlideTransition(
      position: _offsetAnimation,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.onTap,
        child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            icon,
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                widget.message,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            GestureDetector(
              onTap: () {
                _controller.reverse().then((_) {
                  if (widget.onDismissed != null) {
                    widget.onDismissed!();
                  }
                });
              },
              child: const Icon(
                Icons.close,
                color: Colors.white70,
                size: 18,
              ),
            ),
          ],
        ),
      ),
      ),
    );
  }
}