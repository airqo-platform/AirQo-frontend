import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/research/models/research_consent_model.dart';
import 'package:airqo/src/app/research/repository/research_consent_repository.dart';

class ResearchConsentScreen extends StatefulWidget {
  const ResearchConsentScreen({super.key});

  @override
  State<ResearchConsentScreen> createState() => _ResearchConsentScreenState();
}

class _ResearchConsentScreenState extends State<ResearchConsentScreen> {
  final ResearchConsentRepository _consentRepository = ResearchConsentRepository();
  final Map<ConsentType, ConsentStatus> _consentChoices = {};
  bool _isSubmitting = false;
  bool _hasReadTerms = false;

  @override
  void initState() {
    super.initState();
    _initializeConsents();
  }

  void _initializeConsents() {
    for (ConsentType type in ConsentType.values) {
      _consentChoices[type] = ConsentStatus.notProvided;
    }
  }

  void _updateConsent(ConsentType type, ConsentStatus status) {
    setState(() {
      _consentChoices[type] = status;
    });
  }

  bool get _canSubmit {
    return _hasReadTerms && _consentChoices.values.any(
      (status) => status == ConsentStatus.granted,
    );
  }

  Future<void> _submitConsent() async {
    if (!_canSubmit || _isSubmitting) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      final consent = ResearchConsent(
        userId: 'current_user_id', // TODO: Get from auth service
        consentTypes: Map.from(_consentChoices),
        lastUpdated: DateTime.now(),
        initialConsentDate: DateTime.now(),
        hasCompletedOnboarding: true,
      );

      await _consentRepository.saveConsent(consent);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Thank you for joining our research study!'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );

        Navigator.popUntil(context, (route) => route.isFirst);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving consent: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDarkMode
          ? AppColors.darkThemeBackground
          : AppColors.backgroundColor,
      appBar: AppBar(
        title: const Text('Research Consent'),
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
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Choose Your Participation Level',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  Text(
                    'Select which parts of the research you\'d like to participate in. You can change these choices anytime in your privacy settings.',
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.4,
                      color: isDarkMode
                          ? AppColors.secondaryHeadlineColor2
                          : AppColors.secondaryHeadlineColor,
                    ),
                  ),
                  const SizedBox(height: 32),
                  
                  ...ConsentType.values.map((type) => Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child: _buildConsentCard(type),
                  )),
                  
                  const SizedBox(height: 24),
                  
                  _buildTermsSection(),
                  
                  const SizedBox(height: 16),
                  
                  _buildDataRetentionInfo(),
                ],
              ),
            ),
          ),
          
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
            decoration: BoxDecoration(
              color: Theme.of(context).highlightColor,
              border: Border(
                top: BorderSide(
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
                _buildParticipationSummary(),
                const SizedBox(height: 16),
                
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _canSubmit && !_isSubmitting ? _submitConsent : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _canSubmit 
                          ? AppColors.primaryColor 
                          : (isDarkMode ? Colors.grey[700] : Colors.grey[300]),
                      foregroundColor: _canSubmit 
                          ? Colors.white 
                          : (isDarkMode ? Colors.grey[500] : Colors.grey[600]),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text(
                            'Join Research Study',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
                
                const SizedBox(height: 8),
                
                Center(
                  child: Text(
                    'You can modify these choices anytime in Settings',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDarkMode
                          ? AppColors.secondaryHeadlineColor2
                          : AppColors.secondaryHeadlineColor,
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

  Widget _buildConsentCard(ConsentType type) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final currentStatus = _consentChoices[type]!;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: currentStatus == ConsentStatus.granted
              ? AppColors.primaryColor
              : (isDarkMode
                  ? AppColors.dividerColordark
                  : AppColors.dividerColorlight),
          width: currentStatus == ConsentStatus.granted ? 2 : 0.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      type.displayName,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    
                    Text(
                      type.description,
                      style: TextStyle(
                        fontSize: 14,
                        color: isDarkMode
                            ? AppColors.secondaryHeadlineColor2
                            : AppColors.secondaryHeadlineColor,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              
              Container(
                decoration: BoxDecoration(
                  color: currentStatus == ConsentStatus.granted
                      ? AppColors.primaryColor
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: currentStatus == ConsentStatus.granted
                        ? AppColors.primaryColor
                        : (isDarkMode ? Colors.grey[600]! : Colors.grey[400]!),
                    width: 2,
                  ),
                ),
                child: Icon(
                  Icons.check,
                  color: currentStatus == ConsentStatus.granted
                      ? Colors.white
                      : Colors.transparent,
                  size: 16,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primaryColor.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.info_outline,
                  size: 16,
                  color: AppColors.primaryColor,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    type.dataExample,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.primaryColor,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: _buildConsentButton(
                  'Include Me',
                  ConsentStatus.granted,
                  type,
                  Colors.green,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildConsentButton(
                  'Skip This',
                  ConsentStatus.notProvided,
                  type,
                  Colors.grey,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildConsentButton(
    String text,
    ConsentStatus status,
    ConsentType type,
    Color color,
  ) {
    final isSelected = _consentChoices[type] == status;
    
    return OutlinedButton(
      onPressed: () => _updateConsent(type, status),
      style: OutlinedButton.styleFrom(
        backgroundColor: isSelected ? color.withValues(alpha: 0.1) : Colors.transparent,
        foregroundColor: isSelected ? color : color.withValues(alpha: 0.7),
        side: BorderSide(
          color: isSelected ? color : color.withValues(alpha: 0.3),
          width: isSelected ? 2 : 1,
        ),
        padding: const EdgeInsets.symmetric(vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(6),
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildTermsSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.blue.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => setState(() => _hasReadTerms = !_hasReadTerms),
                child: Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: _hasReadTerms ? AppColors.primaryColor : Colors.transparent,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: _hasReadTerms ? AppColors.primaryColor : Colors.blue,
                      width: 2,
                    ),
                  ),
                  child: _hasReadTerms
                      ? const Icon(
                          Icons.check,
                          color: Colors.white,
                          size: 14,
                        )
                      : null,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.blue,
                      height: 1.4,
                    ),
                    children: [
                      const TextSpan(text: 'I have read and understand the '),
                      TextSpan(
                        text: 'research information',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                      const TextSpan(text: ' and my rights as a participant.'),
                    ],
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Key Points:',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.blue,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '• Participation is voluntary and can be stopped anytime\n• You control which data types to share\n• All data is encrypted and anonymized\n• No personal information is shared with researchers\n• You can request data deletion at any time',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.blue,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataRetentionInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.amber.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.amber.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.schedule, color: Colors.amber.shade700, size: 20),
              const SizedBox(width: 8),
              Text(
                'Data Retention',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.amber.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Research data is retained for 5 years for scientific validity. Personal identifiers are deleted after study completion. You can withdraw and request data deletion anytime.',
            style: TextStyle(
              fontSize: 13,
              color: Colors.amber.shade700,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildParticipationSummary() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final grantedConsents = _consentChoices.entries
        .where((entry) => entry.value == ConsentStatus.granted)
        .map((entry) => entry.key)
        .toList();

    if (grantedConsents.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.orange.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(Icons.info_outline, color: Colors.orange, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Please select at least one type of participation to join the study.',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.orange,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.green.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 20),
              const SizedBox(width: 8),
              Text(
                'You\'re participating in:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.green,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ...grantedConsents.map((type) => Padding(
            padding: const EdgeInsets.only(left: 28, bottom: 2),
            child: Text(
              '• ${type.displayName}',
              style: TextStyle(
                fontSize: 12,
                color: Colors.green,
              ),
            ),
          )),
        ],
      ),
    );
  }
}