import 'package:equatable/equatable.dart';

class User extends Equatable {
  const User({
    required this.id,
    this.email,
    this.name,
  });

  final String id;
  final String? email;
  final String? name;

  // Static empty instance of User
  static const empty = User(id: '');

  // Method to check if the User instance is empty
  bool get isEmpty => this == User.empty;

  // Method to check if the User instance is not empty
  bool get isNotEmpty => this != User.empty;

  @override
  List<Object?> get props => [id, email, name];
}
