import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app/blocs/auth_code/auth_code_bloc.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

part 'account_event.dart';
part 'account_state.dart';

class AccountBloc extends Bloc<AccountEvent, AccountState> {
  AccountBloc() : super(const AccountState.initial()) {
    on<FetchAccountInfo>(_onFetchAccountInfo);
    on<LoadAccountInfo>(_onLoadAccountInfo);
    on<LogOutAccount>(_onLogOutAccount);
    on<DeleteAccount>(_onDeleteAccount);
    on<AccountDeletionCheck>(_accountDeletionCheck);
    on<EditProfile>(_onEditProfile);
    on<UpdateProfile>(_onUpdateProfile);
    on<RefreshProfile>(_onRefreshProfile);
    on<UpdateProfilePreferences>(_onUpdateProfilePreferences);
  }

  @override
  Future<void> onError(Object error, StackTrace stackTrace) async {
    await logException(error, stackTrace);
    super.onError(error, stackTrace);
  }

  Future<Profile> _getProfile() async {
    return state.profile ?? await Profile.initializeGuestProfile();
  }

  Future<void> _onUpdateProfilePreferences(
    UpdateProfilePreferences event,
    Emitter<AccountState> emit,
  ) async {
    emit(state.copyWith(blocStatus: BlocStatus.updatingData));

    final profile = await _getProfile();

    profile.preferences.notifications =
        event.notifications ?? profile.preferences.notifications;
    profile.preferences.location =
        event.location ?? profile.preferences.location;

    emit(state.copyWith(profile: profile, blocStatus: BlocStatus.initial));

    await HiveService.loadProfile(profile);

    if (event.notifications ?? false) {
      await CloudAnalytics.logEvent(CloudAnalyticsEvent.allowNotification);
    }

    if (event.location ?? false) {
      await CloudAnalytics.logEvent(CloudAnalyticsEvent.allowLocation);
    }

    final hasConnection = await hasNetworkConnection();
    if (hasConnection) {
      await CloudStore.updateProfile(profile);
    }
  }

  Future<void> _onLoadAccountInfo(
    LoadAccountInfo _,
    Emitter<AccountState> emit,
  ) async {
    final profile = await Profile.getProfile();

    emit(const AccountState.initial().copyWith(
      profile: profile,
      guestUser: CustomAuth.isGuestUser(),
    ));

    return;
  }

  Future<void> _onRefreshProfile(
    RefreshProfile _,
    Emitter<AccountState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.noInternetConnection,
      ));
    }
    emit(state.copyWith(blocStatus: BlocStatus.updatingData));

    final profile = await Profile.getProfile();

    return emit(state.copyWith(
      profile: profile,
      guestUser: CustomAuth.isGuestUser(),
      blocStatus: BlocStatus.initial,
    ));
  }

  Future<void> _onUpdateProfile(
    UpdateProfile _,
    Emitter<AccountState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.noInternetConnection,
      ));
    }

    final profile = await _getProfile();

    if (!profile.firstName.isValidName()) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.invalidFirstName,
      ));
    }

    if (!profile.lastName.isValidName()) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.invalidLastName,
      ));
    }

    emit(state.copyWith(blocStatus: BlocStatus.processing));

    final user = CustomAuth.getUser();
    if (user != null && !CustomAuth.isGuestUser()) {
      profile
        ..userId = user.uid
        ..phoneNumber = user.phoneNumber ?? ''
        ..emailAddress = user.email ?? '';
    }

    profile
      ..device = await CloudMessaging.getDeviceToken() ?? ''
      ..utcOffset = DateTime.now().getUtcOffset();

    final hiveProfile =
        Hive.box<Profile>(HiveBox.profile).get(HiveBox.profile) ?? profile;

    emit(state.copyWith(blocStatus: BlocStatus.initial));

    if (hiveProfile.photoUrl != profile.photoUrl) {
      await profile.update();
      await _uploadPicture(emit: emit);
    } else {
      await profile.update();
    }
  }

  Future<void> _uploadPicture({
    required Emitter<AccountState> emit,
  }) async {
    try {
      final profile = await _getProfile();

      final imageUrl = await CloudStore.uploadProfilePicture(profile.photoUrl);
      if (imageUrl.isNotEmpty) {
        // TODO verify profile updating
        emit(state.copyWith(profile: profile..photoUrl = imageUrl));

        await Future.wait([
          CloudAnalytics.logEvent(
            CloudAnalyticsEvent.uploadProfilePicture,
          ),
          profile.update(),
        ]);
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  Future<void> _onEditProfile(
    EditProfile event,
    Emitter<AccountState> emit,
  ) async {
    final profile = await _getProfile();

    return emit(state.copyWith(
      profile: profile
        ..firstName = event.firstName ?? profile.firstName
        ..lastName = event.lastName ?? profile.lastName
        ..photoUrl = event.photoUrl ?? profile.photoUrl,
    ));
  }

  Future<void> _accountDeletionCheck(
    AccountDeletionCheck event,
    Emitter<AccountState> emit,
  ) async {
    return emit(state.copyWith(
      blocStatus: event.passed
          ? BlocStatus.accountDeletionCheckSuccess
          : BlocStatus.error,
      blocError: event.passed ? AuthenticationError.none : event.error,
    ));
  }

  Future<void> _fetchAccountInfo(
    Emitter<AccountState> emit,
  ) async {
    emit(const AccountState.initial()
        .copyWith(guestUser: CustomAuth.isGuestUser()));

    await Future.wait([
      _fetchProfile(emit),
    ]);
  }

  Future<void> _onFetchAccountInfo(
    FetchAccountInfo _,
    Emitter<AccountState> emit,
  ) async {
    await _fetchAccountInfo(emit);
  }

  Future<void> _onLogOutAccount(
    LogOutAccount event,
    Emitter<AccountState> emit,
  ) async {
    final action = await showDialog<ConfirmationAction>(
      context: event.context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const AuthProcedureDialog(
          authProcedure: AuthProcedure.logout,
        );
      },
    );

    if (action == null || action == ConfirmationAction.cancel) {
      return;
    }

    final bool hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.noInternetConnection,
      ));
    }

    emit(state.copyWith(
      blocStatus: BlocStatus.processing,
      blocError: AuthenticationError.none,
    ));

    final successful = await AppService().authenticateUser(
      authProcedure: AuthProcedure.logout,
    );

    if (successful) {
      await _fetchAccountInfo(emit);

      return emit(state.copyWith(
        blocStatus: BlocStatus.success,
        blocError: AuthenticationError.none,
      ));
    }

    return emit(state.copyWith(
      blocStatus: BlocStatus.error,
      blocError: AuthenticationError.logoutFailed,
    ));
  }

  Future<void> _onDeleteAccount(
    DeleteAccount event,
    Emitter<AccountState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.noInternetConnection,
      ));
    }

    final action = await showDialog<ConfirmationAction>(
      context: event.context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const AuthProcedureDialog(
          authProcedure: AuthProcedure.deleteAccount,
        );
      },
    );

    if (action == null || action == ConfirmationAction.cancel) {
      return;
    }

    emit(state.copyWith(
      blocStatus: BlocStatus.processing,
    ));

    final profile = await Profile.getProfile();
    final authMethod =
        profile.emailAddress == '' ? AuthMethod.phone : AuthMethod.email;

    event.context.read<AuthCodeBloc>().add(InitializeAuthCodeState(
          phoneNumber: profile.phoneNumber,
          emailAddress: profile.emailAddress,
          authProcedure: AuthProcedure.deleteAccount,
          authMethod: authMethod,
        ));

    try {
      switch (authMethod) {
        case AuthMethod.phone:
          CustomAuth.sendPhoneAuthCode(
            phoneNumber: profile.phoneNumber,
            buildContext: event.context,
            authProcedure: AuthProcedure.deleteAccount,
          );
          break;
        case AuthMethod.email:
          CustomAuth.sendEmailAuthCode(
            emailAddress: profile.emailAddress,
            buildContext: event.context,
            authProcedure: AuthProcedure.deleteAccount,
          );
          break;
        case AuthMethod.none:
          return emit(state.copyWith(
            blocStatus: BlocStatus.error,
            blocError: AuthenticationError.authFailure,
          ));
      }
    } on FirebaseAuthException catch (exception, stackTrace) {
      final authenticationError =
          CustomAuth.getFirebaseErrorCodeMessage(exception.code);
      emit(state.copyWith(
        blocError: authenticationError,
        blocStatus: BlocStatus.error,
      ));

      if (authenticationError == AuthenticationError.authFailure) {
        await logException(
          exception,
          stackTrace,
        );
      }
    } catch (exception, stackTrace) {
      emit(state.copyWith(
        blocError: AuthenticationError.authFailure,
        blocStatus: BlocStatus.error,
      ));
      await logException(
        exception,
        stackTrace,
      );
    }

    return emit(const AccountState.initial());
  }

  Future<void> _fetchProfile(
    Emitter<AccountState> emit,
  ) async {
    final profile = state.guestUser
        ? await Profile.initializeGuestProfile()
        : await CloudStore.getProfile();

    emit(state.copyWith(
      profile: profile,
    ));
    await HiveService.loadProfile(profile);
  }
}
