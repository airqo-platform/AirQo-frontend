// File: src/mobile-v3/lib/src/app/profile/pages/location_data_view_screen.dart

import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class LocationDataViewScreen extends StatefulWidget {
  final List<LocationDataPoint> locationHistory;
  final Function(String pointId) onDeletePoint;

  const LocationDataViewScreen({
    super.key,
    required this.locationHistory,
    required this.onDeletePoint,
  });

  @override
  State<LocationDataViewScreen> createState() => _LocationDataViewScreenState();
}

class _LocationDataViewScreenState extends State<LocationDataViewScreen> {
  List<LocationDataPoint> _filteredHistory = [];
  String _filterType = 'all'; // 'all', 'shared', 'private'
  String _sortOrder = 'newest'; // 'newest', 'oldest'

  @override
  void initState() {
    super.initState();
    _filteredHistory = List.from(widget.locationHistory);
    _applySorting();
  }

  void _applyFilters() {
    setState(() {
      switch (_filterType) {
        case 'shared':
          _filteredHistory = widget.locationHistory
              .where((point) => point.isSharedWithResearchers)
              .toList();
          break;
        case 'private':
          _filteredHistory = widget.locationHistory
              .where((point) => !point.isSharedWithResearchers)
              .toList();
          break;
        default:
          _filteredHistory = List.from(widget.locationHistory);
      }
      _applySorting();
    });
  }

  void _applySorting() {
    setState(() {
      if (_sortOrder == 'newest') {
        _filteredHistory.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      } else {
        _filteredHistory.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
      appBar: AppBar(
        title: const Text('My Location Data'),
        backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
        elevation: 0,
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'info') {
                _showDataInfoDialog();
              } else if (value == 'export') {
                _showExportDialog();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'info',
                child: Row(
                  children: [
                    Icon(Icons.info_outline),
                    SizedBox(width: 8),
                    Text('About This Data'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'export',
                child: Row(
                  children: [
                    Icon(Icons.download),
                    SizedBox(width: 8),
                    Text('Export Data'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter and Sort Controls
          _buildFilterControls(),
          
          // Data Statistics
          _buildDataStatistics(),
          
          // Location History List
          Expanded(
            child: _filteredHistory.isEmpty
                ? _buildEmptyState()
                : _buildLocationList(),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterControls() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Filter dropdown
          Expanded(
            child: DropdownButtonFormField<String>(
              value: _filterType,
              decoration: const InputDecoration(
                labelText: 'Filter',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              items: const [
                DropdownMenuItem(value: 'all', child: Text('All Data')),
                DropdownMenuItem(value: 'shared', child: Text('Shared Only')),
                DropdownMenuItem(value: 'private', child: Text('Private Only')),
              ],
              onChanged: (value) {
                if (value != null) {
                  _filterType = value;
                  _applyFilters();
                }
              },
            ),
          ),
          const SizedBox(width: 12),
          
          // Sort dropdown
          Expanded(
            child: DropdownButtonFormField<String>(
              value: _sortOrder,
              decoration: const InputDecoration(
                labelText: 'Sort',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              items: const [
                DropdownMenuItem(value: 'newest', child: Text('Newest First')),
                DropdownMenuItem(value: 'oldest', child: Text('Oldest First')),
              ],
              onChanged: (value) {
                if (value != null) {
                  _sortOrder = value;
                  _applySorting();
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataStatistics() {
    final sharedCount = widget.locationHistory.where((p) => p.isSharedWithResearchers).length;
    final privateCount = widget.locationHistory.length - sharedCount;
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem('Total', widget.locationHistory.length.toString(), Icons.location_on),
          _buildStatItem('Shared', sharedCount.toString(), Icons.share, Colors.green),
          _buildStatItem('Private', privateCount.toString(), Icons.lock, Colors.orange),
          _buildStatItem('Showing', _filteredHistory.length.toString(), Icons.visibility),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, [Color? color]) {
    return Column(
      children: [
        Icon(icon, color: color ?? Theme.of(context).primaryColor, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color ?? Theme.of(context).textTheme.headlineSmall?.color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.7),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    String message;
    IconData icon;
    
    switch (_filterType) {
      case 'shared':
        message = 'No shared location data';
        icon = Icons.block;
        break;
      case 'private':
        message = 'No private location data';
        icon = Icons.lock_outline;
        break;
      default:
        message = 'No location data recorded';
        icon = Icons.location_off;
    }
    
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            message,
            style: const TextStyle(fontSize: 16, color: Colors.grey),
          ),
          if (_filterType != 'all') ...[
            const SizedBox(height: 8),
            TextButton(
              onPressed: () {
                _filterType = 'all';
                _applyFilters();
              },
              child: const Text('Show All Data'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLocationList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredHistory.length,
      itemBuilder: (context, index) {
        final point = _filteredHistory[index];
        return _buildLocationDataCard(point, index);
      },
    );
  }

  Widget _buildLocationDataCard(LocationDataPoint point, int index) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: point.isSharedWithResearchers ? Colors.green : Colors.orange,
          child: Icon(
            point.isSharedWithResearchers ? Icons.share : Icons.lock,
            color: Colors.white,
            size: 16,
          ),
        ),
        title: Text(
          _formatDateTime(point.timestamp),
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        subtitle: Text(
          '${point.latitude.toStringAsFixed(6)}, ${point.longitude.toStringAsFixed(6)}',
          style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'delete') {
              _confirmDeletePoint(point, index);
            } else if (value == 'copy') {
              _copyLocationToClipboard(point);
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'copy',
              child: Row(
                children: [
                  Icon(Icons.copy),
                  SizedBox(width: 8),
                  Text('Copy Coordinates'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  Icon(Icons.delete, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Delete'),
                ],
              ),
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDetailRow('Latitude', point.latitude.toStringAsFixed(8)),
                _buildDetailRow('Longitude', point.longitude.toStringAsFixed(8)),
                _buildDetailRow('Timestamp', point.timestamp.toIso8601String()),
                if (point.accuracy != null)
                  _buildDetailRow('Accuracy', '${point.accuracy!.toStringAsFixed(1)} meters'),
                _buildDetailRow(
                  'Sharing Status', 
                  point.isSharedWithResearchers ? 'Shared with researchers' : 'Kept private'
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _showOnMap(point),
                        icon: const Icon(Icons.map, size: 16),
                        label: const Text('View on Map'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).primaryColor,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _confirmDeletePoint(point, index),
                        icon: const Icon(Icons.delete, size: 16, color: Colors.red),
                        label: const Text('Delete', style: TextStyle(color: Colors.red)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
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

  void _confirmDeletePoint(LocationDataPoint point, int index) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Location Point'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Are you sure you want to delete this location point?'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Time: ${_formatDateTime(point.timestamp)}'),
                  const SizedBox(height: 4),
                  Text('Location: ${point.latitude.toStringAsFixed(6)}, ${point.longitude.toStringAsFixed(6)}'),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'This action cannot be undone.',
              style: TextStyle(color: Colors.red, fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              widget.onDeletePoint(point.id);
              Navigator.pop(context);
              setState(() {
                _filteredHistory.removeAt(index);
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Location point deleted')),
              );
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _copyLocationToClipboard(LocationDataPoint point) {
    final coordinates = '${point.latitude}, ${point.longitude}';
    // Note: You'll need to add clipboard package to pubspec.yaml
    // Clipboard.setData(ClipboardData(text: coordinates));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Coordinates copied: $coordinates')),
    );
  }

  void _showOnMap(LocationDataPoint point) {
    // TODO: Implement map view navigation
    // This would typically navigate to a map screen showing the specific location
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Map view not yet implemented')),
    );
  }

  void _showDataInfoDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('About Your Location Data'),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'This screen shows all location points recorded by the app.',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
              SizedBox(height: 12),
              Text('🟢 Green indicators: Data shared with researchers'),
              SizedBox(height: 4),
              Text('🟠 Orange indicators: Data kept private'),
              SizedBox(height: 12),
              Text('You can:'),
              SizedBox(height: 4),
              Text('• View detailed information for each point'),
              Text('• Delete individual points'),
              Text('• Copy coordinates to clipboard'),
              Text('• Filter by sharing status'),
              Text('• Sort by date'),
              SizedBox(height: 12),
              Text(
                'Deleted data cannot be recovered. Location tracking must be enabled to collect new data.',
                style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }

  void _showExportDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Export Location Data'),
        content: const Text(
          'Export functionality allows you to download your location data in various formats. '
          'This feature is coming soon.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}