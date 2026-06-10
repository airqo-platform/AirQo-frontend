import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/widgets/time_picker_drum.dart';
import 'package:airqo/src/app/shared/widgets/custom_switch.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class TimeWindowSheet extends StatefulWidget {
  final DeclaredPlace place;
  const TimeWindowSheet({super.key, required this.place});

  @override
  State<TimeWindowSheet> createState() => _TimeWindowSheetState();
}

class _TimeWindowSheetState extends State<TimeWindowSheet> {
  bool _isWeekdays = true;
  late TimeOfDay _wdArrive, _wdLeave, _weArrive, _weLeave;
  late bool _absentWeekdays;
  late bool _absentWeekends;

  @override
  void initState() {
    super.initState();
    _wdArrive = widget.place.weekdayWindow?.arrive ?? const TimeOfDay(hour: 7, minute: 0);
    _wdLeave = widget.place.weekdayWindow?.leave ?? const TimeOfDay(hour: 17, minute: 0);
    _weArrive = widget.place.weekendWindow?.arrive ?? const TimeOfDay(hour: 9, minute: 0);
    _weLeave = widget.place.weekendWindow?.leave ?? const TimeOfDay(hour: 13, minute: 0);
    _absentWeekdays = widget.place.absentOnWeekdays;
    _absentWeekends = widget.place.absentOnWeekends;
  }

  TimeOfDay get _arrive => _isWeekdays ? _wdArrive : _weArrive;
  TimeOfDay get _leave => _isWeekdays ? _wdLeave : _weLeave;
  void _setArrive(TimeOfDay t) => setState(() => _isWeekdays ? _wdArrive = t : _weArrive = t);
  void _setLeave(TimeOfDay t) => setState(() => _isWeekdays ? _wdLeave = t : _weLeave = t);

  bool get _absentCurrentSegment => _isWeekdays ? _absentWeekdays : _absentWeekends;

  String get _hint {
    if (_isWeekdays && _absentWeekdays) return 'Not scheduled on weekdays · ${widget.place.displayName}';
    if (!_isWeekdays && _absentWeekends) return 'Not scheduled on weekends · ${widget.place.displayName}';
    final w = TimeWindow(arrive: _arrive, leave: _leave);
    return '${w.durationLabel} window · ${widget.place.displayName}';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkHighlight : Colors.white;
    final txt1 = isDark ? Colors.white : const Color(0xFF1A1D23);
    final txt2 = isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;

    return DraggableScrollableSheet(
      initialChildSize: 0.65, minChildSize: 0.4, maxChildSize: 0.9, expand: false,
      builder: (ctx, sc) {
        return Container(
          decoration: BoxDecoration(color: bg, borderRadius: const BorderRadius.vertical(top: Radius.circular(20))),
          child: Column(
            children: [
              _handle(txt2),
              Expanded(
                child: SingleChildScrollView(
                  controller: sc,
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('When are you usually here?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: txt1)),
                      const SizedBox(height: 6),
                      Text('Set your typical schedule to track exposure accurately.',
                          style: TextStyle(fontSize: 13, color: txt2)),
                      const SizedBox(height: 20),
                      _SegmentControl(selected: _isWeekdays ? 0 : 1, labels: const ['Weekdays', 'Weekends'],
                          onChanged: (i) => setState(() => _isWeekdays = i == 0)),
                      const SizedBox(height: 12),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _isWeekdays ? "I'm not here on weekdays" : "I'm not here on weekends",
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: txt1),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _isWeekdays
                                      ? 'Mon–Fri: no time at this place'
                                      : 'Sat–Sun: no time at this place',
                                  style: TextStyle(fontSize: 12, color: txt2),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          CustomSwitch(
                            value: _absentCurrentSegment,
                            onChanged: (v) => setState(() {
                              if (_isWeekdays) {
                                _absentWeekdays = v;
                              } else {
                                _absentWeekends = v;
                              }
                            }),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Opacity(
                        opacity: _absentCurrentSegment ? 0.38 : 1.0,
                        child: IgnorePointer(
                          ignoring: _absentCurrentSegment,
                          child: Column(
                            children: [
                              _TimeField(label: 'Arrive', time: _arrive, isDark: isDark,
                                  onTap: () => _pick(context, _arrive, _setArrive)),
                              const SizedBox(height: 10),
                              _TimeField(label: 'Leave', time: _leave, isDark: isDark,
                                  onTap: () => _pick(context, _leave, _setLeave)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Center(child: Text(_hint, style: TextStyle(fontSize: 13, color: txt2, fontWeight: FontWeight.w500))),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _onSave,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryColor, foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                          child: const Text('Save', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _handle(Color txt2) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Center(child: Container(width: 36, height: 4,
        decoration: BoxDecoration(color: txt2.withValues(alpha: 0.4), borderRadius: BorderRadius.circular(2)))),
  );

  void _pick(BuildContext ctx, TimeOfDay initial, void Function(TimeOfDay) cb) {
    showModalBottomSheet(
      context: ctx, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (_) => TimePickerDrum(initial: initial, onConfirm: cb),
    );
  }

  void _onSave() {
    final updated = widget.place.copyWith(
      weekdayWindow: TimeWindow(arrive: _wdArrive, leave: _wdLeave),
      weekendWindow: TimeWindow(arrive: _weArrive, leave: _weLeave),
      absentOnWeekdays: _absentWeekdays,
      absentOnWeekends: _absentWeekends,
    );
    context.read<DeclaredPlacesCubit>().addPlace(updated);
    Navigator.of(context).pop();
  }
}

class _SegmentControl extends StatelessWidget {
  final int selected;
  final List<String> labels;
  final void Function(int) onChanged;
  const _SegmentControl({required this.selected, required this.labels, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkThemeBackground : AppColors.highlightColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: List.generate(labels.length, (i) {
          final active = i == selected;
          return Expanded(
            child: GestureDetector(
              onTap: () => onChanged(i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                margin: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: active ? (isDark ? AppColors.darkHighlight : Colors.white) : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: active ? [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 4, offset: const Offset(0, 1))] : null,
                ),
                child: Center(child: Text(labels[i], style: TextStyle(
                  fontSize: 13,
                  fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                  color: active
                      ? (isDark ? Colors.white : const Color(0xFF1A1D23))
                      : (isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3),
                ))),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _TimeField extends StatelessWidget {
  final String label;
  final TimeOfDay time;
  final VoidCallback onTap;
  final bool isDark;
  const _TimeField({required this.label, required this.time, required this.onTap, required this.isDark});

  String _fmt(TimeOfDay t) {
    final h = t.hourOfPeriod == 0 ? 12 : t.hourOfPeriod;
    final m = t.minute.toString().padLeft(2, '0');
    return '$h:$m ${t.period == DayPeriod.am ? 'AM' : 'PM'}';
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkThemeBackground : AppColors.highlightColor,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3)),
            const Spacer(),
            Text(_fmt(time), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3)),
            const SizedBox(width: 6),
            Icon(Icons.chevron_right_rounded, size: 18, color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3),
          ],
        ),
      ),
    );
  }
}
