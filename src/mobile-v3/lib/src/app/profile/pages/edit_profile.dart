import 'dart:async';
import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';

class EditProfile extends StatefulWidget {
  const EditProfile({super.key});

  @override
  State<EditProfile> createState() => _EditProfileState();
}

class _EditProfileState extends State<EditProfile> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _formChanged = false;
  Timer? _loadingTimeout;

  @override
  void initState() {
    super.initState();
    _populateFields();
  }

  void _populateFields() {
    final userState = context.read<UserBloc>().state;
    if (userState is UserLoaded) {
      final user = userState.model.users[0];
      setState(() {
        _firstNameController.text = user.firstName;
        _lastNameController.text = user.lastName;
        _emailController.text = user.email;
      });
    }
  }

  bool _validateEmail(String email) {
    final emailRegExp = RegExp(
        r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+");
    return emailRegExp.hasMatch(email);
  }

  bool _validateForm() {
    if (_firstNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('First name cannot be empty'),
          backgroundColor: AppColors.primaryColor,
        ),
      );
      return false;
    }

    if (_lastNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Last name cannot be empty'),
          backgroundColor: AppColors.primaryColor,
        ),
      );
      return false;
    }

    if (_emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Email cannot be empty'),
          backgroundColor: AppColors.primaryColor,
        ),
      );
      return false;
    }

    if (!_validateEmail(_emailController.text.trim())) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please enter a valid email address'),
          backgroundColor: AppColors.primaryColor,
        ),
      );
      return false;
    }

    return true;
  }

  void _resetLoadingState() {
    if (mounted) {
      setState(() {
        _isLoading = false;
      });

      _loadingTimeout?.cancel();
      _loadingTimeout = null;
    }
  }

  void _updateProfile() {
    // Only update if form has changed and not already loading
    if (!_formChanged || _isLoading) return;

    // Validate form fields
    if (!_validateForm()) return;

    setState(() {
      _isLoading = true;
    });

    // Set a timeout to reset loading state if the API takes too long
    _loadingTimeout = Timer(Duration(seconds: 15), () {
      if (_isLoading && mounted) {
        _resetLoadingState();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Update request timed out. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    try {
      context.read<UserBloc>().add(
            UpdateUser(
              firstName: _firstNameController.text.trim(),
              lastName: _lastNameController.text.trim(),
              email: _emailController.text.trim(),
            ),
          );
    } catch (e) {
      print('Error dispatching UpdateUser event: $e');
      _resetLoadingState();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error updating profile: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _onFieldChanged() {
    if (!_formChanged) {
      setState(() {
        _formChanged = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    final avatarRadius = screenWidth * 0.15;
    final padding = screenWidth * 0.05;
    final iconSize = screenWidth * 0.06;

    // Theme-based colors
    final textColor = isDarkMode ? Colors.white : AppColors.boldHeadlineColor4;
    final subtitleColor = isDarkMode 
        ? Colors.grey
        : AppColors.secondaryHeadlineColor;
    final backgroundColor = isDarkMode 
        ? AppColors.darkThemeBackground
        : AppColors.backgroundColor;
    final cardColor = isDarkMode 
        ? AppColors.highlightColor 
        : Colors.white;
    final borderColor = isDarkMode 
        ? Colors.grey[800] ?? Colors.grey
        : AppColors.borderColor2;

    return BlocConsumer<UserBloc, UserState>(
      listener: (context, state) {
        print('Current state: $state');

        if (state is UserUpdateSuccess) {
          _resetLoadingState();
          setState(() {
            _formChanged = false;
          });

          // Load the user profile to ensure UI is up-to-date
          context.read<UserBloc>().add(LoadUser());

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Profile updated successfully'),
              backgroundColor: Colors.green,
            ),
          );

          // Navigate back after successful update
          Navigator.of(context).pop();
        } else if (state is UserUpdateError) {
          _resetLoadingState();

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error updating profile: ${state.message}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      },
      // Also build the UI based on state changes
      builder: (context, state) {
        // If the state has changed to UserUpdating and we're not already loading,
        // update our local loading state
        if (state is UserUpdating && !_isLoading) {
          _isLoading = true;
        }

        return Scaffold(
          backgroundColor: backgroundColor,
          appBar: AppBar(
            backgroundColor: backgroundColor,
            elevation: 0,
            leading: IconButton(
              icon: Icon(
                Icons.arrow_back,
                color: textColor,
              ),
              onPressed: () {
                if (_formChanged) {
                  // Show confirmation dialog if changes were made
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      backgroundColor: cardColor,
                      title: Text(
                        'Discard Changes?',
                        style: TextStyle(
                          color: textColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      content: Text(
                        'You have unsaved changes. Are you sure you want to go back?',
                        style: TextStyle(
                          color: subtitleColor,
                        ),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: Text(
                            'Cancel',
                            style: TextStyle(
                              color: subtitleColor,
                            ),
                          ),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryColor,
                            foregroundColor: Colors.white,
                          ),
                          onPressed: () {
                            Navigator.of(context).pop();
                            Navigator.of(context).pop();
                          },
                          child: Text('Discard'),
                        ),
                      ],
                    ),
                  );
                } else {
                  Navigator.of(context).pop();
                }
              },
            ),
            title: Text(
              'Edit Profile',
              style: TextStyle(
                color: textColor,
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            centerTitle: true,
            actions: [
              TextButton(
                onPressed: _isLoading ? null : _updateProfile,
                child: _isLoading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.primaryColor,
                        ),
                      )
                    : Text(
                        'Done',
                        style: TextStyle(
                          color: _formChanged
                              ? AppColors.primaryColor
                              : subtitleColor.withOpacity(0.5),
                          fontWeight: FontWeight.w600,
                          fontSize: 16.0,
                        ),
                      ),
              ),
              SizedBox(width: 8),
            ],
          ),
          body: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.all(padding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Stack(
                        children: [
                          CircleAvatar(
                            backgroundColor: Theme.of(context).highlightColor,
                            radius: avatarRadius,
                            child: SvgPicture.asset(
                              'assets/icons/user_icon.svg',
                              width: avatarRadius * 1.5,
                              height: avatarRadius * 1.5,
                              color: isDarkMode ? null : AppColors.secondaryHeadlineColor,
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              decoration: BoxDecoration(
                                color: AppColors.primaryColor,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 4,
                                    offset: Offset(0, 2),
                                  ),
                                ],
                              ),
                              padding: EdgeInsets.all(iconSize * 0.4),
                              child: Icon(
                                Icons.edit,
                                color: Colors.white,
                                size: iconSize,
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(width: padding),
                      Expanded(
                        child: Padding(
                          padding: EdgeInsets.symmetric(
                            vertical: screenHeight * 0.05,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Edit your profile details here',
                                style: TextStyle(
                                  color: textColor,
                                  fontWeight: FontWeight.w600,
                                  fontSize: screenWidth * 0.035,
                                ),
                              ),
                              SizedBox(height: screenHeight * 0.005),
                              Text(
                                'Update your information to keep your account current',
                                style: TextStyle(
                                  color: subtitleColor,
                                  fontSize: screenWidth * 0.03,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: screenHeight * 0.05),
                  _buildInputField(
                    controller: _firstNameController,
                    label: 'First Name',
                    hint: 'Enter your first name',
                    textColor: textColor,
                    hintColor: subtitleColor,
                    fillColor: cardColor,
                    borderColor: borderColor,
                    isDarkMode: isDarkMode,
                  ),
                  SizedBox(height: screenHeight * 0.03),
                  _buildInputField(
                    controller: _lastNameController,
                    label: 'Last Name',
                    hint: 'Enter your last name',
                    textColor: textColor,
                    hintColor: subtitleColor,
                    fillColor: cardColor,
                    borderColor: borderColor,
                    isDarkMode: isDarkMode,
                  ),
                  SizedBox(height: screenHeight * 0.03),
                  _buildInputField(
                    controller: _emailController,
                    label: 'Email',
                    hint: 'Enter your email address',
                    keyboardType: TextInputType.emailAddress,
                    textColor: textColor,
                    hintColor: subtitleColor,
                    fillColor: cardColor,
                    borderColor: borderColor,
                    isDarkMode: isDarkMode,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required Color textColor,
    required Color hintColor,
    required Color fillColor,
    required Color borderColor,
    required bool isDarkMode,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: textColor,
            fontWeight: FontWeight.w500,
            fontSize: 14,
          ),
        ),
        SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: isDarkMode ? Colors.grey[400] : hintColor.withOpacity(0.6),
            ),
            filled: true,
            fillColor: isDarkMode ? Color(0xFF404040) : Colors.white,
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: borderColor,
                width: 1.0,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: AppColors.primaryColor,
                width: 1.5,
              ),
            ),
            contentPadding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
          ),
          onChanged: (_) => _onFieldChanged(),
          style: TextStyle(
            color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
            fontSize: 16,
          ),
          cursorColor: AppColors.primaryColor,
        ),
      ],
    );
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _loadingTimeout?.cancel();
    super.dispose();
  }
}