import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/widgets/time_window_sheet.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class LabelPickerSheet extends StatefulWidget {
  final SelectedSite site;
  final DeclaredPlace? existing;
  const LabelPickerSheet({super.key, required this.site, this.existing});

  @override
  State<LabelPickerSheet> createState() => _LabelPickerSheetState();
}

class _LabelPickerSheetState extends State<LabelPickerSheet> {
  late PlaceType _selectedType;
  late TextEditingController _nameCtrl;

  @override
  void initState() {
    super.initState();
    _selectedType = widget.existing?.type ?? PlaceType.home;
    _nameCtrl = TextEditingController(text: widget.existing?.displayName ?? widget.site.name);
  }

  @override
  void dispose() { _nameCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkHighlight : Colors.white;

    return DraggableScrollableSheet(
      initialChildSize: 0.75, minChildSize: 0.4, maxChildSize: 0.92, expand: false,
      builder: (ctx, scrollCtrl) {
        return Container(
          decoration: BoxDecoration(color: bg, borderRadius: const BorderRadius.vertical(top: Radius.circular(20))),
          child: Column(
            children: [
              _DragHandle(),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollCtrl,
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 8),
                      Text('What kind of place is this?',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700,
                              color: isDark ? Colors.white : const Color(0xFF1A1D23))),
                      const SizedBox(height: 20),
                      GridView.count(
                        crossAxisCount: 3, shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 1.1,
                        children: PlaceType.values.map((t) {
                          final sel = _selectedType == t;
                          return GestureDetector(
                            onTap: () => setState(() => _selectedType = t),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              decoration: BoxDecoration(
                                color: sel
                                    ? (isDark ? AppColors.primaryColor.withValues(alpha: 0.2) : const Color(0xFFEEF3FF))
                                    : (isDark ? const Color(0xFF2E2F33) : AppColors.highlightColor),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: sel ? AppColors.primaryColor : Colors.transparent, width: 1.5),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(t.icon, size: 24, color: sel ? AppColors.primaryColor : AppColors.boldHeadlineColor),
                                  const SizedBox(height: 6),
                                  Text(t.label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                                      color: sel ? AppColors.primaryColor : AppColors.boldHeadlineColor)),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 24),
                      Text('Name', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.boldHeadlineColor)),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _nameCtrl,
                        textCapitalization: TextCapitalization.words,
                        decoration: InputDecoration(
                          hintText: 'e.g. My Home',
                          hintStyle: TextStyle(color: AppColors.boldHeadlineColor.withValues(alpha: 0.5)),
                          filled: true,
                          fillColor: isDark ? const Color(0xFF2E2F33) : AppColors.highlightColor,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                      ),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _onContinue,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryColor, foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                          child: const Text('Continue', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
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

  void _onContinue() {
    final name = _nameCtrl.text.trim().isEmpty ? widget.site.name : _nameCtrl.text.trim();
    final partial = DeclaredPlace(
      siteId: widget.site.id,
      displayName: name,
      city: widget.site.searchName,
      type: _selectedType,
      weekdayWindow: widget.existing?.weekdayWindow,
      weekendWindow: widget.existing?.weekendWindow,
    );
    final cubit = context.read<DeclaredPlacesCubit>();
    Navigator.of(context).pop();

    if (_selectedType.requiresTimeWindow) {
      showModalBottomSheet(
        context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
        builder: (_) => BlocProvider.value(value: cubit, child: TimeWindowSheet(place: partial)),
      );
    } else {
      cubit.addPlace(partial);
    }
  }
}

class _DragHandle extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Center(child: Container(width: 36, height: 4,
        decoration: BoxDecoration(color: AppColors.boldHeadlineColor.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
  );
}
