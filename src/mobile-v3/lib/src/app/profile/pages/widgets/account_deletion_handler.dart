import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/pages/welcome_screen.dart';
import 'package:airqo/src/app/profile/services/account_deletion_service.dart';
import 'package:airqo/src/app/profile/repository/user_repository.dart';

class AccountDeletionHandler {
  static final AccountDeletionService _deletionService = AccountDeletionService();
  static final UserImpl _userRepository = UserImpl();

  static Future<String> _getUserEmail() async {
    try {
      final profile = await _userRepository.loadUserProfile();
      if (profile.users.isNotEmpty) {
        return profile.users.first.email;
      }
    } catch (e) {
      // Silently fail - email will remain empty
    }
    return '';
  }

  static void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  static void showDeleteAccountConfirmation(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    showDialog(
      context: context,
      builder: (dialogContext) => FutureBuilder<String>(
        future: _getUserEmail(),
        builder: (context, snapshot) {
          final userEmail = snapshot.data ?? '';
          
          return AlertDialog(
            backgroundColor: isDarkMode ? AppColors.darkThemeBackground : Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            title: Text(
              'Delete Account',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: isDarkMode 
                    ? AppColors.boldHeadlineColor2 
                    : AppColors.boldHeadlineColor5,
              ),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Are you sure you want to permanently delete your account?',
                  style: TextStyle(
                    fontSize: 16,
                    color: isDarkMode 
                        ? AppColors.secondaryHeadlineColor2 
                        : AppColors.secondaryHeadlineColor,
                  ),
                ),
                SizedBox(height: 12),
                Text(
                  'This action will:',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDarkMode 
                        ? AppColors.secondaryHeadlineColor2 
                        : AppColors.secondaryHeadlineColor,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  '• Permanently delete all your data\n• Remove your account information\n• Cannot be undone',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDarkMode 
                        ? Colors.grey[400] 
                        : Colors.grey[600],
                  ),
                ),
                if (userEmail.isNotEmpty) ...[
                  SizedBox(height: 12),
                  Text(
                    'A verification code will be sent to: $userEmail',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDarkMode 
                          ? Colors.grey[500] 
                          : Colors.grey[600],
                    ),
                  ),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                style: TextButton.styleFrom(
                  foregroundColor: isDarkMode 
                      ? Colors.grey[400] 
                      : Colors.grey[700],
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                child: Text(
                  'Cancel',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade600,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                  elevation: 0,
                ),
                onPressed: () => _initiateAccountDeletion(context, dialogContext, userEmail),
                child: Text(
                  'Send Code',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
            actionsAlignment: MainAxisAlignment.spaceBetween, 
            actionsPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            titlePadding: EdgeInsets.fromLTRB(24, 24, 24, 12),
            contentPadding: EdgeInsets.fromLTRB(24, 0, 24, 24),
          );
        },
      ),
    );
  }

  static Future<void> _initiateAccountDeletion(
    BuildContext context, 
    BuildContext dialogContext, 
    String userEmail
  ) async {
    Navigator.pop(dialogContext);

    if (userEmail.isEmpty) {
      _showSnackBar(context, 'Unable to determine user email');
      return;
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        content: Row(
          children: [
            CircularProgressIndicator(),
            SizedBox(width: 20),
            Text('Sending verification code...'),
          ],
        ),
      ),
    );

    try {
      final result = await _deletionService.initiateAccountDeletion(userEmail);
      
      if (context.mounted) {
        Navigator.pop(context);
        
        if (result['success'] == true) {
          _showVerificationCodeDialog(context, userEmail);
        } else {
          _showSnackBar(context, result['message'] ?? 'Failed to initiate account deletion');
        }
      }
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context);
        _showSnackBar(context, 'Error: ${e.toString()}');
      }
    }
  }

  static void _showVerificationCodeDialog(BuildContext context, String userEmail) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => _VerificationCodeDialog(
        isDarkMode: isDarkMode,
        userEmail: userEmail,
        onConfirm: (code) => _confirmAccountDeletion(context, dialogContext, code),
      ),
    );
  }

  static Future<void> _confirmAccountDeletion(
    BuildContext context,
    BuildContext dialogContext,
    String code,
  ) async {
    try {
      final result = await _deletionService.confirmAccountDeletion(code);
      
      if (result['success'] == true) {
        if (context.mounted) {
          Navigator.pop(dialogContext);
          _showSnackBar(context, 'Account deleted successfully');
          
          context.read<AuthBloc>().add(LogoutUser());
          
          await Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const WelcomeScreen()),
            (route) => false,
          );
        }
      } else {
        _showSnackBar(context, result['message'] ?? 'Failed to delete account');
      }
    } catch (e) {
      _showSnackBar(context, 'Error: ${e.toString()}');
    }
  }
}

class _VerificationCodeDialog extends StatefulWidget {
  final bool isDarkMode;
  final String userEmail;
  final Function(String) onConfirm;

  const _VerificationCodeDialog({
    required this.isDarkMode,
    required this.userEmail,
    required this.onConfirm,
  });

  @override
  State<_VerificationCodeDialog> createState() => _VerificationCodeDialogState();
}

class _VerificationCodeDialogState extends State<_VerificationCodeDialog> {
  bool isConfirming = false;
  late TextEditingController _codeController;

  @override
  void initState() {
    super.initState();
    _codeController = TextEditingController();
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: widget.isDarkMode ? AppColors.darkThemeBackground : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      title: Text(
        'Enter Verification Code',
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: widget.isDarkMode 
              ? AppColors.boldHeadlineColor2 
              : AppColors.boldHeadlineColor5,
        ),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'We\'ve sent a 5-digit code to ${widget.userEmail}. Enter it below to confirm account deletion.',
            style: TextStyle(
              fontSize: 14,
              color: widget.isDarkMode 
                  ? AppColors.secondaryHeadlineColor2 
                  : AppColors.secondaryHeadlineColor,
            ),
          ),
          SizedBox(height: 20),
          TextFormField(
            controller: _codeController,
            keyboardType: TextInputType.number,
            maxLength: 5,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              letterSpacing: 4,
              color: widget.isDarkMode ? Colors.white : Colors.black,
            ),
            decoration: InputDecoration(
              hintText: '00000',
              hintStyle: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                letterSpacing: 4,
                color: widget.isDarkMode ? Colors.grey[600] : Colors.grey[400],
              ),
              counterText: '',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: AppColors.primaryColor, width: 2),
              ),
            ),
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: isConfirming ? null : () => Navigator.pop(context),
          child: Text(
            'Cancel',
            style: TextStyle(
              color: widget.isDarkMode ? Colors.grey[400] : Colors.grey[700],
            ),
          ),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red.shade600,
            foregroundColor: Colors.white,
          ),
          onPressed: isConfirming ? null : () async {
            final code = _codeController.text.trim();
            if (code.length != 5 || !RegExp(r'^\d{5}$').hasMatch(code)) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Please enter a valid 5-digit code')),
              );
              return;
            }

            setState(() {
              isConfirming = true;
            });

            await widget.onConfirm(code);

            if (mounted) {
              setState(() {
                isConfirming = false;
              });
            }
          },
          child: isConfirming
              ? SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : Text('Delete Account'),
        ),
      ],
    );
  }
}