import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:airqo/src/app/profile/bloc/user_bloc.dart';
import 'package:airqo/src/app/profile/pages/widgets/profile_picture_selector.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:loggy/loggy.dart';

class EditProfile extends StatefulWidget {
  const EditProfile({super.key});

  @override
  State<EditProfile> createState() => _EditProfileState();
}

class _EditProfileState extends State<EditProfile> with UiLoggy {
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

  Future<String?> _uploadImageToCloudinary(File imageFile) async {
    try {
      final String cloudName = dotenv.env['NEXT_PUBLIC_CLOUDINARY_NAME'] ?? '';
      final cloudinaryUrl =
          'https://api.cloudinary.com/v1_1/$cloudName/image/upload';
      var request = http.MultipartRequest('POST', Uri.parse(cloudinaryUrl));

      request.fields['upload_preset'] =
          dotenv.env['NEXT_PUBLIC_CLOUDINARY_PRESET'] ?? '';
      request.fields['folder'] = 'profiles';

      String extension = imageFile.path.split('.').last.toLowerCase();
      String mimeType = extension == 'png' ? 'png' : 'jpeg';
      request.files.add(await http.MultipartFile.fromPath(
        'file',
        imageFile.path,
        contentType: MediaType('image', mimeType),
      ));

      loggy.info('Uploading image to Cloudinary...');
      var streamedResponse = await request.send().timeout(
        const Duration(seconds: 60),
        onTimeout: () {
          throw TimeoutException('Image upload timed out');
        },
      );
      var response = await http.Response.fromStream(streamedResponse);
      loggy.info(
          'Cloudinary response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        var jsonResponse = json.decode(response.body);
        return jsonResponse['secure_url'];
      } else {
        throw Exception(
            'Cloudinary upload failed: ${response.statusCode}, ${response.body}');
      }
    } catch (e) {
      loggy.warning('Error uploading image to Cloudinary: $e');
      throw e;
    }
  }

  Future<String?> _uploadProfileImage(File imageFile) async {
    try {
      // Upload to Cloudinary
      final imageUrl = await _uploadImageToCloudinary(imageFile);
      if (imageUrl == null) {
        throw Exception("Failed to get image URL from Cloudinary");
      }

      setState(() {
        _currentProfilePicture = imageUrl;
      });

      final userId = await AuthHelper.getCurrentUserId();
      if (userId == null) {
        throw Exception("No valid user ID found - user may not be authenticated");
      }

      // Update user details on the server
      var uri = Uri.parse('https://api.airqo.net/api/v2/users/$userId');
      final authToken = await SecureStorageRepository.instance.getSecureData(SecureStorageKeys.authToken);
      if (authToken == null) {
        throw Exception("Authentication token not found");
      }

      var body = {
        'firstName': _firstNameController.text.trim(),
        'lastName': _lastNameController.text.trim(),
        'email': _emailController.text.trim(),
        'profilePicture': imageUrl,
      };

      loggy.info(
          'Updating profile at $uri with limited details: firstName & lastName...');
      var response = await http.put(
        uri,
        headers: {
          'Authorization': 'JWT $authToken',
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      );
      loggy.info('Update completed. Status code: ${response.statusCode}');
      loggy.info('Response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        var jsonResponse = json.decode(response.body);
        if (jsonResponse['success'] == true) {
          context.read<UserBloc>().add(UpdateUser(
                firstName: _firstNameController.text.trim(),
                lastName: _lastNameController.text.trim(),
                email: _emailController.text.trim(),
                profilePicture: imageUrl,
              ));

          return jsonResponse['user']?['profilePicture'] ?? "PROFILE_UPDATED";
        } else {
          throw Exception("Server returned success:false: ${response.body}");
        }
      } else {
        throw Exception(
            "Failed to update profile: Status ${response.statusCode}, ${response.body}");
      }
    } catch (e) {
      loggy.warning('Error uploading/updating profile image: $e');
      rethrow;
    }
  }

  void _updateProfile() async {
    if (!_formChanged || _isLoading) return;

    if (!_validateForm()) return;

    final isExpired = await AuthHelper.isTokenExpired();
    if (isExpired && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please log in again to continue.'),
          backgroundColor: Colors.red,
        ),
      );
      Navigator.of(context).pop();
      return;
    }

    setState(() {
      _isLoading = true;
    });

    _loadingTimeout = Timer(Duration(seconds: 30), () {
      if (_isLoading && mounted) {
        _resetLoadingState();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('This is taking longer than expected. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    });

    try {
      if (_selectedProfileImage != null) {
        // Upload and update profile
        String? uploadResult = await _uploadProfileImage(_selectedProfileImage!);

        if (uploadResult != null) {
          _resetLoadingState();
          setState(() {
            _formChanged = false;
            _selectedProfileImage = null;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Profile image successfully added'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 4),
            ),
          );

          context.read<UserBloc>().add(LoadUser());
          Navigator.of(context).pop();
        }
      } else {
        context.read<UserBloc>().add(
              UpdateUser(
                firstName: _firstNameController.text.trim(),
                lastName: _lastNameController.text.trim(),
                email: _emailController.text.trim(),
              ),
            );
      }
    } catch (e) {
      _resetLoadingState();
      setState(() {
        _selectedProfileImage = null;
      });

      String userFriendlyMessage = 'Unable to update profile. Please try again.';
      
      final errorString = e.toString().toLowerCase();
      if (errorString.contains('unauthorized') || errorString.contains('session has expired') || errorString.contains('please log in again to continue')) {
        userFriendlyMessage = 'Please log in again to continue.';
      } else if (errorString.contains('network') || errorString.contains('timeout')) {
        userFriendlyMessage = 'Check your internet connection and try again.';
      } else if (errorString.contains('server') || errorString.contains('500')) {
        userFriendlyMessage = 'Something went wrong. Please try again later.';
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(userFriendlyMessage),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 4),
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: () => _updateProfile(),
            ),
          ),
        );
      }
    }
  }

  void _onFieldChanged() {
    setState(() {
      _formChanged = true;
    });
  }

  Widget _buildProfilePictureWidget() {
    Widget profilePicture;

    // If user has selected a new image, show that
    if (_selectedProfileImage != null) {
      profilePicture = CircleAvatar(
        radius: MediaQuery.of(context).size.width * 0.15,
        backgroundColor: Colors.transparent,
        backgroundImage: FileImage(_selectedProfileImage!),
      );
    } else if (_currentProfilePicture.isNotEmpty) {
      if (_currentProfilePicture.startsWith('http')) {
        profilePicture = CircleAvatar(
          radius: MediaQuery.of(context).size.width * 0.15,
          backgroundColor: Theme.of(context).highlightColor,
          backgroundImage: NetworkImage(_currentProfilePicture),
          onBackgroundImageError: (exception, stackTrace) {
            loggy.warning('Error loading profile image: $exception');
          },
        );
      } else if (_currentProfilePicture.endsWith('.svg')) {
        profilePicture = CircleAvatar(
          radius: MediaQuery.of(context).size.width * 0.15,
          backgroundColor: Theme.of(context).highlightColor,
          child: SvgPicture.asset(
            _currentProfilePicture,
            width: MediaQuery.of(context).size.width * 0.15,
            height: MediaQuery.of(context).size.width * 0.15,
          ),
        );
      } else {
        profilePicture = CircleAvatar(
          radius: MediaQuery.of(context).size.width * 0.15,
          backgroundColor: Theme.of(context).highlightColor,
          backgroundImage: AssetImage(_currentProfilePicture),
        );
      }
    } else {
      // Default user icon
      profilePicture = CircleAvatar(
        backgroundColor: Theme.of(context).highlightColor,
        radius: MediaQuery.of(context).size.width * 0.15,
        child: SvgPicture.asset(
          'assets/icons/user_icon.svg',
          width: MediaQuery.of(context).size.width * 0.15,
          height: MediaQuery.of(context).size.width * 0.15,
          color: Theme.of(context).brightness == Brightness.dark
              ? null
              : AppColors.secondaryHeadlineColor,
        ),
      );
    }

    // Add loading overlay if uploading
    if (_isLoading && _selectedProfileImage != null) {
      return Stack(
        alignment: Alignment.center,
        children: [
          profilePicture,
          Container(
            width: MediaQuery.of(context).size.width * 0.3,
            height: MediaQuery.of(context).size.width * 0.3,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.black.withOpacity(0.5),
            ),
            child: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
                strokeWidth: 3,
              ),
            ),
          ),
        ],
      );
    }

    return profilePicture;
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    final padding = screenWidth * 0.05;
    final iconSize = screenWidth * 0.06;

    // Theme-based colors
    final textColor = isDarkMode ? Colors.white : AppColors.boldHeadlineColor4;
    final subtitleColor =
        isDarkMode ? Colors.grey : AppColors.secondaryHeadlineColor;
    final backgroundColor =
        isDarkMode ? AppColors.darkThemeBackground : AppColors.backgroundColor;
    final cardColor = isDarkMode ? AppColors.highlightColor : Colors.white;
    final borderColor =
        isDarkMode ? Colors.grey[800] ?? Colors.grey : AppColors.borderColor2;

    return BlocConsumer<UserBloc, UserState>(
      listener: (context, state) {
        loggy.info('Current state: $state');

        if (state is UserUpdateSuccess) {
          _resetLoadingState();
          setState(() {
            _formChanged = false;
          });


          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Profile updated successfully'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 4),
            ),
          );

          Navigator.of(context).pop();
        } else if (state is UserUpdateError) {
          _resetLoadingState();

          String userFriendlyMessage = 'Unable to update profile. Please try again.';
          
          final errorString = state.message.toLowerCase();
          if (errorString.contains('unauthorized') || errorString.contains('session has expired') || errorString.contains('please log in again to continue')) {
            userFriendlyMessage = 'Please log in again to continue.';
          } else if (errorString.contains('network') || errorString.contains('timeout')) {
            userFriendlyMessage = 'Check your internet connection and try again.';
          } else if (errorString.contains('server') || errorString.contains('500')) {
            userFriendlyMessage = 'Something went wrong. Please try again later.';
          }

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(userFriendlyMessage),
              backgroundColor: Colors.red,
              duration: Duration(seconds: 4),
              action: SnackBarAction(
                label: 'Retry',
                textColor: Colors.white,
                onPressed: () => _updateProfile(),
              ),
            ),
          );
        }
      },
      builder: (context, state) {
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
                child: Tooltip(
                  message: _isLoading ? 'Uploading...' : 'Save changes',
                  child: _isLoading
                      ? SizedBox(
                          width: 24,
                          height: 24,
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
              ),
              SizedBox(
                width: 8,
              ),
            ],
          ),
          body: AbsorbPointer(
            absorbing: _isLoading,
            child: SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ProfilePictureSelector(
                          currentProfilePicture: _currentProfilePicture,
                          firstName: _firstNameController.text,
                          lastName: _lastNameController.text,
                          onImageSelected: (file) {
                            setState(() {
                              _selectedProfileImage = file;
                              _formChanged = true;
                            });
                          },
                          onRemoveImage: () {
                            setState(() {
                              _selectedProfileImage = null;
                              _currentProfilePicture = '';
                              _formChanged = true;
                            });
                          },
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