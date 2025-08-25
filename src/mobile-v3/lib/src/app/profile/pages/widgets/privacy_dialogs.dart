import 'package:airqo/src/meta/utils/date_formatters.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class AddPrivacyZoneDialog extends StatefulWidget {
  final Function(String name, double lat, double lng, double radius) onAddZone;
  final EnhancedLocationServiceManager locationManager;

  const AddPrivacyZoneDialog({
    super.key,
    required this.onAddZone,
    required this.locationManager,
  });

  @override
  State<AddPrivacyZoneDialog> createState() => _AddPrivacyZoneDialogState();
}

class _AddPrivacyZoneDialogState extends State<AddPrivacyZoneDialog>
    with SingleTickerProviderStateMixin {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _radiusController =
      TextEditingController(text: '100');
  final TextEditingController _latController = TextEditingController();
  final TextEditingController _lngController = TextEditingController();
  bool _useCurrentLocation = true;
  bool _isLoading = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _radiusController.dispose();
    _latController.dispose();
    _lngController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: AlertDialog(
        backgroundColor: Theme.of(context).highlightColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.shield_outlined,
                color: Colors.red,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Add Privacy Zone',
              style: TextStyle(
                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                fontWeight: FontWeight.w600,
                fontSize: 18,
              ),
            ),
          ],
        ),
        content: SizedBox(
          width: screenWidth * 0.85,
          height: screenHeight * 0.6,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Create a zone where location tracking will be automatically disabled to protect your privacy.',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDarkMode
                        ? AppColors.secondaryHeadlineColor2
                        : AppColors.secondaryHeadlineColor,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 20),
                _buildSectionHeader('Zone Information'),
                const SizedBox(height: 12),
                _buildTextField(
                  controller: _nameController,
                  label: 'Zone Name',
                  hint: 'e.g., Home, Office, School',
                  icon: Icons.location_city,
                  textCapitalization: TextCapitalization.words,
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  controller: _radiusController,
                  label: 'Radius (meters)',
                  hint: '100',
                  icon: Icons.radio_button_unchecked,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  suffix: 'm',
                ),
                const SizedBox(height: 20),
                _buildSectionHeader('Location'),
                const SizedBox(height: 12),
                _buildLocationToggle(),
                if (!_useCurrentLocation) ...[
                  const SizedBox(height: 16),
                  _buildCoordinatesSection(),
                ],
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : () => Navigator.pop(context),
            style: TextButton.styleFrom(
              foregroundColor: isDarkMode ? Colors.grey[400] : Colors.grey[700],
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'Cancel',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
          ),
          ElevatedButton.icon(
            onPressed: _isLoading ? null : _handleAddZone,
            icon: _isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Icon(Icons.add_location, size: 18, color: Colors.white),
            label: const Text('Add Zone'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
              textStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
        actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
        contentPadding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
        titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Text(
      title,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    TextCapitalization? textCapitalization,
    String? suffix,
  }) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      textCapitalization: textCapitalization ?? TextCapitalization.none,
      style: TextStyle(
        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
        fontSize: 16,
      ),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        suffixText: suffix,
        labelStyle: TextStyle(
          color: isDarkMode
              ? AppColors.secondaryHeadlineColor2
              : AppColors.secondaryHeadlineColor,
          fontSize: 14,
        ),
        hintStyle: TextStyle(
          color: isDarkMode
              ? AppColors.secondaryHeadlineColor2.withOpacity(0.7)
              : AppColors.secondaryHeadlineColor.withOpacity(0.7),
          fontSize: 16,
        ),
        suffixStyle: TextStyle(
          color: isDarkMode
              ? AppColors.secondaryHeadlineColor2
              : AppColors.secondaryHeadlineColor,
          fontSize: 14,
        ),
        prefixIcon: Container(
          margin: const EdgeInsets.all(12),
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            icon,
            color: AppColors.primaryColor,
            size: 20,
          ),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: isDarkMode
                ? AppColors.dividerColordark
                : AppColors.dividerColorlight,
            width: 1,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: isDarkMode
                ? AppColors.dividerColordark
                : AppColors.dividerColorlight,
            width: 1,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: AppColors.primaryColor,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(
            color: Colors.red,
            width: 1,
          ),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }

  Widget _buildLocationToggle() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            setState(() {
              _useCurrentLocation = !_useCurrentLocation;
            });
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _useCurrentLocation
                        ? AppColors.primaryColor.withOpacity(0.1)
                        : Colors.grey.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Icon(
                    _useCurrentLocation ? Icons.my_location : Icons.location_on,
                    color: _useCurrentLocation
                        ? AppColors.primaryColor
                        : Colors.grey,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Use current location',
                        style: TextStyle(
                          color: isDarkMode
                              ? Colors.white
                              : AppColors.boldHeadlineColor4,
                          fontWeight: FontWeight.w500,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Zone will be created at your current position',
                        style: TextStyle(
                          color: isDarkMode
                              ? AppColors.secondaryHeadlineColor2
                              : AppColors.secondaryHeadlineColor,
                          fontSize: 13,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: _useCurrentLocation,
                  onChanged: (value) {
                    setState(() {
                      _useCurrentLocation = value;
                    });
                  },
                  activeColor: Colors.white,
                  activeTrackColor: AppColors.primaryColor,
                  inactiveThumbColor: Colors.white,
                  inactiveTrackColor:
                      isDarkMode ? Colors.grey[700] : Colors.grey[300],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCoordinatesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Manual Coordinates',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.secondaryHeadlineColor2
                : AppColors.secondaryHeadlineColor,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _latController,
                label: 'Latitude',
                hint: '0.0000',
                icon: Icons.north,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                controller: _lngController,
                label: 'Longitude',
                hint: '0.0000',
                icon: Icons.east,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _handleAddZone() async {
    if (_nameController.text.trim().isEmpty) {
      _showSnackBar('Please enter a zone name');
      return;
    }

    final radius = double.tryParse(_radiusController.text) ?? 100;
    if (radius <= 0 || radius > 10000) {
      _showSnackBar('Radius must be between 1 and 10,000 meters');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      double lat = 0, lng = 0;

      if (_useCurrentLocation) {
        final result = await widget.locationManager.getCurrentPosition();
        
        if (result.isSuccess && result.position != null) {
          lat = result.position!.latitude;
          lng = result.position!.longitude;
        } else {
          _showSnackBar('Could not get current location: ${result.error}');
          return;
        }
      } else {
        final latParsed = double.tryParse(_latController.text);
        final lngParsed = double.tryParse(_lngController.text);

        if (latParsed == null || lngParsed == null) {
          _showSnackBar('Please enter valid coordinates');
          return;
        }

        lat = latParsed;
        lng = lngParsed;

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          _showSnackBar(
              'Please enter valid latitude (-90 to 90) and longitude (-180 to 180)');
          return;
        }
      }

      await widget.onAddZone(_nameController.text.trim(), lat, lng, radius);
      if (mounted) {
        Navigator.pop(context);
        _showSuccessSnackBar(
            'Privacy zone "${_nameController.text.trim()}" created successfully');
      }
    } catch (e) {
      _showSnackBar('Failed to create privacy zone: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  void _showSuccessSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text(message)),
            ],
          ),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }
}

// Delete Data Range Dialog
class DeleteDataRangeDialog extends StatefulWidget {
  final Function(DateTime start, DateTime end) onDeleteRange;

  const DeleteDataRangeDialog({super.key, required this.onDeleteRange});

  @override
  State<DeleteDataRangeDialog> createState() => _DeleteDataRangeDialogState();
}

class _DeleteDataRangeDialogState extends State<DeleteDataRangeDialog>
    with SingleTickerProviderStateMixin {
  DateTime? _startDate;
  DateTime? _endDate;
  bool _isLoading = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: AlertDialog(
        backgroundColor: Theme.of(context).highlightColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.delete_sweep,
                color: Colors.red,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Delete Data Range',
              style: TextStyle(
                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                fontWeight: FontWeight.w600,
                fontSize: 18,
              ),
            ),
          ],
        ),
        content: SizedBox(
          width: screenWidth * 0.85,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.red.withOpacity(0.2),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.warning_amber_rounded,
                      color: Colors.red,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'This action cannot be undone. Select the date range for location data you want to permanently delete.',
                        style: TextStyle(
                          color: Colors.red.shade700,
                          fontSize: 14,
                          height: 1.4,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              _buildDateSelector(
                label: 'Start Date',
                date: _startDate,
                icon: Icons.calendar_today,
                onTap: _selectStartDate,
              ),
              const SizedBox(height: 16),
              _buildDateSelector(
                label: 'End Date',
                date: _endDate,
                icon: Icons.event,
                onTap: _selectEndDate,
              ),
              if (_startDate != null && _endDate != null) ...[
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDarkMode
                        ? AppColors.darkHighlight.withOpacity(0.5)
                        : AppColors.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Summary',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: isDarkMode
                              ? Colors.white
                              : AppColors.boldHeadlineColor4,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Delete data from ${_formatDate(_startDate!)} to ${_formatDate(_endDate!)}',
                        style: TextStyle(
                          fontSize: 14,
                          color: isDarkMode
                              ? AppColors.secondaryHeadlineColor2
                              : AppColors.secondaryHeadlineColor,
                        ),
                      ),
                      Text(
                        'Duration: ${_endDate!.difference(_startDate!).inDays + 1} days',
                        style: TextStyle(
                          fontSize: 14,
                          color: isDarkMode
                              ? AppColors.secondaryHeadlineColor2
                              : AppColors.secondaryHeadlineColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : () => Navigator.pop(context),
            style: TextButton.styleFrom(
              foregroundColor: isDarkMode ? Colors.grey[400] : Colors.grey[700],
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'Cancel',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
          ),
          ElevatedButton.icon(
            onPressed: _isLoading || _startDate == null || _endDate == null
                ? null
                : _handleDeleteRange,
            icon: _isLoading
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Icon(Icons.delete_forever, size: 18),
            label: const Text('Delete Range'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
              textStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
        actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
        contentPadding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
        titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
      ),
    );
  }

  Widget _buildDateSelector({
    required String label,
    required DateTime? date,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Icon(
                    icon,
                    color: AppColors.primaryColor,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: TextStyle(
                          color: isDarkMode
                              ? Colors.white
                              : AppColors.boldHeadlineColor4,
                          fontWeight: FontWeight.w500,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        date != null
                            ? _formatDate(date)
                            : 'Select $label'.toLowerCase(),
                        style: TextStyle(
                          color: date != null
                              ? (isDarkMode
                                  ? AppColors.secondaryHeadlineColor2
                                  : AppColors.secondaryHeadlineColor)
                              : Colors.grey,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: isDarkMode
                      ? AppColors.secondaryHeadlineColor2
                      : AppColors.secondaryHeadlineColor,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _selectStartDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate:
          _startDate ?? DateTime.now().subtract(const Duration(days: 30)),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
                  primary: AppColors.primaryColor,
                  onPrimary: Colors.white,
                  surface: Theme.of(context).highlightColor,
                  onSurface: Theme.of(context).brightness == Brightness.dark
                      ? Colors.white
                      : AppColors.boldHeadlineColor4,
                ),
          ),
          child: child!,
        );
      },
    );

    if (date != null) {
      setState(() {
        _startDate = date;
        // If end date is before start date, clear it
        if (_endDate != null && _endDate!.isBefore(date)) {
          _endDate = null;
        }
      });
    }
  }

  Future<void> _selectEndDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _endDate ?? DateTime.now(),
      firstDate:
          _startDate ?? DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
                  primary: AppColors.primaryColor,
                  onPrimary: Colors.white,
                  surface: Theme.of(context).highlightColor,
                  onSurface: Theme.of(context).brightness == Brightness.dark
                      ? Colors.white
                      : AppColors.boldHeadlineColor4,
                ),
          ),
          child: child!,
        );
      },
    );

    if (date != null) {
      setState(() {
        _endDate = date;
      });
    }
  }

  Future<void> _handleDeleteRange() async {
    if (_startDate == null || _endDate == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      await widget.onDeleteRange(_startDate!, _endDate!);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white, size: 20),
                SizedBox(width: 8),
                Expanded(child: Text('Location data deleted successfully')),
              ],
            ),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to delete data: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}

// Location Detail Dialog
class LocationDetailDialog extends StatefulWidget {
  final LocationDataPoint point;

  const LocationDetailDialog({super.key, required this.point});

  @override
  State<LocationDetailDialog> createState() => _LocationDetailDialogState();
}

class _LocationDetailDialogState extends State<LocationDetailDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutBack),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: AlertDialog(
          backgroundColor: Theme.of(context).highlightColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: widget.point.isSharedWithResearchers
                      ? Colors.green.withOpacity(0.1)
                      : Colors.grey.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  widget.point.isSharedWithResearchers
                      ? Icons.share
                      : Icons.location_on,
                  color: widget.point.isSharedWithResearchers
                      ? Colors.green
                      : AppColors.primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Location Details',
                style: TextStyle(
                  color:
                      isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                  fontWeight: FontWeight.w600,
                  fontSize: 18,
                ),
              ),
            ],
          ),
          content: SizedBox(
            width: screenWidth * 0.85,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildDetailSection(),
                const SizedBox(height: 20),
                _buildSharingStatusCard(),
              ],
            ),
          ),
          actions: [
            TextButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.close, size: 18),
              label: const Text('Close'),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.primaryColor,
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
          actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
          contentPadding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
          titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
        ),
      ),
    );
  }

  Widget _buildDetailSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDarkMode
            ? AppColors.darkHighlight.withOpacity(0.5)
            : Colors.grey.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
          width: 0.5,
        ),
      ),
      child: Column(
        children: [
          _buildDetailRow(
            'Timestamp',
            DateFormatters.formatDateTime(widget.point.timestamp),
            Icons.schedule,
          ),
          const SizedBox(height: 12),
          _buildDetailRow(
            'Coordinates',
            '${widget.point.latitude.toStringAsFixed(6)}, ${widget.point.longitude.toStringAsFixed(6)}',
            Icons.location_on,
            isMonospace: true,
          ),
          const SizedBox(height: 12),
          _buildDetailRow(
            'Accuracy',
            '${widget.point.accuracy != null ? widget.point.accuracy!.toStringAsFixed(1) : 'N/A'} meters',
            Icons.my_location,
          ),
          const SizedBox(height: 12),
          _buildDetailRow(
            'Recorded',
            DateFormatters.formatTimeAgo(widget.point.timestamp),
            Icons.history,
          ),
        ],
      ),
    );
  }

  Widget _buildSharingStatusCard() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final isShared = widget.point.isSharedWithResearchers;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isShared
            ? Colors.green.withOpacity(0.1)
            : Colors.grey.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isShared
              ? Colors.green.withOpacity(0.3)
              : Colors.grey.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isShared ? Icons.share : Icons.lock,
                color: isShared ? Colors.green : Colors.grey,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Sharing Status',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color:
                      isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            isShared
                ? 'This location point is shared with researchers for air quality research.'
                : 'This location point is kept private and not shared with researchers.',
            style: TextStyle(
              fontSize: 14,
              color: isDarkMode
                  ? AppColors.secondaryHeadlineColor2
                  : AppColors.secondaryHeadlineColor,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: isShared ? Colors.green : Colors.grey,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              isShared ? 'Shared with Researchers' : 'Private',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon,
      {bool isMonospace = false}) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: AppColors.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            icon,
            size: 16,
            color: AppColors.primaryColor,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                  color:
                      isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  fontFamily: isMonospace ? 'monospace' : null,
                  color: isDarkMode
                      ? AppColors.secondaryHeadlineColor2
                      : AppColors.secondaryHeadlineColor,
                  fontSize: 14,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// Location Permission Dialog
class LocationPermissionDialog extends StatefulWidget {
  final String title;
  final String message;
  final VoidCallback? onOpenSettings;

  const LocationPermissionDialog({
    super.key,
    required this.title,
    required this.message,
    this.onOpenSettings,
  });

  @override
  State<LocationPermissionDialog> createState() =>
      _LocationPermissionDialogState();
}

class _LocationPermissionDialogState extends State<LocationPermissionDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutBack),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: AlertDialog(
          backgroundColor: Theme.of(context).highlightColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Text(
            widget.title,
            style: TextStyle(
              color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
              fontWeight: FontWeight.w600,
              fontSize: 18,
            ),
          ),
          content: SizedBox(
            width: screenWidth * 0.8,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: const Icon(
                    Icons.location_off,
                    size: 48,
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  widget.message,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: isDarkMode
                        ? AppColors.secondaryHeadlineColor2
                        : AppColors.secondaryHeadlineColor,
                    height: 1.5,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              style: TextButton.styleFrom(
                foregroundColor:
                    isDarkMode ? Colors.grey[400] : Colors.grey[700],
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Cancel',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
            ),
            if (widget.onOpenSettings != null)
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  widget.onOpenSettings!();
                },
                icon: const Icon(Icons.settings, size: 18),
                label: const Text('Open Settings'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                  textStyle: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
          actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
          contentPadding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
          titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
        ),
      ),
    );
  }
}
