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
      emit(const PasswordResetLoading());

      try {

        if (RegExp(r'^\d{5}$').hasMatch(event.pin)) { // Replace with actual logic
          emit(const PasswordResetVerified(
            message: "PIN successfully verified. Proceed to reset password.",
          ));
        } else {
          emit(const PasswordResetError(
            message: "Invalid PIN. Please try again.",
          ));
        }
      } catch (e) {
        emit(const PasswordResetError(
          message: "Failed to verify PIN.",
        ));
      }
    });

  }

  String _getErrorMessage(String error) {
    // Remove "Exception: " prefix if present
    String cleanError = error.replaceAll('Exception: ', '');
    
    // Convert technical errors to user-friendly messages
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
    
    // If no specific error pattern matches, return a generic user-friendly message
    if (cleanError.isEmpty || cleanError.toLowerCase().contains('something went wrong')) {
      return 'Unable to send reset code. Please try again.';
    }
    
    // Return the cleaned error if it's already user-friendly
    return cleanError;
  }
}
