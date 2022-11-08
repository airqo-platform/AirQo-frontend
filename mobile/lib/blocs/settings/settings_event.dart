part of 'settings_bloc.dart';

abstract class SettingsEvent extends Equatable {
  const SettingsEvent();
}

class DeleteAccount extends SettingsEvent {
  const DeleteAccount({
    required this.context,
  });
  final BuildContext context;
  @override
  List<Object?> get props => [];
}

class AccountPreDeletionFailed extends SettingsEvent {
  const AccountPreDeletionFailed(this.authenticationError);
  final AuthenticationError authenticationError;
  @override
  List<Object?> get props => [authenticationError];
}

class AccountPreDeletionPassed extends SettingsEvent {
  const AccountPreDeletionPassed();
  @override
  List<Object?> get props => [];
}
