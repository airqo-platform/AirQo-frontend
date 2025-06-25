
import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class DataSharingScreen extends StatefulWidget {
  final List<LocationDataPoint> locationHistory;
  final Function(String pointId, bool share) onUpdateSharing;

  const DataSharingScreen({
    super.key,
    required this.locationHistory,
    required this.onUpdateSharing,
  });

  @override
  State<DataSharingScreen> createState() => _DataSharingScreenState();
}

class _DataSharingScreenState extends State<DataSharingScreen> {
  List<LocationDataPoint> _filteredHistory = [];
  String _filterType = 'all'; // 'all', 'shared', 'private'
  bool _selectMode = false;
  final Set<String> _selectedPoints = {};

  @override
  void initState() {
    super.initState();
    _filteredHistory = List.from(widget.locationHistory);
    _applyFilters();
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
      // Sort by newest first
      _filteredHistory.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      
      // Clear selection when filter changes
      _selectedPoints.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final sharedCount = widget.locationHistory.where((p) => p.isSharedWithResearchers).length;
    
    return Scaffold(
      backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
      appBar: AppBar(
        title: Text(_selectMode ? '${_selectedPoints.length} selected' : 'Data Sharing'),
        backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
        elevation: 0,
        leading: _selectMode 
            ? IconButton(
                icon: const Icon(Icons.close),
                onPressed: () {
                  setState(() {
                    _selectMode = false;
                    _selectedPoints.clear();
                  });
                },
              )
            : IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
        actions: _selectMode ? [
          TextButton(
            onPressed: _selectedPoints.isEmpty ? null : () => _bulkUpdateSelected(true),
            child: const Text('Share', style: TextStyle(color: Colors.green)),
          ),
          TextButton(
            onPressed: _selectedPoints.isEmpty ? null : () => _bulkUpdateSelected(false),
            child: const Text('Private', style: TextStyle(color: Colors.orange)),
          ),
        ] : [
          IconButton(
            icon: const Icon(Icons.help_outline),
            onPressed: () => _showHelpDialog(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Data sharing overview
          _buildSharingOverview(sharedCount),
          
          // Quick actions
          _buildQuickActions(),
          
          // Filter controls
          _buildFilterControls(),
          
          // Location data list
          Expanded(
            child: _filteredHistory.isEmpty
                ? _buildEmptyState()
                : _buildLocationList(),
          ),
        ],
      ),
      floatingActionButton: !_selectMode ? FloatingActionButton(
        onPressed: () {
          setState(() {
            _selectMode = true;
          });
        },
        child: const Icon(Icons.checklist),
        tooltip: 'Select Multiple',
      ) : null,
    );
  }

  Widget _buildSharingOverview(int sharedCount) {
    final totalCount = widget.locationHistory.length;
    final privateCount = totalCount - sharedCount;
    final sharePercentage = totalCount > 0 ? (sharedCount / totalCount * 100).round() : 0;
    
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).primaryColor.withOpacity(0.1),
            Theme.of(context).primaryColor.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).primaryColor.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Research Contribution',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).textTheme.headlineSmall?.color,
            ),
          ),
          const SizedBox(height: 12),
          
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: totalCount > 0 ? sharedCount / totalCount : 0,
              backgroundColor: Colors.grey.withOpacity(0.3),
              valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 12),
          
          Text(
            '$sharedCount of $totalCount location points ($sharePercentage%) shared with researchers',
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your anonymized location data helps researchers understand air pollution exposure patterns and improve public health.',
            style: TextStyle(
              fontSize: 14,
              color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () => _bulkUpdateSharing(true),
              icon: const Icon(Icons.share, size: 18),
              label: const Text('Share All'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => _bulkUpdateSharing(false),
              icon: const Icon(Icons.lock, size: 18),
              label: const Text('Keep All Private'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.orange,
                side: const BorderSide(color: Colors.orange),
              ),
            ),
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
          Text(
            'Filter: ',
            style: TextStyle(
              fontWeight: FontWeight.w500,
              color: Theme.of(context).textTheme.bodyMedium?.color,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: 'all',
                  label: Text('All'),
                  icon: Icon(Icons.list, size: 16),
                ),
                ButtonSegment(
                  value: 'shared',
                  label: Text('Shared'),
                  icon: Icon(Icons.share, size: 16),
                ),
                ButtonSegment(
                  value: 'private',
                  label: Text('Private'),
                  icon: Icon(Icons.lock, size: 16),
                ),
              ],
              selected: {_filterType},
              onSelectionChanged: (selected) {
                _filterType = selected.first;
                _applyFilters();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    String message;
    IconData icon;
    
    switch (_filterType) {
      case 'shared':
        message = 'No shared location data\nTap "Share All" to contribute to research';
        icon = Icons.block;
        break;
      case 'private':
        message = 'No private location data\nAll your data is currently shared';
        icon = Icons.lock_open;
        break;
      default:
        message = 'No location data available\nEnable location tracking to collect data';
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
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16, color: Colors.grey),
          ),
          if (_filterType != 'all') ...[
            const SizedBox(height: 16),
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
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _filteredHistory.length,
      itemBuilder: (context, index) {
        final point = _filteredHistory[index];
        return _buildSharingToggleCard(point);
      },
    );
  }

  Widget _buildSharingToggleCard(LocationDataPoint point) {
    final isSelected = _selectedPoints.contains(point.id);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: isSelected ? 4 : 1,
      color: isSelected ? Theme.of(context).primaryColor.withOpacity(0.1) : null,
      child: _selectMode
          ? CheckboxListTile(
              value: isSelected,
              onChanged: (selected) {
                setState(() {
                  if (selected == true) {
                    _selectedPoints.add(point.id);
                  } else {
                    _selectedPoints.remove(point.id);
                  }
                });
              },
              title: Text(
                _formatDateTime(point.timestamp),
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${point.latitude.toStringAsFixed(6)}, ${point.longitude.toStringAsFixed(6)}',
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        point.isSharedWithResearchers ? Icons.share : Icons.lock,
                        size: 12,
                        color: point.isSharedWithResearchers ? Colors.green : Colors.orange,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        point.isSharedWithResearchers ? 'Shared' : 'Private',
                        style: TextStyle(
                          fontSize: 12,
                          color: point.isSharedWithResearchers ? Colors.green : Colors.orange,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              secondary: CircleAvatar(
                radius: 16,
                backgroundColor: point.isSharedWithResearchers ? Colors.green : Colors.orange,
                child: Icon(
                  point.isSharedWithResearchers ? Icons.share : Icons.lock,
                  color: Colors.white,
                  size: 14,
                ),
              ),
            )
          : SwitchListTile(
              value: point.isSharedWithResearchers,
              onChanged: (value) {
                widget.onUpdateSharing(point.id, value);
                setState(() {
                  // Update will be reflected on next rebuild
                });
                
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(value ? 'Location shared with researchers' : 'Location kept private'),
                    duration: const Duration(seconds: 1),
                  ),
                );
              },
              title: Text(
                _formatDateTime(point.timestamp),
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${point.latitude.toStringAsFixed(6)}, ${point.longitude.toStringAsFixed(6)}',
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                  ),
                  if (point.accuracy != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      'Accuracy: ${point.accuracy!.toStringAsFixed(1)}m',
                      style: TextStyle(
                        fontSize: 10,
                        color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.6),
                      ),
                    ),
                  ],
                ],
              ),
              secondary: CircleAvatar(
                radius: 16,
                backgroundColor: point.isSharedWithResearchers ? Colors.green : Colors.orange,
                child: Icon(
                  point.isSharedWithResearchers ? Icons.share : Icons.lock,
                  color: Colors.white,
                  size: 14,
                ),
              ),
              activeColor: Colors.green,
              inactiveThumbColor: Colors.orange,
              inactiveTrackColor: Colors.orange.withOpacity(0.3),
            ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}/${dateTime.year} '
           '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  void _bulkUpdateSharing(bool share) {
    final action = share ? 'share' : 'keep private';
    final count = widget.locationHistory.length;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(share ? 'Share All Data' : 'Keep All Data Private'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(share 
                ? 'This will make all $count location points available for research purposes.'
                : 'This will keep all $count location points private and not share them with researchers.'
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: (share ? Colors.green : Colors.orange).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    share ? Icons.share : Icons.lock,
                    color: share ? Colors.green : Colors.orange,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      share 
                          ? 'Your anonymized data helps improve air quality research'
                          : 'Your data will remain on your device only',
                      style: const TextStyle(fontSize: 14),
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
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              for (final point in widget.locationHistory) {
                widget.onUpdateSharing(point.id, share);
              }
              setState(() {
                _applyFilters(); // Refresh the list
              });
              Navigator.pop(context);
              
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('All location data is now ${share ? "shared" : "private"}'),
                  backgroundColor: share ? Colors.green : Colors.orange,
                ),
              );
            },
            child: Text(
              share ? 'Share All' : 'Keep Private',
              style: TextStyle(color: share ? Colors.green : Colors.orange),
            ),
          ),
        ],
      ),
    );
  }

  void _bulkUpdateSelected(bool share) {
    final count = _selectedPoints.length;
    final action = share ? 'share' : 'keep private';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${share ? "Share" : "Keep Private"} Selected Data'),
        content: Text('This will $action $count selected location points.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              for (final pointId in _selectedPoints) {
                widget.onUpdateSharing(pointId, share);
              }
              setState(() {
                _selectedPoints.clear();
                _selectMode = false;
                _applyFilters();
              });
              Navigator.pop(context);
              
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('$count location points ${share ? "shared" : "kept private"}'),
                  backgroundColor: share ? Colors.green : Colors.orange,
                ),
              );
            },
            child: Text(
              share ? 'Share Selected' : 'Keep Private',
              style: TextStyle(color: share ? Colors.green : Colors.orange),
            ),
          ),
        ],
      ),
    );
  }

  void _showHelpDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Data Sharing Help'),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'How Data Sharing Works:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('🟢 Shared: Anonymous location data used for research'),
              Text('🟠 Private: Data stays on your device only'),
              SizedBox(height: 12),
              Text(
                'Research Benefits:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('• Understand air pollution exposure patterns'),
              Text('• Improve public health recommendations'),
              Text('• Develop better air quality monitoring'),
              SizedBox(height: 12),
              Text(
                'Privacy Protection:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text('• No personal information is shared'),
              Text('• Location data is anonymized'),
              Text('• You control each data point'),
              Text('• Change sharing preferences anytime'),
              SizedBox(height: 12),
              Text(
                'You can toggle sharing for individual points or use bulk actions for multiple points at once.',
                style: TextStyle(fontStyle: FontStyle.italic),
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
}