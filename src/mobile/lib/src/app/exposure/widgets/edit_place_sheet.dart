import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/widgets/time_picker_drum.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class EditPlaceSheet extends StatefulWidget {
  final DeclaredPlace place;
  const EditPlaceSheet({super.key, required this.place});

  @override
  State<EditPlaceSheet> createState() => _EditPlaceSheetState();
}

class _EditPlaceSheetState extends State<EditPlaceSheet> {
  late PlaceType _type;
  late TextEditingController _nameCtrl;
  bool _isWeekdays = true;
  late TimeOfDay _wdArrive, _wdLeave, _weArrive, _weLeave;

  @override
  void initState() {
    super.initState();
    final p = widget.place;
    _type = p.type;
    _nameCtrl = TextEditingController(text: p.displayName);
    _wdArrive = p.weekdayWindow?.arrive ?? const TimeOfDay(hour: 7, minute: 0);
    _wdLeave = p.weekdayWindow?.leave ?? const TimeOfDay(hour: 17, minute: 0);
    _weArrive = p.weekendWindow?.arrive ?? const TimeOfDay(hour: 9, minute: 0);
    _weLeave = p.weekendWindow?.leave ?? const TimeOfDay(hour: 13, minute: 0);
  }

  @override
  void dispose() { _nameCtrl.dispose(); super.dispose(); }

  TimeOfDay get _arrive => _isWeekdays ? _wdArrive : _weArrive;
  TimeOfDay get _leave => _isWeekdays ? _wdLeave : _weLeave;
  void _setArrive(TimeOfDay t) => setState(() => _isWeekdays ? _wdArrive = t : _weArrive = t);
  void _setLeave(TimeOfDay t) => setState(() => _isWeekdays ? _wdLeave = t : _weLeave = t);

  String get _hint => '${TimeWindow(arrive: _arrive, leave: _leave).durationLabel} window at ${_type.label.toLowerCase()}';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkHighlight : Colors.white;
    final txt1 = isDark ? Colors.white : const Color(0xFF1A1D23);
    final txt2 = AppColors.boldHeadlineColor;

    return DraggableScrollableSheet(
      initialChildSize: 0.9, minChildSize: 0.5, maxChildSize: 0.95, expand: false,
      builder: (ctx, sc) {
        return Container(
          decoration: BoxDecoration(color: bg, borderRadius: const BorderRadius.vertical(top: Radius.circular(20))),
          child: Column(
            children: [
              Padding(padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Center(child: Container(width: 36, height: 4,
                      decoration: BoxDecoration(color: txt2.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))))),
              Expanded(
                child: SingleChildScrollView(
                  controller: sc,
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Edit place', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: txt1)),
                      const SizedBox(height: 20),
                      // Type grid
                      GridView.count(
                        crossAxisCount: 3, shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.1,
                        children: PlaceType.values.map((t) {
                          final sel = _type == t;
                          return GestureDetector(
                            onTap: () => setState(() => _type = t),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              decoration: BoxDecoration(
                                color: sel ? (isDark ? AppColors.primaryColor.withValues(alpha: 0.2) : const Color(0xFFEEF3FF))
                                    : (isDark ? const Color(0xFF2E2F33) : AppColors.highlightColor),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: sel ? AppColors.primaryColor : Colors.transparent, width: 1.5),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(t.icon, size: 24, color: sel ? AppColors.primaryColor : txt2),
                                  const SizedBox(height: 6),
                                  Text(t.label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: sel ? AppColors.primaryColor : txt2)),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 20),
                      Text('Name', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: txt2)),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _nameCtrl,
                        textCapitalization: TextCapitalization.words,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: isDark ? const Color(0xFF2E2F33) : AppColors.highlightColor,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text('Time window', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: txt2)),
                      const SizedBox(height: 12),
                      _SegmentControl(selected: _isWeekdays ? 0 : 1, labels: const ['Weekdays', 'Weekends'],
                          onChanged: (i) => setState(() => _isWeekdays = i == 0)),
                      const SizedBox(height: 12),
                      _TimeField(label: 'Arrive', time: _arrive, isDark: isDark, onTap: () => _pick(context, _arrive, _setArrive)),
                      const SizedBox(height: 10),
                      _TimeField(label: 'Leave', time: _leave, isDark: isDark, onTap: () => _pick(context, _leave, _setLeave)),
                      const SizedBox(height: 12),
                      Center(child: Text(_hint, style: TextStyle(fontSize: 13, color: txt2))),
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
                          child: const Text('Save changes', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
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

  void _pick(BuildContext ctx, TimeOfDay initial, void Function(TimeOfDay) cb) {
    showModalBottomSheet(context: ctx, isScrollControlled: true, backgroundColor: Colors.transparent,
        builder: (_) => TimePickerDrum(initial: initial, onConfirm: cb));
  }

  void _onSave() {
    final name = _nameCtrl.text.trim().isEmpty ? widget.place.displayName : _nameCtrl.text.trim();
    final updated = widget.place.copyWith(
      type: _type, displayName: name,
      weekdayWindow: TimeWindow(arrive: _wdArrive, leave: _wdLeave),
      weekendWindow: TimeWindow(arrive: _weArrive, leave: _weLeave),
    );
    context.read<DeclaredPlacesCubit>().updatePlace(updated);
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
      decoration: BoxDecoration(color: isDark ? const Color(0xFF2E2F33) : AppColors.highlightColor, borderRadius: BorderRadius.circular(10)),
      child: Row(children: List.generate(labels.length, (i) {
        final active = i == selected;
        return Expanded(child: GestureDetector(
          onTap: () => onChanged(i),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            margin: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: active ? (isDark ? const Color(0xFF3E4147) : Colors.white) : Colors.transparent,
              borderRadius: BorderRadius.circular(8),
              boxShadow: active ? [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 4, offset: const Offset(0, 1))] : null,
            ),
            child: Center(child: Text(labels[i], style: TextStyle(
              fontSize: 13, fontWeight: active ? FontWeight.w600 : FontWeight.w400,
              color: active ? (isDark ? Colors.white : const Color(0xFF1A1D23)) : AppColors.boldHeadlineColor,
            ))),
          ),
        ));
      })),
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
    return '$h:${t.minute.toString().padLeft(2, '0')} ${t.period == DayPeriod.am ? 'AM' : 'PM'}';
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(color: isDark ? const Color(0xFF2E2F33) : AppColors.highlightColor, borderRadius: BorderRadius.circular(12)),
      child: Row(children: [
        Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.boldHeadlineColor)),
        const Spacer(),
        Text(_fmt(time), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primaryColor)),
        const SizedBox(width: 6),
        Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.boldHeadlineColor),
      ]),
    ),
  );
}
