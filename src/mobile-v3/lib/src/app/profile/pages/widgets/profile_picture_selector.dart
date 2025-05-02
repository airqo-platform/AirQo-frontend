import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loggy/loggy.dart';

class ProfilePictureSelector extends StatefulWidget {
  final String? currentProfilePicture;
  final Function(File?) onImageSelected;
  final Function()? onRemoveImage;

  const ProfilePictureSelector({
    super.key,
    this.currentProfilePicture,
    required this.onImageSelected,
    this.onRemoveImage,
  });

  @override
  State<ProfilePictureSelector> createState() => _ProfilePictureSelectorState();
}

class _ProfilePictureSelectorState extends State<ProfilePictureSelector> with UiLoggy {
  File? _selectedProfileImage;
  final ImagePicker _picker = ImagePicker();

  // Get initial letters for avatar
  String _getInitials(BuildContext context) {
    // You can extract this from user data if available
    return "?";
  }

  // Build profile picture widget based on current state
  Widget _buildProfilePictureWidget() {
    final avatarRadius = MediaQuery.of(context).size.width * 0.15;
    
    // If user has selected a new image, show that
    if (_selectedProfileImage != null) {
      return CircleAvatar(
        radius: avatarRadius,
        backgroundColor: Colors.transparent,
        backgroundImage: FileImage(_selectedProfileImage!),
      );
    }

    if (widget.currentProfilePicture != null && widget.currentProfilePicture!.isNotEmpty) {
      if (widget.currentProfilePicture!.startsWith('http')) {
        return CircleAvatar(
          radius: avatarRadius,
          backgroundColor: Theme.of(context).highlightColor,
          backgroundImage: NetworkImage(widget.currentProfilePicture!),
          onBackgroundImageError: (exception, stackTrace) {
            loggy.warning('Error loading profile image: $exception');
          }
        );
      } else if (widget.currentProfilePicture!.endsWith('.svg')) {
        return CircleAvatar(
          radius: avatarRadius,
          backgroundColor: Theme.of(context).highlightColor,
          child: SvgPicture.asset(
            widget.currentProfilePicture!,
            width: avatarRadius,
            height: avatarRadius,
          ),
        );
      } else {
        return CircleAvatar(
          radius: avatarRadius,
          backgroundColor: Theme.of(context).highlightColor,
          backgroundImage: AssetImage(widget.currentProfilePicture!),
        );
      }
    }

    // Default user icon with initials
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return CircleAvatar(
      backgroundColor: Theme.of(context).highlightColor,
      radius: avatarRadius,
      child: Text(
        _getInitials(context),
        style: TextStyle(
          fontSize: avatarRadius * 0.7,
          fontWeight: FontWeight.bold,
          color: isDarkMode 
            ? Colors.white70
            : AppColors.secondaryHeadlineColor,
        ),
      ),
    );
  }

  // Show bottom sheet with options
  void _showImageSourceActionSheet() {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDarkMode 
        ? Color(0xFF2E2F33) // Dark background
        : Colors.white;     // Light background
    
    final textColor = isDarkMode 
        ? Colors.white 
        : AppColors.boldHeadlineColor4;
    
    final iconColor = isDarkMode
        ? Colors.white70
        : Colors.grey.shade700;
        
    final destructiveColor = Colors.red;
    
    showModalBottomSheet(
      context: context,
      backgroundColor: backgroundColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Option: Choose from library
            ListTile(
              leading: CircleAvatar(
                backgroundColor: isDarkMode ? Colors.grey.shade800 : Colors.grey.shade200,
                child: Icon(Icons.photo_library, color: iconColor),
              ),
              title: Text('Choose from library', style: TextStyle(color: textColor)),
              onTap: () {
                Navigator.of(context).pop();
                _pickImage(ImageSource.gallery);
              },
            ),
            
            // Option: Take photo
            ListTile(
              leading: CircleAvatar(
                backgroundColor: isDarkMode ? Colors.grey.shade800 : Colors.grey.shade200,
                child: Icon(Icons.camera_alt, color: iconColor),
              ),
              title: Text('Take photo', style: TextStyle(color: textColor)),
              onTap: () {
                Navigator.of(context).pop();
                _pickImage(ImageSource.camera);
              },
            ),
            
            // Option: Remove current picture (if there is one)
            if (widget.currentProfilePicture != null && widget.currentProfilePicture!.isNotEmpty || _selectedProfileImage != null)
              ListTile(
                leading: CircleAvatar(
                  backgroundColor: isDarkMode ? Colors.grey.shade800 : Colors.grey.shade200,
                  child: Icon(Icons.delete, color: destructiveColor),
                ),
                title: Text('Remove current picture', style: TextStyle(color: destructiveColor)),
                onTap: () {
                  Navigator.of(context).pop();
                  _removeProfilePicture();
                },
              ),
              
            SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  // Pick image from gallery or camera
  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );

      if (!mounted) return;
      if (pickedFile != null) {
        setState(() {
          _selectedProfileImage = File(pickedFile.path);
        });
        widget.onImageSelected(_selectedProfileImage);
      }
    } catch (e) {
      if (!mounted) return;
      loggy.error('Error picking image: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to pick image: $e')),
      );
    }
  }

  // Remove profile picture
  void _removeProfilePicture() {
    setState(() {
      _selectedProfileImage = null;
    });
    if (widget.onRemoveImage != null) {
      widget.onRemoveImage!();
    } else {
      widget.onImageSelected(null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        _buildProfilePictureWidget(),
        Positioned(
          bottom: 0,
          right: 0,
          child: GestureDetector(
            onTap: _showImageSourceActionSheet,
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
              padding: EdgeInsets.all(8),
              child: Icon(
                Icons.camera_alt,
                color: Colors.white,
                size: 18,
              ),
            ),
          ),
        ),
      ],
    );
  }
}