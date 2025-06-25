import 'package:airqo/src/meta/utils/date_formatters.dart';
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
  bool _isProcessing = false;

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
    final sharedCount =
        widget.locationHistory.where((p) => p.isSharedWithResearchers).length;

    return Scaffold(
      backgroundColor: isDarkMode
          ? AppColors.darkThemeBackground
          : AppColors.backgroundColor,
      appBar: AppBar(
        title: Text(_selectMode
            ? '${_selectedPoints.length} selected'
            : 'Data Sharing'),
        backgroundColor: isDarkMode
            ? AppColors.darkThemeBackground
            : AppColors.backgroundColor,
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
        actions: _selectMode
            ? [
                if (_selectedPoints.isNotEmpty) ...[
                  TextButton.icon(
                    onPressed:
                        _isProcessing ? null : () => _bulkUpdateSelected(true),
                    icon: const Icon(Icons.share, size: 16),
                    label: const Text('Share'),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                  ),
                  TextButton.icon(
                    onPressed:
                        _isProcessing ? null : () => _bulkUpdateSelected(false),
                    icon: const Icon(Icons.lock, size: 16),
                    label: const Text('Private'),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.red,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                  ),
                ],
              ]
            : [
                IconButton(
                  onPressed: () {
                    setState(() {
                      _selectMode = true;
                    });
                  },
                  icon: const Icon(Icons.checklist),
                  tooltip: 'Select multiple',
                ),
              ],
      ),
      body: Column(
        children: [
          _buildResearchInfoHeader(sharedCount),
          _buildQuickActionsSection(),
          _buildFilterSection(),
          Expanded(
            child: _filteredHistory.isEmpty
                ? _buildEmptyState()
                : _buildDataList(),
          ),
        ],
      ),
    );
  }

  Widget _buildResearchInfoHeader(int sharedCount) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final totalCount = widget.locationHistory.length;
    final privateCount = totalCount - sharedCount;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        border: Border(
          bottom: BorderSide(
            color: isDarkMode
                ? AppColors.dividerColordark
                : AppColors.dividerColorlight,
            width: 0.5,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.science,
                  color: Colors.green,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Research Contribution',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode
                            ? Colors.white
                            : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    RichText(
                      text: TextSpan(
                        style: TextStyle(
                          fontSize: 14,
                          color: isDarkMode
                              ? AppColors.secondaryHeadlineColor2
                              : AppColors.secondaryHeadlineColor,
                        ),
                        children: [
                          TextSpan(
                            text: '$sharedCount',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              color: Colors.green,
                            ),
                          ),
                          TextSpan(text: ' of $totalCount points shared'),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Help improve air quality research by sharing anonymous location data with researchers. You have full control over what data is shared.',
            style: TextStyle(
              fontSize: 13,
              color: isDarkMode
                  ? AppColors.secondaryHeadlineColor2
                  : AppColors.secondaryHeadlineColor,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Shared',
                  sharedCount.toString(),
                  Colors.green,
                  Icons.share,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Private',
                  privateCount.toString(),
                  Colors.grey,
                  Icons.lock,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Total',
                  totalCount.toString(),
                  AppColors.primaryColor,
                  Icons.location_on,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String label, String value, Color color, IconData icon) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDarkMode ? AppColors.darkHighlight : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDarkMode
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
          width: 0.5,
        ),
      ),
      child: Column(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: isDarkMode
                  ? AppColors.secondaryHeadlineColor2
                  : AppColors.secondaryHeadlineColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        border: Border(
          bottom: BorderSide(
            color: isDarkMode
                ? AppColors.dividerColordark
                : AppColors.dividerColorlight,
            width: 0.5,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick Actions',
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
                child: ElevatedButton.icon(
                  onPressed:
                      _isProcessing ? null : () => _shareAllPrivateData(),
                  icon: _isProcessing
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.share_outlined,
                          size: 16, color: Colors.white),
                  label: const Text('Share All'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                    textStyle: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _isProcessing ? null : () => _makeAllDataPrivate(),
                  icon: _isProcessing
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.red),
                        )
                      : const Icon(Icons.lock_outline, size: 16),
                  label: const Text('Make All Private'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    side: const BorderSide(color: Colors.red, width: 1),
                    textStyle: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
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
            color: isDarkMode
                ? AppColors.dividerColordark
                : AppColors.dividerColorlight,
            width: 0.5,
          ),
        ),
      ),
      child: Row(
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
                : (isDarkMode
                    ? AppColors.dividerColordark
                    : AppColors.dividerColorlight),
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
                    ? Colors.green.withOpacity(0.1)
                    : Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(50),
              ),
              child: Icon(
                Icons.science_outlined,
                size: screenWidth * 0.15,
                color: Colors.green,
              ),
            ),
            SizedBox(height: screenWidth * 0.06),
            Text(
              'No Data Points',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
              ),
            ),
            SizedBox(height: screenWidth * 0.04),
            Text(
              _filterType == 'all'
                  ? 'No location data available for sharing'
                  : 'No ${_filterType} data points found',
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
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

  Widget _buildDataList() {
    final screenWidth = MediaQuery.of(context).size.width;

    return Column(
      children: [
        if (_selectMode)
          Container(
            padding: EdgeInsets.all(screenWidth * 0.04),
            decoration: BoxDecoration(
              color: AppColors.primaryColor.withOpacity(0.1),
              border: Border(
                bottom: BorderSide(
                  color: AppColors.primaryColor.withOpacity(0.2),
                  width: 0.5,
                ),
              ),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: _toggleSelectAll,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primaryColor,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      _selectedPoints.length == _filteredHistory.length
                          ? 'Deselect All'
                          : 'Select All',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  '${_selectedPoints.length} selected',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primaryColor,
                  ),
                ),
              ],
            ),
          ),
        Expanded(
          child: ListView.builder(
            padding: EdgeInsets.all(screenWidth * 0.04),
            itemCount: _filteredHistory.length,
            itemBuilder: (context, index) {
              final point = _filteredHistory[index];
              return _buildDataCard(point);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildDataCard(LocationDataPoint point) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final isSelected = _selectedPoints.contains(point.id);

    return GestureDetector(
      onTap: _selectMode ? () => _togglePointSelection(point.id) : null,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.all(screenWidth * 0.04),
        decoration: BoxDecoration(
          color: Theme.of(context).highlightColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _selectMode && isSelected
                ? AppColors.primaryColor
                : (isDarkMode
                    ? AppColors.dividerColordark
                    : AppColors.dividerColorlight),
            width: _selectMode && isSelected ? 2 : 0.5,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (_selectMode)
                  Container(
                    margin: const EdgeInsets.only(right: 12),
                    child: Icon(
                      isSelected ? Icons.check_circle : Icons.circle_outlined,
                      color: isSelected ? AppColors.primaryColor : Colors.grey,
                      size: 20,
                    ),
                  ),
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
                    color: point.isSharedWithResearchers
                        ? Colors.green
                        : Colors.grey,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        DateFormatters.formatDateTime(point.timestamp),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isDarkMode
                              ? Colors.white
                              : AppColors.boldHeadlineColor4,
                        ),
                      ),
                      Text(
                        DateFormatters.formatTimeAgo(point.timestamp),
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
                if (!_selectMode)
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDarkMode
                            ? AppColors.dividerColordark
                            : AppColors.dividerColorlight,
                        width: 0.5,
                      ),
                    ),
                    child: Switch(
                      activeColor: Colors.white,
                      activeTrackColor: Colors.green,
                      inactiveThumbColor: Colors.white,
                      inactiveTrackColor:
                          isDarkMode ? Colors.grey[700] : Colors.grey[300],
                      value: point.isSharedWithResearchers,
                      onChanged: (value) {
                        widget.onUpdateSharing(point.id, value);
                      },
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
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
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
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
                            color: point.isSharedWithResearchers
                                ? Colors.green
                                : Colors.grey,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _togglePointSelection(String pointId) {
    setState(() {
      if (_selectedPoints.contains(pointId)) {
        _selectedPoints.remove(pointId);
      } else {
        _selectedPoints.add(pointId);
      }
    });
  }

  void _toggleSelectAll() {
    setState(() {
      if (_selectedPoints.length == _filteredHistory.length) {
        _selectedPoints.clear();
      } else {
        _selectedPoints.clear();
        _selectedPoints.addAll(_filteredHistory.map((point) => point.id));
      }
    });
  }

  void _bulkUpdateSelected(bool share) async {
    setState(() {
      _isProcessing = true;
    });

    try {
      for (final pointId in _selectedPoints) {
        widget.onUpdateSharing(pointId, share);
      }

      _showSnackBar(
        share
            ? '${_selectedPoints.length} points shared with researchers'
            : '${_selectedPoints.length} points made private',
        isSuccess: true,
      );
    } catch (e) {
      _showSnackBar('Failed to update sharing preferences: $e');
    } finally {
      setState(() {
        _selectMode = false;
        _selectedPoints.clear();
        _isProcessing = false;
      });
    }
  }

  void _shareAllPrivateData() async {
    final privatePoints = widget.locationHistory
        .where((point) => !point.isSharedWithResearchers)
        .toList();

    if (privatePoints.isEmpty) {
      _showSnackBar('All data points are already shared');
      return;
    }

    final confirmed = await _showConfirmationDialog(
      'Share All Private Data',
      'Are you sure you want to share all ${privatePoints.length} private data points with researchers?',
      'Share All',
      Colors.green,
    );

    if (confirmed) {
      setState(() {
        _isProcessing = true;
      });

      try {
        for (final point in privatePoints) {
          widget.onUpdateSharing(point.id, true);
        }
        _showSnackBar(
            '${privatePoints.length} data points shared with researchers',
            isSuccess: true);
      } catch (e) {
        _showSnackBar('Failed to share data points: $e');
      } finally {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  void _makeAllDataPrivate() async {
    final sharedPoints = widget.locationHistory
        .where((point) => point.isSharedWithResearchers)
        .toList();

    if (sharedPoints.isEmpty) {
      _showSnackBar('All data points are already private');
      return;
    }

    final confirmed = await _showConfirmationDialog(
      'Make All Data Private',
      'Are you sure you want to make all ${sharedPoints.length} shared data points private?',
      'Make Private',
      Colors.red,
    );

    if (confirmed) {
      setState(() {
        _isProcessing = true;
      });

      try {
        for (final point in sharedPoints) {
          widget.onUpdateSharing(point.id, false);
        }
        _showSnackBar('${sharedPoints.length} data points made private',
            isSuccess: true);
      } catch (e) {
        _showSnackBar('Failed to update data points: $e');
      } finally {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  Future<bool> _showConfirmationDialog(String title, String message,
      String actionText, Color actionColor) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).highlightColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        title: Text(
          title,
          style: TextStyle(
            color: Theme.of(context).brightness == Brightness.dark
                ? Colors.white
                : AppColors.boldHeadlineColor4,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Text(
          message,
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
              backgroundColor: actionColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(actionText),
          ),
        ],
      ),
    );

    return result ?? false;
  }

  void _showSnackBar(String message, {bool isSuccess = false}) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: isSuccess
              ? Colors.green
              : (Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkHighlight
                  : AppColors.boldHeadlineColor4),
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
