import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/app/research/models/research_consent_model.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:loggy/loggy.dart';

class ResearchConsentRepository extends BaseRepository with UiLoggy {
  static const String _consentBoxName = 'research_consent';
  static const String _consentEndpoint = '/api/v2/users/research/consent';

  Future<bool> saveConsent(ResearchConsent consent) async {
    try {
      await _cacheConsent(consent);

      try {
        final consentData = _formatConsentForAPI(consent);
        final apiResponse = await createPostRequest(
          path: _consentEndpoint,
          data: consentData,
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true) {
          loggy.info('Successfully submitted research consent for user: ${consent.userId}');
          return true;
        } else {
          throw Exception('API submission failed: ${data['message'] ?? 'Unknown error'}');
        }
      } catch (e) {
        loggy.warning('Failed to submit consent to API, cached locally: $e');
        return false;
      }
    } catch (e) {
      loggy.error('Error saving research consent: $e');
      return false;
    }
  }

  Future<ResearchConsent?> getConsent(String userId) async {
    try {
      final cachedConsent = await _getCachedConsent(userId);
      if (cachedConsent != null) {
        return cachedConsent;
      }

      try {
        final apiResponse = await createGetRequest(
          '$_consentEndpoint/$userId',
          {},
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true && data['consent'] != null) {
          final consent = ResearchConsent.fromJson(data['consent']);
          await _cacheConsent(consent);
          return consent;
        }
      } catch (e) {
        loggy.warning('Failed to fetch consent from API: $e');
      }

      return null;
    } catch (e) {
      loggy.error('Error getting research consent: $e');
      return null;
    }
  }

  Future<bool> updateConsentType(String userId, ConsentType type, ConsentStatus status) async {
    try {
      final currentConsent = await getConsent(userId) ?? ResearchConsent.initial(userId);
      final updatedConsent = currentConsent.updateConsent(type, status);
      
      return await saveConsent(updatedConsent);
    } catch (e) {
      loggy.error('Error updating consent type: $e');
      return false;
    }
  }

  Future<bool> withdrawFromStudy(String userId, String reason) async {
    try {
      final currentConsent = await getConsent(userId);
      if (currentConsent == null) {
        loggy.warning('No consent found for user $userId to withdraw');
        return false;
      }

      final withdrawnConsent = currentConsent.withdrawFromStudy(reason);
      
      try {
        final withdrawalData = {
          'withdrawalReason': reason,
          'confirmDeletion': true,
        };

        final apiResponse = await createDeleteRequest(
          path: '$_consentEndpoint/$userId',
          data: withdrawalData,
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true) {
          await _cacheConsent(withdrawnConsent);
          loggy.info('Successfully withdrew user $userId from study');
          return true;
        } else {
          throw Exception('API withdrawal failed: ${data['message'] ?? 'Unknown error'}');
        }
      } catch (e) {
        await _cacheConsent(withdrawnConsent);
        loggy.warning('Failed to submit withdrawal to API, cached locally: $e');
        return false;
      }
    } catch (e) {
      loggy.error('Error withdrawing from study: $e');
      return false;
    }
  }

  Future<bool> hasUserConsented(String userId, ConsentType type) async {
    try {
      final consent = await getConsent(userId);
      return consent?.hasGrantedConsent(type) ?? false;
    } catch (e) {
      loggy.error('Error checking consent status: $e');
      return false;
    }
  }

  Future<List<ConsentType>> getGrantedConsents(String userId) async {
    try {
      final consent = await getConsent(userId);
      return consent?.getGrantedConsents() ?? [];
    } catch (e) {
      loggy.error('Error getting granted consents: $e');
      return [];
    }
  }

  Future<bool> isParticipatingInStudy(String userId) async {
    try {
      final consent = await getConsent(userId);
      return consent?.isParticipatingInStudy() ?? false;
    } catch (e) {
      loggy.error('Error checking study participation: $e');
      return false;
    }
  }

  Future<void> retryFailedSubmissions() async {
    try {
      final userId = await AuthHelper.getCurrentUserId();
      if (userId == null) return;
      
      final cachedConsent = await _getCachedConsent(userId);
      if (cachedConsent == null) return;

      loggy.info('Retrying consent submission for user: ${cachedConsent.userId}');

      try {
        final consentData = cachedConsent.toJson();
        final apiResponse = await createPostRequest(
          path: _consentEndpoint,
          data: consentData,
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true) {
          loggy.info('Successfully synced consent: ${cachedConsent.userId}');
        }
      } catch (e) {
        loggy.warning('Failed to sync consent ${cachedConsent.userId}: $e');
      }
    } catch (e) {
      loggy.error('Error in retryFailedSubmissions: $e');
    }
  }

  Future<void> clearCache() async {
    try {
      await HiveRepository.deleteData(_consentBoxName, 'consent');
      loggy.info('Cleared research consent cache');
    } catch (e) {
      loggy.error('Error clearing consent cache: $e');
    }
  }

  Future<ResearchConsent?> _getCachedConsent(String userId) async {
    try {
      final cachedData = await HiveRepository.getData('consent', _consentBoxName);
      if (cachedData != null) {
        final consentJson = json.decode(cachedData);
        final consent = ResearchConsent.fromJson(consentJson);
        
        if (consent.userId == userId) {
          return consent;
        }
      }
      return null;
    } catch (e) {
      loggy.error('Error getting cached consent: $e');
      return null;
    }
  }

  Future<void> _cacheConsent(ResearchConsent consent) async {
    try {
      final consentJson = consent.toJson();
      await HiveRepository.saveData(_consentBoxName, 'consent', json.encode(consentJson));
    } catch (e) {
      loggy.error('Error caching consent: $e');
    }
  }

  Map<String, dynamic> _formatConsentForAPI(ResearchConsent consent) {
    final consentTypesForAPI = <String, String>{};
    
    consent.consentTypes.forEach((type, status) {
      String statusString;
      switch (status) {
        case ConsentStatus.granted:
          statusString = 'granted';
          break;
        case ConsentStatus.withdrawn:
        case ConsentStatus.notProvided:
          statusString = 'denied';
          break;
      }
      
      consentTypesForAPI[type.toString().split('.').last] = statusString;
    });

    return {
      'consentTypes': consentTypesForAPI,
      'consentVersion': 'v1.2',
      'timestamp': consent.lastUpdated.toIso8601String(),
    };
  }
}