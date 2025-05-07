import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/health_tips_model.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:loggy/loggy.dart';

abstract class HealthTipsRepository extends BaseRepository {
  Future<HealthTipsResponse> fetchHealthTips({bool forceRefresh = false});
  Future<HealthTipModel?> getHealthTipForAqi(double aqiValue);
}

class HealthTipsImpl extends HealthTipsRepository with UiLoggy {
  @override
  Future<HealthTipsResponse> fetchHealthTips({bool forceRefresh = false}) async {
    try {
      loggy.info('Fetching health tips from API: ${ApiUtils.fetchHealthTips}');

      Response response = await createGetRequest(
        ApiUtils.fetchHealthTips,
        {"token": dotenv.env['AIRQO_API_TOKEN']!},
      );
      loggy.info('API Response - Body: ${response.body}');

      if (response.statusCode != 200) {
        loggy.error('❌ Failed to load health tips: HTTP ${response.statusCode}');
        loggy.error('❌ Response body: ${response.body}');
        throw Exception('Failed to load health tips: ${response.statusCode}');
      }

      loggy.info('✅ Health tips API response received');

      Map<String, dynamic> jsonResponse = jsonDecode(response.body);

      HealthTipsResponse healthTipsResponse = HealthTipsResponse.fromJson(jsonResponse);
      return healthTipsResponse;
    } catch (e) {
      loggy.error('❌ Error fetching health tips: $e');
      throw Exception('Failed to fetch health tips: $e');
    }
  }

  @override
  Future<HealthTipModel?> getHealthTipForAqi(double aqiValue) async {
    try {
      loggy.info('Finding health tip for AQI value: $aqiValue');

      final response = await fetchHealthTips();

      if (response.data.healthTips.isEmpty) {
        loggy.warning('No health tips available to match with AQI: $aqiValue');
        return null;
      }

      HealthTipModel? matchingTip;

      for (final tip in response.data.healthTips) {
        if (tip.aqiCategory.max >= 500 && aqiValue >= tip.aqiCategory.min) {
          loggy.info('Found open-ended tip for AQI $aqiValue (>= ${tip.aqiCategory.min})');
          matchingTip = tip;
          break;
        }
      }

      if (matchingTip == null) {
        for (final tip in response.data.healthTips) {
          if (aqiValue >= tip.aqiCategory.min && aqiValue <= tip.aqiCategory.max) {
            loggy.info('Found tip in range ${tip.aqiCategory.min}-${tip.aqiCategory.max}');
            matchingTip = tip;
            break;
          }
        }
      }

      if (matchingTip == null && response.data.healthTips.isNotEmpty) {
        final sorted = List<HealthTipModel>.from(response.data.healthTips);
        sorted.sort((a, b) {
          return (a.aqiCategory.min - aqiValue).abs().compareTo((b.aqiCategory.min - aqiValue).abs());
        });

        matchingTip = sorted.first;
        loggy.info('Using closest matching tip with min: ${matchingTip.aqiCategory.min}');
      }

      if (matchingTip != null) {
        loggy.info('Selected tip: "${matchingTip.title}" with tag line: "${matchingTip.tagLine}"');
      } else {
        loggy.warning('No matching health tip found for AQI: $aqiValue');
      }

      return matchingTip;
    } catch (e) {
      loggy.error('❌ Error getting health tip for AQI $aqiValue: $e');
      return null;
    }
  }

}