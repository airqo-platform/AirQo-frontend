import 'package:flutter_bloc/flutter_bloc.dart';
import '../../repository/auth_repository.dart';
import 'forgot_password_event.dart';
import 'forgot_password_state.dart';


class PasswordResetBloc extends Bloc<PasswordResetEvent, PasswordResetState> {
  final AuthRepository authRepository;

  PasswordResetBloc({required this.authRepository}) : super(PasswordResetInitial()) {
    on<RequestPasswordReset>((event, emit) async {
      try {
        emit(PasswordResetLoading(email: event.email));
        await authRepository.requestPasswordReset(event.email);
        emit(PasswordResetSuccess(message: '',email: event.email ));
      } catch (e) {
        String errorMessage = _getErrorMessage(e.toString());
        emit(PasswordResetError(message: errorMessage));
      }
    });

    on<UpdatePassword>((event, emit) async {
      emit(PasswordResetLoading());
      try {
        final message = await authRepository.updatePassword(
          confirmPassword: event.confirmPassword,
          password: event.password,
          token: event.token,
        );
        emit(PasswordResetSuccess(message: message));
      } catch (error) {
        emit(PasswordResetError(message: 'Failed to update password. \nPlease re-check the code you entered'));
      }
    });

    on<VerifyResetCodeEvent>((event, emit) async {
      final currentState = state;
      String? email;
      if (currentState.email != null) {
        email = currentState.email;
      }

      emit(PasswordResetLoading(email: email));

      try {

        if (email == null || email.isEmpty) {
          emit(const PasswordResetError(
            message: "Session expired. Please start the password reset process again.",
          ));
          return;
        }

        final token = await authRepository.verifyResetPin(event.pin, email);
        
        emit(PasswordResetVerified(
          message: "PIN successfully verified. Proceed to reset password.",
          token: token,
        ));
      } catch (e) {
        String errorMessage = _getErrorMessage(e.toString());
        emit(PasswordResetError(message: errorMessage));
      }
    });
  }

  String _getErrorMessage(String error) {
    String cleanError = error.replaceAll('Exception: ', '');
    
    if (cleanError.toLowerCase().contains('user not found') || 
        cleanError.toLowerCase().contains('email not found') ||
        cleanError.toLowerCase().contains('no user found')) {
      return 'No account found with this email address.';
    }
    
    if (cleanError.toLowerCase().contains('invalid email') ||
        cleanError.toLowerCase().contains('email format')) {
      return 'Please enter a valid email address.';
    }
    
    if (cleanError.toLowerCase().contains('network') ||
        cleanError.toLowerCase().contains('connection') ||
        cleanError.toLowerCase().contains('timeout')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (cleanError.toLowerCase().contains('server error') ||
        cleanError.toLowerCase().contains('internal server error') ||
        cleanError.toLowerCase().contains('500')) {
      return 'Server error. Please try again later.';
    }
    
    if (cleanError.toLowerCase().contains('too many requests') ||
        cleanError.toLowerCase().contains('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    if (cleanError.toLowerCase().contains('unauthorized') ||
        cleanError.toLowerCase().contains('401')) {
      return 'Authentication error. Please try again.';
    }
    
    if (cleanError.toLowerCase().contains('forbidden') ||
        cleanError.toLowerCase().contains('403')) {
      return 'Access denied. Please contact support.';
    }
    
    if (cleanError.toLowerCase().contains('bad request') ||
        cleanError.toLowerCase().contains('400')) {
      return 'Invalid request. Please check your email and try again.';
    }
    
    if (cleanError.isEmpty || cleanError.toLowerCase().contains('something went wrong')) {
      return 'Unable to send reset code. Please try again.';
    }
    
    return cleanError;
  }
}
