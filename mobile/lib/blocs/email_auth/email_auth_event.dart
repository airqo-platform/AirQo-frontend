part of 'email_auth_bloc.dart';

abstract class EmailAuthEvent extends Equatable {
  const EmailAuthEvent();
}

class InitializeEmailAuth extends EmailAuthEvent {
  const InitializeEmailAuth({
    required this.emailAddress,
    required this.authProcedure,
  });
  final String emailAddress;
  final AuthProcedure authProcedure;

  @override
  List<Object> get props => [emailAddress, authProcedure];
}

class UpdateEmailAddress extends EmailAuthEvent {
  const UpdateEmailAddress(this.emailAddress);
  final String emailAddress;
  @override
  List<Object> get props => [emailAddress];
}

class ClearEmailAddress extends EmailAuthEvent {
  const ClearEmailAddress();
  @override
  List<Object> get props => [];
}

class UpdateEmailAuthStatus extends EmailAuthEvent {
  const UpdateEmailAuthStatus(this.status);
  final EmailAuthStatus status;
  @override
  List<Object> get props => [status];
}

class UpdateEmailAuthErrorMessage extends EmailAuthEvent {
  const UpdateEmailAuthErrorMessage(this.errorMessage);

  final String errorMessage;
  @override
  List<Object> get props => [errorMessage];
}

class UpdateEmailAuthModel extends EmailAuthEvent {
  const UpdateEmailAuthModel(this.model);

  final EmailAuthModel model;
  @override
  List<Object> get props => [model];
}

class UpdateEmailAuthCountDown extends EmailAuthEvent {
  const UpdateEmailAuthCountDown(this.countDown);
  final int countDown;
  @override
  List<Object> get props => [countDown];
}
