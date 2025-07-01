import 'dart:convert';
import 'dart:io';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';
import 'package:airqo/src/app/exposure/services/exposure_calculator.dart';
import 'package:loggy/loggy.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';

class ExposureExportService with UiLoggy {
  static final ExposureExportService _instance = ExposureExportService._internal();
  factory ExposureExportService() => _instance;
  ExposureExportService._internal();

  final ExposureCalculator _exposureCalculator = ExposureCalculator();

  /// Export exposure data in JSON format
  Future<String?> exportExposureDataAsJson({
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    try {
      loggy.info('Exporting exposure data from ${startDate.toIso8601String()} to ${endDate.toIso8601String()}');

      // Get exposure data
      final dailySummaries = await _exposureCalculator.calculateDailySummaries(
        startDate: startDate,
        endDate: endDate,
      );

      if (dailySummaries.isEmpty) {
        loggy.warning('No exposure data found for the specified period');
        return null;
      }

      // Create export data structure
      final exportData = {
        'export_info': {
          'generated_at': DateTime.now().toIso8601String(),
          'start_date': startDate.toIso8601String(),
          'end_date': endDate.toIso8601String(),
          'total_days': dailySummaries.length,
          'version': '1.0',
        },
        'summary_statistics': _calculateSummaryStatistics(dailySummaries),
        'daily_summaries': dailySummaries.map((summary) => summary.toJson()).toList(),
      };

      // Convert to JSON
      final jsonString = jsonEncode(exportData);
      
      // Save to temporary file
      final directory = await getTemporaryDirectory();
      final fileName = 'exposure_data_${DateTime.now().millisecondsSinceEpoch}.json';
      final file = File('${directory.path}/$fileName');
      await file.writeAsString(jsonString);

      loggy.info('Export completed: ${file.path}');
      return file.path;
    } catch (e) {
      loggy.error('Error exporting exposure data: $e');
      return null;
    }
  }

  /// Export exposure data in CSV format
  Future<String?> exportExposureDataAsCsv({
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    try {
      loggy.info('Exporting exposure data as CSV from ${startDate.toIso8601String()} to ${endDate.toIso8601String()}');

      // Get exposure data
      final dailySummaries = await _exposureCalculator.calculateDailySummaries(
        startDate: startDate,
        endDate: endDate,
      );

      if (dailySummaries.isEmpty) {
        loggy.warning('No exposure data found for the specified period');
        return null;
      }

      // Create CSV content
      final csvContent = _generateCsvContent(dailySummaries);
      
      // Save to temporary file
      final directory = await getTemporaryDirectory();
      final fileName = 'exposure_data_${DateTime.now().millisecondsSinceEpoch}.csv';
      final file = File('${directory.path}/$fileName');
      await file.writeAsString(csvContent);

      loggy.info('CSV export completed: ${file.path}');
      return file.path;
    } catch (e) {
      loggy.error('Error exporting exposure data as CSV: $e');
      return null;
    }
  }

  /// Share exposure data via platform sharing
  Future<bool> shareExposureData({
    required DateTime startDate,
    required DateTime endDate,
    String format = 'json', // 'json' or 'csv'
  }) async {
    try {
      String? filePath;
      
      if (format.toLowerCase() == 'csv') {
        filePath = await exportExposureDataAsCsv(
          startDate: startDate,
          endDate: endDate,
        );
      } else {
        filePath = await exportExposureDataAsJson(
          startDate: startDate,
          endDate: endDate,
        );
      }

      if (filePath == null) {
        loggy.error('Failed to generate export file');
        return false;
      }

      // Share the file
      final result = await Share.shareXFiles(
        [XFile(filePath)],
        text: 'My Air Quality Exposure Data (${_formatDateRange(startDate, endDate)})',
        subject: 'Air Quality Exposure Export',
      );

      loggy.info('Share completed with result: ${result.status}');
      return result.status == ShareResultStatus.success;
    } catch (e) {
      loggy.error('Error sharing exposure data: $e');
      return false;
    }
  }

  /// Generate exposure summary report as text
  Future<String?> generateTextSummaryReport({
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    try {
      final dailySummaries = await _exposureCalculator.calculateDailySummaries(
        startDate: startDate,
        endDate: endDate,
      );

      if (dailySummaries.isEmpty) {
        return null;
      }

      final stats = _calculateSummaryStatistics(dailySummaries);
      final report = StringBuffer();

      report.writeln('=== Air Quality Exposure Report ===');
      report.writeln('');
      report.writeln('Report Period: ${_formatDateRange(startDate, endDate)}');
      report.writeln('Generated: ${DateTime.now().toString()}');
      report.writeln('Total Days: ${dailySummaries.length}');
      report.writeln('');
      
      report.writeln('=== Summary Statistics ===');
      report.writeln('Average Daily Exposure Score: ${stats['averageDailyExposure'].toStringAsFixed(2)}');
      report.writeln('Average Daily Outdoor Time: ${_formatDuration(Duration(seconds: stats['averageDailyOutdoorTime'].toInt()))}');
      report.writeln('Average Daily PM2.5: ${stats['averageDailyPm25'].toStringAsFixed(2)} μg/m³');
      report.writeln('Peak PM2.5: ${stats['peakPm25'].toStringAsFixed(2)} μg/m³');
      report.writeln('');

      report.writeln('Risk Level Distribution:');
      (stats['riskLevelDistribution'] as Map<String, int>).forEach((level, count) {
        final percentage = (count / dailySummaries.length * 100).toStringAsFixed(1);
        report.writeln('  $level: $count days ($percentage%)');
      });
      report.writeln('');

      report.writeln('=== Daily Breakdown ===');
      for (final summary in dailySummaries) {
        report.writeln('${_formatDate(summary.date)}: '
            '${summary.riskLevel.displayName} risk, '
            '${_formatDuration(summary.totalOutdoorTime)} outdoors, '
            'PM2.5: ${summary.averagePm25.toStringAsFixed(1)} μg/m³');
      }

      return report.toString();
    } catch (e) {
      loggy.error('Error generating text summary report: $e');
      return null;
    }
  }

  // Private helper methods

  Map<String, dynamic> _calculateSummaryStatistics(List<DailyExposureSummary> summaries) {
    if (summaries.isEmpty) {
      return {
        'averageDailyExposure': 0.0,
        'averageDailyOutdoorTime': 0.0,
        'averageDailyPm25': 0.0,
        'peakPm25': 0.0,
        'riskLevelDistribution': <String, int>{},
      };
    }

    final totalExposure = summaries.fold(0.0, (sum, s) => sum + s.totalExposureScore);
    final totalOutdoorTime = summaries.fold(0, (sum, s) => sum + s.totalOutdoorTime.inSeconds);
    final totalPm25 = summaries.fold(0.0, (sum, s) => sum + s.averagePm25);
    final peakPm25 = summaries.fold(0.0, (max, s) => s.maxPm25 > max ? s.maxPm25 : max);

    // Count risk levels
    final riskDistribution = <String, int>{};
    for (final summary in summaries) {
      final level = summary.riskLevel.displayName;
      riskDistribution[level] = (riskDistribution[level] ?? 0) + 1;
    }

    return {
      'averageDailyExposure': totalExposure / summaries.length,
      'averageDailyOutdoorTime': totalOutdoorTime / summaries.length,
      'averageDailyPm25': totalPm25 / summaries.length,
      'peakPm25': peakPm25,
      'riskLevelDistribution': riskDistribution,
    };
  }

  String _generateCsvContent(List<DailyExposureSummary> summaries) {
    final buffer = StringBuffer();
    
    // CSV Header
    buffer.writeln(
      'Date,Risk Level,Exposure Score,Outdoor Time (minutes),Average PM2.5,Peak PM2.5,Dominant AQI Category,Data Points'
    );

    // CSV Data
    for (final summary in summaries) {
      buffer.writeln(
        '${_formatDateCsv(summary.date)},'
        '${summary.riskLevel.displayName},'
        '${summary.totalExposureScore.toStringAsFixed(2)},'
        '${summary.totalOutdoorTime.inMinutes},'
        '${summary.averagePm25.toStringAsFixed(2)},'
        '${summary.maxPm25.toStringAsFixed(2)},'
        '"${summary.dominantAqiCategory}",'
        '${summary.dataPoints.length}'
      );
    }

    return buffer.toString();
  }

  String _formatDateRange(DateTime start, DateTime end) {
    return '${_formatDate(start)} - ${_formatDate(end)}';
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  String _formatDateCsv(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  String _formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;

    if (hours > 0) {
      return '${hours}h ${minutes}m';
    } else {
      return '${minutes}m';
    }
  }
}