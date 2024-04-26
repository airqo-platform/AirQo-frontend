import 'package:equatable/equatable.dart';
//import userModel
// /models/models.dart
import 'package:app/other/lib/models/models.dart';

enum AppStatus { authenticated, unauthenticated }

class AppState extends Equatable {
  final AppStatus status;
  final User user;

  const AppState._({
    this.status = AppStatus.unauthenticated,
    this.user = User.empty,
  });

  const AppState.authenticated(User user)
      : this._(
          status: AppStatus.authenticated,
          user: user,
        );

  const AppState.unauthenticated() : this._(status: AppStatus.unauthenticated);

  @override
  List<Object> get props => [status, user];
}
