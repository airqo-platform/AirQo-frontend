import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class TimePickerDrum extends StatefulWidget {
  final TimeOfDay initial;
  final void Function(TimeOfDay) onConfirm;
  const TimePickerDrum({super.key, required this.initial, required this.onConfirm});

  @override
  State<TimePickerDrum> createState() => _TimePickerDrumState();
}

class _TimePickerDrumState extends State<TimePickerDrum> {
  late int _hour;
  late int _minute;
  late bool _isAm;

  @override
  void initState() {
    super.initState();
    final t = widget.initial;
    _isAm = t.period == DayPeriod.am;
    _hour = t.hourOfPeriod == 0 ? 12 : t.hourOfPeriod;
    _minute = t.minute;
  }

  TimeOfDay get _result {
    int h = _hour % 12;
    if (!_isAm) h += 12;
    return TimeOfDay(hour: h, minute: _minute);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkHighlight : Colors.white;
    final txt = isDark ? Colors.white : const Color(0xFF1A1D23);

    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Center(
              child: Container(
                width: 36, height: 4,
                decoration: BoxDecoration(
                  color: AppColors.boldHeadlineColor.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _DrumColumn(value: _hour, min: 1, max: 12, onChanged: (v) => setState(() => _hour = v), textColor: txt),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(':', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: txt)),
              ),
              _DrumColumn(value: _minute, min: 0, max: 59, padded: true, onChanged: (v) => setState(() => _minute = v), textColor: txt),
              const SizedBox(width: 20),
              _AmPmToggle(isAm: _isAm, onChanged: (v) => setState(() => _isAm = v)),
            ],
          ),
          const SizedBox(height: 28),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    side: BorderSide(color: AppColors.dividerColorlight),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Text('Cancel', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.boldHeadlineColor)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () { Navigator.of(context).pop(); widget.onConfirm(_result); },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor, foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: const Text('Confirm', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DrumColumn extends StatelessWidget {
  final int value, min, max;
  final bool padded;
  final void Function(int) onChanged;
  final Color textColor;
  const _DrumColumn({required this.value, required this.min, required this.max, required this.onChanged, required this.textColor, this.padded = false});

  int _wrap(int v) { if (v > max) return min; if (v < min) return max; return v; }

  @override
  Widget build(BuildContext context) {
    final label = padded ? value.toString().padLeft(2, '0') : value.toString();
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _ArrowBtn(icon: Icons.keyboard_arrow_up_rounded, onTap: () => onChanged(_wrap(value + 1))),
        const SizedBox(height: 4),
        SizedBox(width: 60, child: Center(child: Text(label, style: TextStyle(fontSize: 44, fontWeight: FontWeight.w700, color: textColor)))),
        const SizedBox(height: 4),
        _ArrowBtn(icon: Icons.keyboard_arrow_down_rounded, onTap: () => onChanged(_wrap(value - 1))),
      ],
    );
  }
}

class _ArrowBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _ArrowBtn({required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Padding(padding: const EdgeInsets.all(6), child: Icon(icon, size: 28, color: AppColors.boldHeadlineColor)),
  );
}

class _AmPmToggle extends StatelessWidget {
  final bool isAm;
  final void Function(bool) onChanged;
  const _AmPmToggle({required this.isAm, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: ['AM', 'PM'].map((label) {
        final active = label == 'AM' ? isAm : !isAm;
        return GestureDetector(
          onTap: () => onChanged(label == 'AM'),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 52, margin: const EdgeInsets.symmetric(vertical: 3),
            padding: const EdgeInsets.symmetric(vertical: 9),
            decoration: BoxDecoration(
              color: active ? AppColors.primaryColor : AppColors.highlightColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(child: Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: active ? Colors.white : AppColors.boldHeadlineColor))),
          ),
        );
      }).toList(),
    );
  }
}
