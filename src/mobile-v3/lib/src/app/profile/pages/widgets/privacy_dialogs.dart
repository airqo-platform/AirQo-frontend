// File: src/mobile-v3/lib/src/app/profile/widgets/privacy_dialogs.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';

// Add Privacy Zone Dialog
class AddPrivacyZoneDialog extends StatefulWidget {
  final Function(String name, double lat, double lng, double radius) onAddZone;

  const AddPrivacyZoneDialog({super.key, required this.onAddZone});

  @override
  State<AddPrivacyZoneDialog> createState() => _AddPrivacyZoneDialogState();
}

class _AddPrivacyZoneDialogState extends State<AddPrivacyZoneDialog> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _radiusController = TextEditingController(text: '100');
  final TextEditingController _latController = TextEditingController();
  final TextEditingController _lngController = TextEditingController();
  bool _useCurrentLocation = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _radiusController.dispose();
    _latController.dispose();
    _lngController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Privacy Zone'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Zone Name',
                hintText: 'e.g., Home, Office, School',
                border: OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: 16),
            
            TextField(
              controller: _radiusController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(
                labelText: 'Radius (meters)',
                hintText: '100',
                border: OutlineInputBorder(),
                suffixText: 'm',
              ),
            ),
            const SizedBox(height: 16),
            
            CheckboxListTile(
              title: const Text('Use current location'),
              subtitle: const Text('Zone will be created at your current position'),
              value: _useCurrentLocation,
              onChanged: (value) {
                setState(() {
                  _useCurrentLocation = value ?? true;
                  if (!_useCurrentLocation) {
                    // Clear controllers when switching to manual entry
                    _latController.clear();
                    _lngController.clear();
                  }
                });
              },
              contentPadding: EdgeInsets.zero,
            ),
            
            if (!_useCurrentLocation) ...[
              const SizedBox(height: 8),
              TextField(
                controller: _latController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Latitude',
                  hintText: '0.3476',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _lngController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Longitude',
                  hintText: '32.5825',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
            
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Colors.blue, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Location tracking will be automatically disabled when you enter this zone.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue.shade700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: _isLoading ? null : _handleAddZone,
          child: _isLoading 
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Add Zone'),
        ),
      ],
    );
  }

  Future<void> _handleAddZone() async {
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a zone name')),
      );
      return;
    }

    final radius = double.tryParse(_radiusController.text) ?? 100;
    if (radius <= 0 || radius > 10000) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Radius must be between 1 and 10,000 meters')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      double lat = 0, lng = 0;
      
      if (_useCurrentLocation) {
        final locationManager = EnhancedLocationServiceManager();
        final result = await locationManager.getCurrentPosition();
        if (result.isSuccess && result.position != null) {
          lat = result.position!.latitude;
          lng = result.position!.longitude;
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not get current location: ${result.error}')),
          );
          return;
        }
      } else {
        lat = double.tryParse(_latController.text) ?? 0;
        lng = double.tryParse(_lngController.text) ?? 0;
        
        if (lat == 0 || lng == 0) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please enter valid coordinates')),
          );
          return;
        }
        
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Please enter valid latitude (-90 to 90) and longitude (-180 to 180)')),
          );
          return;
        }
      }
      
      await widget.onAddZone(_nameController.text.trim(), lat, lng, radius);
      Navigator.pop(context);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Privacy zone "${_nameController.text.trim()}" created')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create privacy zone: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
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

class _DeleteDataRangeDialogState extends State<DeleteDataRangeDialog> {
  DateTime? _startDate;
  DateTime? _endDate;
  TimeOfDay _startTime = const TimeOfDay(hour: 0, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 23, minute: 59);

  @override
  Widget build(BuildContext context) {
    final canDelete = _startDate != null && _endDate != null;
    final startDateTime = _startDate != null 
        ? DateTime(_startDate!.year, _startDate!.month, _startDate!.day, _startTime.hour, _startTime.minute)
        : null;
    final endDateTime = _endDate != null 
        ? DateTime(_endDate!.year, _endDate!.month, _endDate!.day, _endTime.hour, _endTime.minute)
        : null;
    
    return AlertDialog(
      title: const Text('Delete Data Range'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select the time range for data deletion:',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            
            // Start Date
            ListTile(
              leading: const Icon(Icons.calendar_today),
              title: const Text('Start Date'),
              subtitle: Text(_startDate?.toString().split(' ')[0] ?? 'Not selected'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _selectStartDate(),
              contentPadding: EdgeInsets.zero,
            ),
            
            // Start Time
            if (_startDate != null)
              ListTile(
                leading: const Icon(Icons.access_time),
                title: const Text('Start Time'),
                subtitle: Text(_startTime.format(context)),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => _selectStartTime(),
                contentPadding: EdgeInsets.zero,
              ),
            
            const Divider(),
            
            // End Date
            ListTile(
              leading: const Icon(Icons.calendar_today),
              title: const Text('End Date'),
              subtitle: Text(_endDate?.toString().split(' ')[0] ?? 'Not selected'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _selectEndDate(),
              contentPadding: EdgeInsets.zero,
            ),
            
            // End Time
            if (_endDate != null)
              ListTile(
                leading: const Icon(Icons.access_time),
                title: const Text('End Time'),
                subtitle: Text(_endTime.format(context)),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => _selectEndTime(),
                contentPadding: EdgeInsets.zero,
              ),
            
            if (canDelete) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.warning, color: Colors.red, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Deletion Summary',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('From: ${_formatDateTime(startDateTime!)}'),
                    Text('To: ${_formatDateTime(endDateTime!)}'),
                    const SizedBox(height: 8),
                    const Text(
                      'This action cannot be undone. All location data in this time range will be permanently deleted.',
                      style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
                    ),
                  ],
                ),
              ),
            ],
            
            const SizedBox(height: 16),
            Row(
              children: [
                TextButton.icon(
                  onPressed: () => _setQuickRange('today'),
                  icon: const Icon(Icons.today, size: 16),
                  label: const Text('Today', style: TextStyle(fontSize: 12)),
                ),
                TextButton.icon(
                  onPressed: () => _setQuickRange('week'),
                  icon: const Icon(Icons.date_range, size: 16),
                  label: const Text('This Week', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: canDelete
              ? () {
                  widget.onDeleteRange(startDateTime!, endDateTime!);
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Location data deleted for selected range')),
                  );
                }
              : null,
          child: const Text('Delete', style: TextStyle(color: Colors.red)),
        ),
      ],
    );
  }

  Future<void> _selectStartDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _startDate ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: _endDate ?? DateTime.now(),
    );
    if (date != null) {
      setState(() {
        _startDate = date;
      });
    }
  }

  Future<void> _selectEndDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _endDate ?? DateTime.now(),
      firstDate: _startDate ?? DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
    );
    if (date != null) {
      setState(() {
        _endDate = date;
      });
    }
  }

  Future<void> _selectStartTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _startTime,
    );
    if (time != null) {
      setState(() {
        _startTime = time;
      });
    }
  }

  Future<void> _selectEndTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _endTime,
    );
    if (time != null) {
      setState(() {
        _endTime = time;
      });
    }
  }

  void _setQuickRange(String range) {
    final now = DateTime.now();
    setState(() {
      switch (range) {
        case 'today':
          _startDate = DateTime(now.year, now.month, now.day);
          _endDate = DateTime(now.year, now.month, now.day);
          _startTime = const TimeOfDay(hour: 0, minute: 0);
          _endTime = const TimeOfDay(hour: 23, minute: 59);
          break;
        case 'week':
          final weekStart = now.subtract(Duration(days: now.weekday - 1));
          _startDate = DateTime(weekStart.year, weekStart.month, weekStart.day);
          _endDate = DateTime(now.year, now.month, now.day);
          _startTime = const TimeOfDay(hour: 0, minute: 0);
          _endTime = const TimeOfDay(hour: 23, minute: 59);
          break;
      }
    });
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}/${dateTime.year} '
           '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}

// Privacy Zone Info Dialog
class PrivacyZoneInfoDialog extends StatelessWidget {
  final PrivacyZone zone;

  const PrivacyZoneInfoDialog({super.key, required this.zone});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(zone.name),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoRow('Latitude', zone.latitude.toStringAsFixed(6)),
          _buildInfoRow('Longitude', zone.longitude.toStringAsFixed(6)),
          _buildInfoRow('Radius', '${zone.radius.toInt()} meters'),
          _buildInfoRow('Created', _formatDateTime(zone.createdAt)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              children: [
                Icon(Icons.shield, color: Colors.red, size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Location tracking is automatically disabled when you enter this zone.',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontFamily: 'monospace'),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}/${dateTime.year} '
           '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}

// Location Permission Dialog
class LocationPermissionDialog extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.location_off,
            size: 48,
            color: Colors.orange,
          ),
          const SizedBox(height: 16),
          Text(message),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        if (onOpenSettings != null)
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              onOpenSettings!();
            },
            child: const Text('Open Settings'),
          ),
      ],
    );
  }
}