part of 'user_bloc.dart';

sealed class UserState extends Equatable {
  const UserState();

  @override
  List<Object> get props => [];
}

final class UserInitial extends UserState {}

final class UserLoading extends UserState {}

final class UserLoaded extends UserState {
  final ProfileResponseModel model;

  const UserLoaded(this.model);
  
  @override
  List<Object> get props => [model];
}

final class UserLoadingError extends UserState {
  final String message;

  const UserLoadingError(this.message);
  
  @override
  List<Object> get props => [message];
}

final class UserUpdating extends UserState {}

final class UserUpdateSuccess extends UserState {
  final ProfileResponseModel model;

  const UserUpdateSuccess(this.model);
  
  @override
  List<Object> get props => [model];
}

final class UserUpdateError extends UserState {
  final String message;

  const UserUpdateError(this.message);
  
  @override
  List<Object> get props => [message];
}