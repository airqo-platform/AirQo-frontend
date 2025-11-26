import 'dart:async';

import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/surveys/repository/alert_response_repository.dart';
import 'package:airqo/src/app/research/repository/research_consent_repository.dart';
import 'package:airqo/src/app/research/models/research_consent_model.dart';
import 'package:airqo/src/app/research/pages/research_participation_screen.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/surveys/pages/survey_list_page.dart';
import 'package:airqo/src/app/surveys/repository/survey_repository.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';

class ResearchSettingsScreen extends StatefulWidget {
  const ResearchSettingsScreen({super.key});

  @override
  State<ResearchSettingsScreen> createState() => _ResearchSettingsScreenState();
}

class _ResearchSettingsScreenState extends State<ResearchSettingsScreen> {
  final AlertResponseRepository _alertResponseRepository = AlertResponseRepository();
  final ResearchConsentRepository _consentRepository = ResearchConsentRepository();
  
  Map<String, dynamic> _responseStats = {};
  ResearchConsent? _researchConsent;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadResponseStats(),
      _loadResearchConsent(),
    ]);
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loadResponseStats() async {
    final stats = await _alertResponseRepository.getResponseStats();
    if (mounted) {
      setState(() {
        _responseStats = stats;
      });
    }
  }

  Future<void> _loadResearchConsent() async {
    final userId = await AuthHelper.getCurrentUserId();
    if (userId != null) {
      final consent = await _consentRepository.getConsent(userId);
      if (mounted) {
        setState(() {
          _researchConsent = consent;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: isDarkMode
          ? AppColors.darkThemeBackground
          : AppColors.backgroundColor,
      appBar: AppBar(
        title: const Text('Research Settings'),
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
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: screenWidth * 0.04,
                vertical: 16,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildResearchConsentSection(),
                  SizedBox(height: screenHeight * 0.02),
                  _buildSurveyAccessSection(),
                  SizedBox(height: screenHeight * 0.02),
                  _buildResearchContributionSection(),
                  SizedBox(height: screenHeight * 0.02),
                  _buildStudyProgressSection(),
                  SizedBox(height: screenHeight * 0.02),
                  _buildDataHandlingSection(),
                ],
              ),
            ),
    );
  }

  Widget _buildResearchConsentSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
          width: 0.5,
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
                  color: Theme.of(context).highlightColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.green.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: const Icon(
                  Icons.assignment_outlined,
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
                      'Research Consent',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Manage your research participation preferences',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDarkMode ? Colors.grey[300] : AppColors.boldHeadlineColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_researchConsent != null) ...[
_buildConsentToggleRow('Location Tracking', ConsentType.locationTracking, isDarkMode),
            const SizedBox(height: 8),
            _buildConsentToggleRow('Survey Participation', ConsentType.surveyParticipation, isDarkMode),
            const SizedBox(height: 8),
            _buildConsentToggleRow('Data Sharing', ConsentType.dataSharing, isDarkMode),
            const SizedBox(height: 8),
            _buildConsentToggleRow('Alert Response Tracking', ConsentType.alertResponses, isDarkMode),
            const SizedBox(height: 8),
            _buildConsentToggleRow('Research Communication', ConsentType.researchCommunication, isDarkMode),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ResearchParticipationScreen(),
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: BorderSide(
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                        width: 1,
                      ),
                    ),
                    child: Text(
                      'Manage Consent',
                      style: TextStyle(
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ] else ...[
            Center(
              child: Column(
                children: [
                  Text(
                    'Not enrolled in research study',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ResearchParticipationScreen(),
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
                      side: BorderSide(
                        color: AppColors.primaryColor,
                        width: 1,
                      ),
                    ),
                    child: Text(
                      'Join Research Study',
                      style: TextStyle(
                        color: AppColors.primaryColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSurveyAccessSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
          width: 0.5,
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
                  color: Theme.of(context).highlightColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: AppColors.primaryColor.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: Icon(
                  Icons.quiz_outlined,
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
                      'Research Surveys',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Surveys are now available in the Learn tab. Tap below to view your surveys and research contribution progress.',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDarkMode ? Colors.grey[300] : AppColors.boldHeadlineColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const _SurveyListPageWrapper(),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'View Surveys in Learn Tab',
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResearchContributionSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final totalResponses = _responseStats['totalResponses'] ?? 0;
    final followedPercentage = _responseStats['followedPercentage']?.toDouble() ?? 0.0;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
          width: 0.5,
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
                  color: Theme.of(context).highlightColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.blue.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: const Icon(
                  Icons.insights,
                  color: Colors.blue,
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
                    Text(
                      totalResponses > 0 
                          ? 'You\'ve responded to $totalResponses alerts'
                          : 'No alert responses yet',
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
          ),
          if (totalResponses > 0) ...[
            const SizedBox(height: 12),
            Text(
              'Your responses help researchers understand how effective air quality alerts are at changing behavior.',
              style: TextStyle(
                fontSize: 13,
                color: isDarkMode
                    ? AppColors.secondaryHeadlineColor2
                    : AppColors.secondaryHeadlineColor,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  Icons.check_circle,
                  color: Colors.green,
                  size: 16,
                ),
                const SizedBox(width: 4),
                Text(
                  '${followedPercentage.toStringAsFixed(0)}% follow rate',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Colors.green,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDataHandlingSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
          width: 0.5,
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
                  color: Theme.of(context).highlightColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.orange.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: const Icon(
                  Icons.info_outline,
                  color: Colors.orange,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Data Handling & Withdrawal',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Understand how your data is used and withdrawal options',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDarkMode ? Colors.grey[300] : AppColors.boldHeadlineColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Data Protection & Your Rights',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
            ),
          ),
          const SizedBox(height: 8),
          _buildDataInfoRow('Data Storage', 'Securely encrypted on research servers', isDarkMode),
          const SizedBox(height: 6),
          _buildDataInfoRow('Data Access', 'Only authorized researchers for study purposes', isDarkMode),
          const SizedBox(height: 6),
          _buildDataInfoRow('Data Retention', 'Study duration + 2 years for verification', isDarkMode),
          const SizedBox(height: 6),
          _buildDataInfoRow('Data Sharing', 'Anonymous aggregated data only', isDarkMode),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.red.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: Colors.red.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.warning_amber,
                      color: Colors.red,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Complete Study Withdrawal',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.red,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'You can withdraw from the study at any time. Your data will be deleted within 30 days and no further data will be collected.',
                  style: TextStyle(
                    fontSize: 13,
                    color: isDarkMode ? Colors.grey[300] : AppColors.boldHeadlineColor,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => _showWithdrawalDialog(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: BorderSide(color: Colors.red, width: 1),
                    ),
                    child: Text(
                      'Withdraw from Study',
                      style: TextStyle(
                        color: Colors.red,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataInfoRow(String title, String description, bool isDarkMode) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: const EdgeInsets.only(top: 2),
          width: 4,
          height: 4,
          decoration: BoxDecoration(
            color: isDarkMode ? Colors.grey[400] : AppColors.boldHeadlineColor,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: TextStyle(
                fontSize: 13,
                color: isDarkMode ? Colors.grey[300] : AppColors.boldHeadlineColor,
                height: 1.4,
              ),
              children: [
                TextSpan(
                  text: '$title: ',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                TextSpan(text: description),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _showWithdrawalDialog() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: Text(
          'Withdraw from Study',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Are you sure you want to completely withdraw from the research study?',
              style: TextStyle(
                fontSize: 14,
                color: isDarkMode ? Colors.grey[300] : AppColors.boldHeadlineColor,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'This action will:',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.red,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '• Delete all your research data within 30 days\n• Stop all data collection immediately\n• Remove you from future surveys\n• End your study participation',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDarkMode ? Colors.grey[300] : AppColors.boldHeadlineColor,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            style: TextButton.styleFrom(
              foregroundColor: isDarkMode ? Colors.grey[400] : Colors.grey[700],
            ),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => _handleWithdrawal(dialogContext),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Withdraw'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleWithdrawal(BuildContext dialogContext) async {
    Navigator.pop(dialogContext);
    
    final reason = await _showWithdrawalReasonDialog();
    if (reason != null) {
      try {
        if (_researchConsent != null) {
          final withdrawnConsent = _researchConsent!.withdrawFromStudy(reason);
          await _consentRepository.saveConsent(withdrawnConsent);
          await _loadResearchConsent();
          
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Successfully withdrawn from study'),
                backgroundColor: Colors.green,
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to process withdrawal: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<String?> _showWithdrawalReasonDialog() async {
    String? selectedReason;
    final reasons = [
      'Privacy concerns',
      'Too much data collection', 
      'Study taking too long',
      'Technical issues',
      'No longer interested',
      'Other',
    ];

    return showDialog<String>(
      context: context,
      builder: (dialogContext) {
        final isDarkMode = Theme.of(context).brightness == Brightness.dark;
        
        return StatefulBuilder(
          builder: (context, setState) => AlertDialog(
            backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            title: Text(
              'Reason for Withdrawal (Optional)',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
              ),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Help us improve future studies:',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDarkMode ? Colors.grey[300] : AppColors.boldHeadlineColor,
                  ),
                ),
                const SizedBox(height: 16),
                ...reasons.map((reason) => RadioListTile<String>(
                  title: Text(
                    reason,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                    ),
                  ),
                  value: reason,
                  groupValue: selectedReason,
                  onChanged: (value) => setState(() => selectedReason = value),
                  activeColor: AppColors.primaryColor,
                )),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(dialogContext, selectedReason ?? 'No reason provided'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Confirm'),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildConsentToggleRow(String title, ConsentType consentType, bool isDarkMode) {
    final isEnabled = _researchConsent!.hasGrantedConsent(consentType);
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                consentType.description,
                style: TextStyle(
                  fontSize: 12,
                  color: isDarkMode ? Colors.grey[400] : AppColors.boldHeadlineColor,
                ),
              ),
            ],
          ),
        ),
        Switch(
          value: isEnabled,
          onChanged: (value) => _toggleConsent(consentType, value),
          activeColor: Colors.white,
          activeTrackColor: AppColors.primaryColor,
          inactiveThumbColor: Colors.white,
          inactiveTrackColor: isDarkMode ? Colors.grey[700] : Colors.grey[300],
        ),
      ],
    );
  }

  Future<void> _toggleConsent(ConsentType consentType, bool isEnabled) async {
    if (_researchConsent == null) return;
    
    setState(() {
      _researchConsent = _researchConsent!.updateConsent(
        consentType, 
        isEnabled ? ConsentStatus.granted : ConsentStatus.withdrawn
      );
    });
    
    try {
      await _consentRepository.saveConsent(_researchConsent!);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${consentType.displayName} ${isEnabled ? "enabled" : "disabled"}'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _researchConsent = _researchConsent!.updateConsent(
          consentType,
          isEnabled ? ConsentStatus.withdrawn : ConsentStatus.granted
        );
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update consent: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildStudyProgressSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    
    final studyStartDate = _researchConsent?.initialConsentDate ?? DateTime.now();
    final currentDate = DateTime.now();
    final daysSinceStart = currentDate.difference(studyStartDate).inDays;
    final totalStudyDays = 84;
    final progressPercentage = (daysSinceStart / totalStudyDays * 100).clamp(0, 100);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(screenWidth * 0.04),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDarkMode
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
          width: 0.5,
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
                  color: Theme.of(context).highlightColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: AppColors.primaryColor.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: Icon(
                  Icons.timeline,
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
                      'Study Progress',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Day $daysSinceStart of $totalStudyDays (${progressPercentage.toInt()}% complete)',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDarkMode ? Colors.grey[300] : AppColors.boldHeadlineColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            height: 8,
            decoration: BoxDecoration(
              color: isDarkMode ? Colors.grey[700] : Colors.grey[200],
              borderRadius: BorderRadius.circular(4),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: progressPercentage / 100,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.primaryColor,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Started: ${studyStartDate.day}/${studyStartDate.month}/${studyStartDate.year}',
                style: TextStyle(
                  fontSize: 12,
                  color: isDarkMode ? Colors.grey[400] : AppColors.boldHeadlineColor,
                ),
              ),
              Text(
                '${(totalStudyDays - daysSinceStart).clamp(0, totalStudyDays)} days remaining',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

}

class _SurveyListPageWrapper extends StatelessWidget {
  const _SurveyListPageWrapper();

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => SurveyBloc(SurveyRepository()),
      child: const SurveyListPage(),
    );
  }
}