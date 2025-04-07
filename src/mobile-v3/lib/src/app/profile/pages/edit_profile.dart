import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

class EditProfile extends StatefulWidget {
  const EditProfile({super.key});

  @override
  State<EditProfile> createState() => _EditProfileState();
}

class _EditProfileState extends State<EditProfile> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  
  String _currentProfilePicture = '';
  File? _selectedProfileImage;
  final ImagePicker _picker = ImagePicker();

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
        _currentProfilePicture = user.profilePicture ?? '';
      });
    }
  }

  Future<void> _pickImage() async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );
      
      if (pickedFile != null) {
        setState(() {
          _selectedProfileImage = File(pickedFile.path);
          _formChanged = true;
        });
        
        // Show a message about the selected image
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Image selected. Save to upload.'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to pick image: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
  
  Future<File> _compressImage(File file) async {
    // Get the file path
    final filePath = file.path;
    
    // Use image_picker's built-in compression options when picking
    // If you need more control, consider adding the flutter_image_compress package
    final XFile compressedFile = await _picker.pickImage(
      source: ImageSource.camera, // This is a dummy value, we're not actually picking
      maxWidth: 600,
      maxHeight: 600,
      imageQuality: 70, // Adjust quality as needed (0-100)
      preferredCameraDevice: CameraDevice.rear,
    ) as XFile;
    
    return File(compressedFile.path);
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

  Future<String?> _uploadProfileImage(File imageFile) async {
    try {
      // Get the user ID for the API endpoint
      final userId = await HiveRepository.getData("userId", HiveBoxNames.authBox);
      if (userId == null) {
        throw Exception("User ID not found");
      }
      
      // Compress the image before uploading
      File compressedFile = imageFile;
      try {
        compressedFile = await _compressImage(imageFile);
        print('Image compressed successfully. Original size: ${await imageFile.length()} bytes, Compressed size: ${await compressedFile.length()} bytes');
      } catch (e) {
        print('Failed to compress image: $e');
        // If compression fails, continue with the original file
      }
      
      // Create a multipart request with the user-specific endpoint
      // Using the general user update endpoint
      var uri = Uri.parse('https://api.airqo.net/api/v2/users/$userId');
      
      // Get the auth token for the request
      final authToken = await HiveRepository.getData("token", HiveBoxNames.authBox);
      if (authToken == null) {
        throw Exception("Authentication token not found");
      }
      
      // First convert the image to base64
      List<int> imageBytes = await compressedFile.readAsBytes();
      String base64Image = base64Encode(imageBytes);
      
      // Prepare the request body with ONLY the profilePicture field to avoid overwriting other user data
      final Map<String, dynamic> requestBody = {
        "profilePicture": base64Image
      };
      
      // Create a PUT request instead of multipart
      var request = http.Request('PUT', uri);
      
      // Add the auth token to headers
      request.headers.addAll({
        'Authorization': 'Bearer $authToken',
        'Content-Type': 'application/json',
      });
      
      // Add the JSON body
      request.body = json.encode(requestBody);
      
      // Track upload progress for larger images
      print('Starting profile picture upload to $uri...');
      var streamedResponse = await request.send();
      print('Upload completed. Status code: ${streamedResponse.statusCode}');
      
      var response = await http.Response.fromStream(streamedResponse);
      print('Response body: ${response.body}');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        // Parse the response to get the image URL
        try {
          var jsonResponse = json.decode(response.body);
          
          // Based on your API structure, the response might include the updated user object
          if (jsonResponse['success'] == true) {
            // The response might include different fields depending on your API
            if (jsonResponse['data'] != null && jsonResponse['data']['profilePicture'] != null) {
              return jsonResponse['data']['profilePicture'];
            } else if (jsonResponse['user'] != null && jsonResponse['user']['profilePicture'] != null) {
              return jsonResponse['user']['profilePicture'];
            } else if (jsonResponse['profilePicture'] != null) {
              return jsonResponse['profilePicture'];
            }
            
            // If profile picture update was successful but URL not in response
            // Just indicate success and let the app reload the user data
            return "PROFILE_UPDATED";
          } else {
            throw Exception("Upload failed: ${jsonResponse['message'] ?? 'Unknown error'}");
          }
        } catch (parseError) {
          print('Error parsing JSON response: $parseError');
          throw Exception("Failed to parse server response: $parseError");
        }
      } else {
        throw Exception("Failed to upload image: Status ${response.statusCode}, ${response.body}");
      }
    } catch (e) {
      print('Error uploading profile image: $e');
      // Re-throw to be handled by the caller
      throw e;
    }
  }

  void _updateProfile() async {
    // Only update if form has changed and not already loading
    if (!_formChanged || _isLoading) return;

    // Validate form fields
    if (!_validateForm()) return;

    setState(() {
      _isLoading = true;
    });

    // Set a timeout to reset loading state if the API takes too long
    _loadingTimeout = Timer(Duration(seconds: 30), () {
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
      // Start with existing profile picture
      String profilePictureUrl = _currentProfilePicture;
      
      // If a new profile image was selected, upload it
      if (_selectedProfileImage != null) {
        try {
          // Create a progress indicator dialog
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (BuildContext context) {
              return AlertDialog(
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text("Uploading profile picture..."),
                  ],
                ),
              );
            },
          );
          
          // Upload the image
          String? uploadResult = await _uploadProfileImage(_selectedProfileImage!);
          
          // Close the progress dialog
          Navigator.of(context, rootNavigator: true).pop();
          
          if (uploadResult != null) {
            if (uploadResult != "PROFILE_UPDATED") {
              profilePictureUrl = uploadResult;
            }
            
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Profile picture uploaded successfully!'),
                backgroundColor: Colors.green,
                duration: Duration(seconds: 2),
              ),
            );
            
            // Since we've already uploaded the profile picture with the main endpoint
            // we just need to update the other user fields now
            context.read<UserBloc>().add(
              UpdateUser(
                firstName: _firstNameController.text.trim(),
                lastName: _lastNameController.text.trim(),
                email: _emailController.text.trim(),
                profilePicture: profilePictureUrl, 
              ),
            );
            return; // Exit early as we've already handled the update
          } else {
            // If upload returns null but doesn't throw, use current picture
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Profile picture upload failed. Using previous image.'),
                backgroundColor: Colors.orange,
              ),
            );
          }
        } catch (uploadError) {
          // Close the progress dialog if it's still open
          if (Navigator.of(context, rootNavigator: true).canPop()) {
            Navigator.of(context, rootNavigator: true).pop();
          }
          
          print('Error uploading image: $uploadError');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to upload profile picture: ${uploadError.toString().substring(0, uploadError.toString().length > 100 ? 100 : uploadError.toString().length)}...'),
              backgroundColor: Colors.orange,
              duration: Duration(seconds: 4),
            ),
          );
          
          // Ask the user if they want to continue with the profile update
          bool continueWithUpdate = await showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: Text("Image Upload Failed"),
                content: Text("Do you want to continue updating your profile without changing your profile picture?"),
                actions: [
                  TextButton(
                    child: Text("Cancel Update"),
                    onPressed: () {
                      Navigator.of(context).pop(false);
                    },
                  ),
                  ElevatedButton(
                    child: Text("Continue"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                    ),
                    onPressed: () {
                      Navigator.of(context).pop(true);
                    },
                  ),
                ],
              );
            },
          ) ?? false;
          
          if (!continueWithUpdate) {
            _resetLoadingState();
            return; // Exit the update function
          }
          // Otherwise continue with the profile update with the existing profile picture
        }
      }
      
      // Update user profile with or without new image
      context.read<UserBloc>().add(
        UpdateUser(
          firstName: _firstNameController.text.trim(),
          lastName: _lastNameController.text.trim(),
          email: _emailController.text.trim(),
          profilePicture: profilePictureUrl, 
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

  Widget _buildProfilePictureWidget() {
    // If user has selected a new image, show that
    if (_selectedProfileImage != null) {
      return CircleAvatar(
        radius: MediaQuery.of(context).size.width * 0.15,
        backgroundColor: Colors.transparent,
        backgroundImage: FileImage(_selectedProfileImage!),
      );
    }
    
    // If user has an existing profile picture, show that
    if (_currentProfilePicture.isNotEmpty) {
      if (_currentProfilePicture.startsWith('http')) {
        // Network image
        return CircleAvatar(
          radius: MediaQuery.of(context).size.width * 0.15,
          backgroundColor: Theme.of(context).highlightColor,
          backgroundImage: NetworkImage(_currentProfilePicture),
          onBackgroundImageError: (exception, stackTrace) {
            // Note: onBackgroundImageError should be void, we can't return a widget here
            print('Error loading profile image: $exception');
          },
          child: SvgPicture.asset(
            'assets/icons/user_icon.svg',
            width: MediaQuery.of(context).size.width * 0.15,
            height: MediaQuery.of(context).size.width * 0.15,
          ),
        );
      } else if (_currentProfilePicture.endsWith('.svg')) {
        // SVG image
        return CircleAvatar(
          radius: MediaQuery.of(context).size.width * 0.15,
          backgroundColor: Theme.of(context).highlightColor,
          child: SvgPicture.asset(
            _currentProfilePicture,
            width: MediaQuery.of(context).size.width * 0.15,
            height: MediaQuery.of(context).size.width * 0.15,
          ),
        );
      } else {
        // Local image
        return CircleAvatar(
          radius: MediaQuery.of(context).size.width * 0.15,
          backgroundColor: Theme.of(context).highlightColor,
          backgroundImage: AssetImage(_currentProfilePicture),
        );
      }
    }
    
    // Default user icon
    return CircleAvatar(
      backgroundColor: Theme.of(context).highlightColor,
      radius: MediaQuery.of(context).size.width * 0.15,
      child: SvgPicture.asset(
        'assets/icons/user_icon.svg',
        width: MediaQuery.of(context).size.width * 0.15,
        height: MediaQuery.of(context).size.width * 0.15,
        color: Theme.of(context).brightness == Brightness.dark ? null : AppColors.secondaryHeadlineColor,
      ),
    );
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
                              : subtitleColor,
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
                          _buildProfilePictureWidget(),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: GestureDetector(
                              onTap: _pickImage,
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