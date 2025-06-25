// File: src/mobile-v3/lib/src/app/profile/pages/location_data_view_screen.dart

import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/services/enhanced_location_service_manager.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/profile/pages/widgets/privacy_dialogs.dart';

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
    final screenWidth = MediaQuery.of(context).size.width;
    
    return Scaffold(
      backgroundColor: isDarkMode ? AppColors.darkThemeBackground : AppColors.backgroundColor,
      appBar: AppBar(
        title: const Text('My Location Data'),
        backgroundColor: isDarkMode ? AppColors.darkThemeBackground : AppColors.backgroundColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(
          color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
        ),
        titleTextStyle: TextStyle(
          color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
      body: Column(
        children: [
          _buildStatsHeader(),
          _buildFilterSection(),
          Expanded(
            child: _filteredHistory.isEmpty 
                ? _buildEmptyState()
                : _buildLocationList(),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsHeader() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final totalCount = widget.locationHistory.length;
    final sharedCount = widget.locationHistory.where((p) => p.isSharedWithResearchers).length;
    final privateCount = totalCount - sharedCount;
    
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        border: Border(
          bottom: BorderSide(
            color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
            width: 0.5,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Location Data Overview',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Total Points',
                  totalCount.toString(),
                  Icons.location_on,
                  AppColors.primaryColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Shared',
                  sharedCount.toString(),
                  Icons.share,
                  Colors.green,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Private',
                  privateCount.toString(),
                  Icons.lock,
                  Colors.grey,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDarkMode ? AppColors.darkHighlight : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
          width: 0.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: isDarkMode 
                        ? AppColors.secondaryHeadlineColor2 
                        : AppColors.secondaryHeadlineColor,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    
    return Container(
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        border: Border(
          bottom: BorderSide(
            color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
            width: 0.5,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Filters & Sorting',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildFilterChip('All', 'all'),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildFilterChip('Shared', 'shared'),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildFilterChip('Private', 'private'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Text(
                'Sort by:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDarkMode 
                      ? AppColors.secondaryHeadlineColor2 
                      : AppColors.secondaryHeadlineColor,
                ),
              ),
              const SizedBox(width: 12),
              _buildSortButton('Newest', 'newest'),
              const SizedBox(width: 8),
              _buildSortButton('Oldest', 'oldest'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final isSelected = _filterType == value;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _filterType = value;
        });
        _applyFilters();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected 
              ? AppColors.primaryColor 
              : (isDarkMode ? AppColors.darkHighlight : Colors.white),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected 
                ? AppColors.primaryColor 
                : (isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight),
            width: 1,
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: isSelected 
                ? Colors.white 
                : (isDarkMode ? Colors.white : AppColors.boldHeadlineColor4),
          ),
        ),
      ),
    );
  }

  Widget _buildSortButton(String label, String value) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final isSelected = _sortOrder == value;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _sortOrder = value;
        });
        _applySorting();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected 
              ? AppColors.primaryColor.withOpacity(0.1) 
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected 
                ? AppColors.primaryColor 
                : (isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight),
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: isSelected 
                ? AppColors.primaryColor 
                : (isDarkMode 
                    ? AppColors.secondaryHeadlineColor2 
                    : AppColors.secondaryHeadlineColor),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    
    return Center(
      child: Padding(
        padding: EdgeInsets.all(screenWidth * 0.08),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDarkMode 
                    ? AppColors.secondaryHeadlineColor2.withOpacity(0.1)
                    : AppColors.secondaryHeadlineColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(50),
              ),
              child: Icon(
                Icons.location_off,
                size: screenWidth * 0.15,
                color: isDarkMode 
                    ? AppColors.secondaryHeadlineColor2 
                    : AppColors.secondaryHeadlineColor,
              ),
            ),
            SizedBox(height: screenWidth * 0.06),
            Text(
              'No Location Data',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
              ),
            ),
            SizedBox(height: screenWidth * 0.04),
            Text(
              _filterType == 'all' 
                  ? 'No location data has been recorded yet'
                  : 'No ${_filterType} location data found',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: isDarkMode 
                    ? AppColors.secondaryHeadlineColor2 
                    : AppColors.secondaryHeadlineColor,
                height: 1.4,
              ),
            ),
            if (_filterType != 'all') ...[
              SizedBox(height: screenWidth * 0.06),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _filterType = 'all';
                  });
                  _applyFilters();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Show All Data'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildLocationList() {
    final screenWidth = MediaQuery.of(context).size.width;
    
    return ListView.builder(
      padding: EdgeInsets.all(screenWidth * 0.04),
      itemCount: _filteredHistory.length,
      itemBuilder: (context, index) {
        final point = _filteredHistory[index];
        return _buildLocationCard(point);
      },
    );
  }

  Widget _buildLocationCard(LocationDataPoint point) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
          width: 0.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: point.isSharedWithResearchers 
                            ? Colors.green.withOpacity(0.1)
                            : Colors.grey.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        point.isSharedWithResearchers ? Icons.share : Icons.lock,
                        size: 16,
                        color: point.isSharedWithResearchers ? Colors.green : Colors.grey,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _formatDateTime(point.timestamp),
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                            ),
                          ),
                          Text(
                            _formatTimeAgo(point.timestamp),
                            style: TextStyle(
                              fontSize: 12,
                              color: isDarkMode 
                                  ? AppColors.secondaryHeadlineColor2 
                                  : AppColors.secondaryHeadlineColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: point.isSharedWithResearchers 
                          ? Colors.green.withOpacity(0.1)
                          : Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      point.isSharedWithResearchers ? 'Shared' : 'Private',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: point.isSharedWithResearchers ? Colors.green : Colors.grey,
                      ),
                    ),
                  ),
                  PopupMenuButton<String>(
                    icon: Icon(
                      Icons.more_vert,
                      size: 20,
                      color: isDarkMode 
                          ? AppColors.secondaryHeadlineColor2 
                          : AppColors.secondaryHeadlineColor,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    color: Theme.of(context).highlightColor,
                    onSelected: (value) {
                      switch (value) {
                        case 'details':
                          _showLocationDetails(point);
                          break;
                        case 'delete':
                          _confirmDeletePoint(point.id);
                          break;
                      }
                    },
                    itemBuilder: (context) => [
                      PopupMenuItem(
                        value: 'details',
                        child: Row(
                          children: [
                            Icon(
                              Icons.info_outline,
                              size: 18,
                              color: AppColors.primaryColor,
                            ),
                            const SizedBox(width: 8),
                            const Text('View Details'),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            const Icon(
                              Icons.delete_outline,
                              size: 18,
                              color: Colors.red,
                            ),
                            const SizedBox(width: 8),
                            const Text('Delete'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDarkMode 
                  ? AppColors.darkHighlight.withOpacity(0.5)
                  : Colors.grey.withOpacity(0.05),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      size: 16,
                      color: AppColors.primaryColor,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        '${point.latitude.toStringAsFixed(6)}, ${point.longitude.toStringAsFixed(6)}',
                        style: TextStyle(
                          fontSize: 14,
                          fontFamily: 'monospace',
                          color: isDarkMode 
                              ? AppColors.secondaryHeadlineColor2 
                              : AppColors.secondaryHeadlineColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.my_location,
                      size: 16,
                      color: isDarkMode 
                          ? AppColors.secondaryHeadlineColor2 
                          : AppColors.secondaryHeadlineColor,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Accuracy: ${point.accuracy != null ? point.accuracy!.toStringAsFixed(1) : 'N/A'}m',
                      style: TextStyle(
                        fontSize: 14,
                        color: isDarkMode 
                            ? AppColors.secondaryHeadlineColor2 
                            : AppColors.secondaryHeadlineColor,
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

  void _showLocationDetails(LocationDataPoint point) {
    showDialog(
      context: context,
      builder: (context) => _buildLocationDetailDialog(point),
    );
  }

  Widget _buildLocationDetailDialog(LocationDataPoint point) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    
    return AlertDialog(
      backgroundColor: Theme.of(context).highlightColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      title: Text(
        'Location Details',
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
            _buildDetailRow('Timestamp', _formatDateTime(point.timestamp)),
            _buildDetailRow('Latitude', point.latitude.toStringAsFixed(6)),
            _buildDetailRow('Longitude', point.longitude.toStringAsFixed(6)),
            _buildDetailRow('Accuracy', '${point.accuracy != null ? point.accuracy!.toStringAsFixed(1) : 'N/A'}m'),
            _buildDetailRow('Sharing Status', point.isSharedWithResearchers ? 'Shared with researchers' : 'Private'),
            _buildDetailRow('Recorded', _formatTimeAgo(point.timestamp)),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primaryColor,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          child: const Text('Close'),
        ),
      ],
      actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      contentPadding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
      titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              '$label:',
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                fontSize: 14,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontFamily: label.contains('Latitude') || label.contains('Longitude') ? 'monospace' : null,
                color: isDarkMode 
                    ? AppColors.secondaryHeadlineColor2 
                    : AppColors.secondaryHeadlineColor,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _confirmDeletePoint(String pointId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).highlightColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        title: Text(
          'Delete Location Point',
          style: TextStyle(
            color: Theme.of(context).brightness == Brightness.dark 
                ? Colors.white 
                : AppColors.boldHeadlineColor4,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Text(
          'Are you sure you want to delete this location point? This action cannot be undone.',
          style: TextStyle(
            color: Theme.of(context).brightness == Brightness.dark 
                ? AppColors.secondaryHeadlineColor2 
                : AppColors.secondaryHeadlineColor,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).brightness == Brightness.dark 
                  ? Colors.grey[400] 
                  : Colors.grey[700],
            ),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      widget.onDeletePoint(pointId);
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}/${dateTime.year} '
           '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays == 1 ? '' : 's'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours == 1 ? '' : 's'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes == 1 ? '' : 's'} ago';
    } else {
      return 'Just now';
    }
  }
}