// AuthRepository
import 'dart:async';
import 'package:app/other/lib/models/user_model.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;

class AuthRepository {
  final firebase_auth.FirebaseAuth _firebaseAuth;

  AuthRepository({firebase_auth.FirebaseAuth? firebaseAuth})
      : _firebaseAuth = firebaseAuth ?? firebase_auth.FirebaseAuth.instance;

  // Stores the current user's information
  var currentUser = User.empty;

  // Provides a stream of the current user's information
  Stream<User> get user {
    return _firebaseAuth.authStateChanges().map((firebaseUser) {
      // Convert the firebase_auth.User to the custom User model
      final user = firebaseUser == null ? User.empty : firebaseUser.toUser;
      currentUser = user;
      return user;
    });
  }

  // Sign up a new user with email and password
  Future<void> signup({
    required String email,
    required String password,
  }) async {
    try {
      // Create a new user with the provided email and password
      await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (_) {
      // Handle any errors that occurred during the signup process
    }
  }
  

  // Log in a user with email and password
  Future<void> logInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      // Sign in the user with the provided email and password
      await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } catch (_) {
      // Handle any errors that occurred during the login process
    }
  }

  // Log out the current user
  Future<void> logOut() async {
    try {
      // Sign out the user
      await Future.wait([
        _firebaseAuth.signOut(),
      ]);
    } catch (_) {
      // Handle any errors that occurred during the logout process
    }
  }
}

// Extension method to convert firebase_auth.User to the custom User model
extension on firebase_auth.User {
  User get toUser {
    return User(
      id: uid,
      email: email ?? '',
      name: displayName ?? '',
    );
  }
}
