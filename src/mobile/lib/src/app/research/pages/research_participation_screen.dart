import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/research/models/research_consent_model.dart';
import 'package:airqo/src/app/research/pages/research_consent_screen.dart';

class ResearchParticipationScreen extends StatefulWidget {
  const ResearchParticipationScreen({super.key});

  @override
  State<ResearchParticipationScreen> createState() => _ResearchParticipationScreenState();
}

class _ResearchParticipationScreenState extends State<ResearchParticipationScreen> {
  void _proceedToConsent() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const ResearchConsentScreen(),
      ),
    );
  }

  void _showStudyGoalsModal() {
    showDialog(
      context: context,
      builder: (context) => _buildStudyGoalsModal(),
    );
  }

  void _showDataExamplesModal() {
    showDialog(
      context: context,
      builder: (context) => _buildDataExamplesModal(),
    );
  }

  void _showRisksBenefitsModal() {
    showDialog(
      context: context,
      builder: (context) => _buildRisksBenefitsModal(),
    );
  }

  void _showQAModal() {
    showDialog(
      context: context,
      builder: (context) => _buildQAModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDarkMode
          ? AppColors.darkThemeBackground
          : AppColors.backgroundColor,
      appBar: AppBar(
        title: const Text('Research Study'),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWelcomeSection(),
            const SizedBox(height: 24),
            _buildInformationButtons(),
            const SizedBox(height: 32),
            _buildContinueSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeSection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.primaryColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(
            Icons.science,
            size: 40,
            color: AppColors.primaryColor,
          ),
        ),
        const SizedBox(height: 24),
        
        Text(
          'Join Our Air Quality Research',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 16),
        
        Text(
          'Help us understand how air pollution affects daily life and how people adapt their behavior to stay healthy.',
          style: TextStyle(
            fontSize: 18,
            height: 1.4,
            color: isDarkMode
                ? AppColors.secondaryHeadlineColor2
                : AppColors.secondaryHeadlineColor,
          ),
        ),
        const SizedBox(height: 32),
        
        _buildInfoCard(
          icon: Icons.people,
          title: '500 Participants',
          description: 'Join a community working together for cleaner air',
          color: Colors.blue,
        ),
        const SizedBox(height: 16),
        
        _buildInfoCard(
          icon: Icons.schedule,
          title: '8-12 Weeks',
          description: 'Flexible participation that fits your schedule',
          color: Colors.green,
        ),
        const SizedBox(height: 16),
        
        _buildInfoCard(
          icon: Icons.health_and_safety,
          title: 'Community Impact',
          description: 'Your data helps improve air quality for everyone',
          color: Colors.orange,
        ),
        const SizedBox(height: 32),
        
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.blue.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.blue.withValues(alpha: 0.2),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                Icons.info_outline,
                color: Colors.blue,
                size: 24,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'This is voluntary research. You can participate in any way that works for you and leave at any time.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.blue,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInformationButtons() {
    return Column(
      children: [
        Text(
          'Learn More About the Study',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Theme.of(context).brightness == Brightness.dark ? Colors.white : AppColors.boldHeadlineColor4,
          ),
        ),
        const SizedBox(height: 16),
        _buildInfoButton(
          title: 'What We\'re Studying',
          subtitle: 'Research goals and focus areas',
          icon: Icons.school,
          color: Colors.blue,
          onTap: _showStudyGoalsModal,
        ),
        const SizedBox(height: 12),
        _buildInfoButton(
          title: 'Data We Collect',
          subtitle: 'Specific examples of data types',
          icon: Icons.data_usage,
          color: Colors.green,
          onTap: _showDataExamplesModal,
        ),
        const SizedBox(height: 12),
        _buildInfoButton(
          title: 'Risks & Benefits',
          subtitle: 'What to expect from participation',
          icon: Icons.balance,
          color: Colors.orange,
          onTap: _showRisksBenefitsModal,
        ),
        const SizedBox(height: 12),
        _buildInfoButton(
          title: 'Questions & Answers',
          subtitle: 'Common questions about the study',
          icon: Icons.help_outline,
          color: Colors.purple,
          onTap: _showQAModal,
        ),
      ],
    );
  }

  Widget _buildInfoButton({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.all(16),
          side: BorderSide(
            color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
            width: 0.5,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          backgroundColor: Theme.of(context).highlightColor,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDarkMode ? AppColors.secondaryHeadlineColor2 : AppColors.secondaryHeadlineColor,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: isDarkMode ? Colors.grey[400] : AppColors.boldHeadlineColor,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContinueSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(
            'Ready to participate?',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.primaryColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Review the information above, then set your consent preferences.',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.primaryColor,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _proceedToConsent,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Set Consent Preferences',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudyGoalsModal() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return AlertDialog(
      backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      title: Text(
        'What We\'re Studying',
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
        ),
      ),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.9,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Our research focuses on understanding how people respond to air quality information and adapt their daily routines.',
                style: TextStyle(
                  fontSize: 16,
                  height: 1.4,
                  color: isDarkMode
                      ? AppColors.secondaryHeadlineColor2
                      : AppColors.secondaryHeadlineColor,
                ),
              ),
              const SizedBox(height: 24),
              
              _buildGoalCard(
                icon: Icons.route,
                title: 'Movement Patterns',
                description: 'How do people change their routes and activities based on air quality?',
                example: 'Taking different paths to work, timing outdoor activities',
              ),
              const SizedBox(height: 20),
              
              _buildGoalCard(
                icon: Icons.family_restroom,
                title: 'Family Decisions',
                description: 'How do parents protect children from pollution exposure?',
                example: 'School route changes, indoor vs outdoor play decisions',
              ),
              const SizedBox(height: 20),
              
              _buildGoalCard(
                icon: Icons.notifications_active,
                title: 'Alert Effectiveness',
                description: 'Which types of warnings actually lead to behavior change?',
                example: 'Response to alerts, reasons for following or ignoring advice',
              ),
              const SizedBox(height: 20),
              
              _buildGoalCard(
                icon: Icons.health_and_safety,
                title: 'Health Outcomes',
                description: 'Do people feel healthier when they avoid pollution?',
                example: 'Symptom tracking, wellbeing surveys, adaptation success',
              ),
              const SizedBox(height: 24),
              
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.lightbulb, color: Colors.green, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'Research Impact',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Your participation helps create better air quality apps, more effective public health policies, and targeted interventions for communities.',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.green,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'Close',
            style: TextStyle(
              color: AppColors.primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDataExamplesModal() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return AlertDialog(
      backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      title: Text(
        'Data We Collect',
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
        ),
      ),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.9,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'You choose what to share. Here are specific examples:',
                style: TextStyle(
                  fontSize: 14,
                  color: isDarkMode ? AppColors.secondaryHeadlineColor2 : AppColors.secondaryHeadlineColor,
                ),
              ),
              const SizedBox(height: 16),
              ...ConsentType.values.map((type) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildModalDataCard(type),
              )),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'Close',
            style: TextStyle(
              color: AppColors.primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildModalDataCard(ConsentType type) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).highlightColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight,
          width: 0.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            type.displayName,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            type.dataExample,
            style: TextStyle(
              fontSize: 12,
              color: isDarkMode ? AppColors.secondaryHeadlineColor2 : AppColors.secondaryHeadlineColor,
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildRisksBenefitsModal() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return AlertDialog(
      backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      title: Text(
        'Risks & Benefits',
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
        ),
      ),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.9,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Understanding what to expect from participation:',
                style: TextStyle(
                  fontSize: 16,
                  height: 1.4,
                  color: isDarkMode
                      ? AppColors.secondaryHeadlineColor2
                      : AppColors.secondaryHeadlineColor,
                ),
              ),
              const SizedBox(height: 24),
              
              Text(
                'Potential Benefits',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.green,
                ),
              ),
              const SizedBox(height: 16),
              
              _buildBenefitCard(
                'Better air quality awareness for your daily life',
                Icons.visibility,
              ),
              _buildBenefitCard(
                'Contributing to community health improvements',
                Icons.people,
              ),
              _buildBenefitCard(
                'Access to personalized pollution exposure insights',
                Icons.insights,
              ),
              _buildBenefitCard(
                'Early access to new app features and alerts',
                Icons.new_releases,
              ),
              
              const SizedBox(height: 24),
              
              Text(
                'Potential Risks',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.orange,
                ),
              ),
              const SizedBox(height: 16),
              
              _buildRiskCard(
                'Battery usage from location tracking (minimal impact)',
                Icons.battery_alert,
              ),
              _buildRiskCard(
                'Data usage for syncing (can be done on WiFi only)',
                Icons.data_usage,
              ),
              _buildRiskCard(
                'Time for occasional surveys (5-10 minutes weekly)',
                Icons.schedule,
              ),
              
              const SizedBox(height: 24),
              
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your Control',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '• Choose which data to share\n• Modify permissions anytime\n• Pause or stop participation at any point\n• Delete your data upon request',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.primaryColor,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'Close',
            style: TextStyle(
              color: AppColors.primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
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
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
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
    );
  }

  Widget _buildGoalCard({
    required IconData icon,
    required String title,
    required String description,
    required String example,
  }) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
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
              Icon(icon, color: AppColors.primaryColor, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: TextStyle(
              fontSize: 14,
              color: isDarkMode
                  ? AppColors.secondaryHeadlineColor2
                  : AppColors.secondaryHeadlineColor,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Examples: $example',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.primaryColor,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildBenefitCard(String text, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.green, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: Colors.green,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskCard(String text, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.orange, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: Colors.orange,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQAModal() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return AlertDialog(
      backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      title: Text(
        'Questions & Answers',
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
        ),
      ),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.9,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Common questions about research participation:',
                style: TextStyle(
                  fontSize: 16,
                  height: 1.4,
                  color: isDarkMode
                      ? AppColors.secondaryHeadlineColor2
                      : AppColors.secondaryHeadlineColor,
                ),
              ),
              const SizedBox(height: 24),
              
              _buildQASection(),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'Close',
            style: TextStyle(
              color: AppColors.primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQASection() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;

    final qaSections = [
      {
        'question': 'How long is the study?',
        'answer': 'The study runs for 8-12 weeks per participant. You can withdraw at any time.',
      },
      {
        'question': 'What happens to my data?',
        'answer': 'Your data is encrypted, stored securely, and only used for research purposes. It\'s never sold or shared with non-research entities.',
      },
      {
        'question': 'Can I change my consent later?',
        'answer': 'Yes! You can modify individual consent types or completely withdraw from the study at any time through Research Settings.',
      },
      {
        'question': 'Will this drain my battery?',
        'answer': 'The app is optimized for minimal battery usage. Location tracking uses efficient background services.',
      },
      {
        'question': 'Who can see my responses?',
        'answer': 'Only authorized research team members can access your data, and it\'s always anonymized in publications.',
      },
      {
        'question': 'What if I have technical issues?',
        'answer': 'Contact our support team through the app or withdraw from the study if issues persist.',
      },
    ];

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
                  color: AppColors.primaryColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.help_outline,
                  color: AppColors.primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Frequently Asked Questions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...qaSections.map((qa) => _buildQAItem(
            qa['question']!,
            qa['answer']!,
            isDarkMode,
          )),
        ],
      ),
    );
  }

  Widget _buildQAItem(String question, String answer, bool isDarkMode) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            question,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            answer,
            style: TextStyle(
              fontSize: 13,
              color: isDarkMode
                  ? AppColors.secondaryHeadlineColor2
                  : AppColors.secondaryHeadlineColor,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}