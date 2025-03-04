import 'dart:async';
import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
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
    final emailRegExp = RegExp(r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+");
    return emailRegExp.hasMatch(email);
  }

  bool _validateForm() {
    if (_firstNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('First name cannot be empty')),
      );
      return false;
    }
    
    if (_lastNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Last name cannot be empty')),
      );
      return false;
    }
    
    if (_emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Email cannot be empty')),
      );
      return false;
    }
    
    if (!_validateEmail(_emailController.text.trim())) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter a valid email address')),
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
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    final avatarRadius = screenWidth * 0.15;
    final padding = screenWidth * 0.05;
    final iconSize = screenWidth * 0.07;

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
          appBar: AppBar(
            leading: IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () {
                if (_formChanged) {
                  // Show confirmation dialog if changes were made
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: Text('Discard Changes?'),
                      content: Text('You have unsaved changes. Are you sure you want to go back?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: Text('Cancel'),
                        ),
                        ElevatedButton(
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
            title: Center(
              child: Text(
                'Edit Profile',
                style: TextStyle(fontSize: 20),
              ),
            ),
            actions: [
              TextButton(
                onPressed: _isLoading ? null : _updateProfile,
                child: _isLoading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        'Done',
                        style: TextStyle(
                          color: _formChanged ? Colors.white : Colors.white.withOpacity(0.5),
                          fontWeight: FontWeight.bold,
                          fontSize: 16.0,
                        ),
                      ),
              ),
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
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.blue,
                                shape: BoxShape.circle,
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
                                  fontWeight: FontWeight.bold,
                                  fontSize: screenWidth * 0.035,
                                ),
                              ),
                              SizedBox(height: screenHeight * 0.005),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: screenHeight * 0.05),
                  TextField(
                    controller: _firstNameController,
                    decoration: InputDecoration(
                      labelText: 'First Name',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => _onFieldChanged(),
                  ),
                  SizedBox(height: screenHeight * 0.03),
                  TextField(
                    controller: _lastNameController,
                    decoration: InputDecoration(
                      labelText: 'Last Name',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => _onFieldChanged(),
                  ),
                  SizedBox(height: screenHeight * 0.03),
                  TextField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      labelText: 'Email',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) => _onFieldChanged(),
                  ),
                ],
              ),
            ),
          ),
        );
      },
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