import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/widgets/label_picker_place_type_icon.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_place_name_text_field.dart';
import 'package:airqo/src/app/exposure/widgets/tag_picker_tile.dart';
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
    _nameCtrl = TextEditingController(
      text: widget.existing?.displayName ?? _selectedType.label,
    );
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  String _nameHintForPlaceType(PlaceType t) {
    switch (t) {
      case PlaceType.home:
        return 'e.g. My home';
      case PlaceType.work:
        return 'e.g. Main office';
      case PlaceType.school:
        return 'e.g. Campus or school name';
      case PlaceType.gym:
        return 'e.g. Your gym';
      case PlaceType.family:
        return "e.g. A relative's home";
      case PlaceType.other:
        return 'e.g. Cafe or shop name';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkHighlight : Colors.white;

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      expand: false,
      builder: (ctx, scrollCtrl) {
        return Container(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              const _DragHandle(),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollCtrl,
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 8),
                      Text(
                        'Label this place',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          height: 1.25,
                          color: isDark ? Colors.white : const Color(0xFF1A1D23),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Choose a category.',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          height: 1.45,
                          color: isDark ? AppColors.boldHeadlineColor : AppColors.secondaryHeadlineColor4,
                        ),
                      ),
                      const SizedBox(height: 24),
                      GridView.count(
                        crossAxisCount: 3,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 10,
                        crossAxisSpacing: 10,
                        childAspectRatio: 111 / 78,
                        children: PlaceType.values.map((t) {
                          final sel = _selectedType == t;
                          return TagPickerTile(
                            label: t.label,
                            selected: sel,
                            isDark: isDark,
                            onTap: () => setState(() {
                              _selectedType = t;
                              _nameCtrl.text = t.label;
                            }),
                            icon: LabelPickerPlaceTypeIcon(
                              type: t,
                              selected: sel,
                              size: 24,
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'What should we call this place?',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          height: 1.25,
                          color: isDark ? Colors.white : const Color(0xFF1A1D23),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Shown next to the icon. The place name stays as the title.',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                          height: 1.45,
                          color: isDark
                              ? AppColors.boldHeadlineColor.withValues(alpha: 0.85)
                              : AppColors.secondaryHeadlineColor4,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ExposurePlaceNameTextField(
                        controller: _nameCtrl,
                        hintText: _nameHintForPlaceType(_selectedType),
                        isDark: isDark,
                      ),
                      const SizedBox(height: 28),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _onContinue,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                          ),
                          child: const Text(
                            'Continue',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                          ),
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
    final tag = _nameCtrl.text.trim().isEmpty ? _selectedType.label : _nameCtrl.text.trim();
    final partial = DeclaredPlace(
      siteId: widget.site.id,
      displayName: tag,
      locationName: widget.site.name,
      city: widget.site.searchName,
      type: _selectedType,
      weekdayWindow: widget.existing?.weekdayWindow,
      weekendWindow: widget.existing?.weekendWindow,
      absentOnWeekdays: widget.existing?.absentOnWeekdays ?? false,
      absentOnWeekends: widget.existing?.absentOnWeekends ?? false,
    );
    final cubit = context.read<DeclaredPlacesCubit>();
    Navigator.of(context).pop();

    // All place types collect a schedule via [TimeWindowSheet].
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => BlocProvider.value(
        value: cubit,
        child: TimeWindowSheet(place: partial),
      ),
    );
  }
}

class _DragHandle extends StatelessWidget {
  const _DragHandle();

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Center(
          child: Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.boldHeadlineColor.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),
      );
}
