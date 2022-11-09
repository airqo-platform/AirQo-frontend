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
  AccountBloc() : super(AccountState.initial()) {
    on<FetchAccountInfo>(_onFetchAccountInfo);
    on<LoadAccountInfo>(_onLoadAccountInfo);
    on<LogOutAccount>(_onLogOutAccount);
    on<DeleteAccount>(_onDeleteAccount);
    on<AccountDeletionCheck>(_accountDeletionCheck);
    on<EditProfile>(_onEditProfile);
    on<UpdateProfile>(_onUpdateProfile);
    on<RefreshAnalytics>(_onRefreshAnalytics);
    on<RefreshNotifications>(_onRefreshNotifications);
    on<RefreshFavouritePlaces>(_onRefreshFavouritePlaces);
    on<RefreshKya>(_onRefreshKya);
    on<RefreshProfile>(_onRefreshProfile);
  }

  Future<Profile> _getProfile() async {
    return state.profile ?? await Profile.initializeGuestProfile();
  }

  Future<void> _onLoadAccountInfo(
    LoadAccountInfo _,
    Emitter<AccountState> emit,
  ) async {
    final favouritePlaces =
        Hive.box<FavouritePlace>(HiveBox.favouritePlaces).values.toList();

    final analytics = Hive.box<Analytics>(HiveBox.analytics).values.toList();

    final notifications =
        Hive.box<AppNotification>(HiveBox.appNotifications).values.toList();

    final kya = Hive.box<Kya>(HiveBox.kya).values.toList();

    final profile = await Profile.getProfile();

    return emit(AccountState.initial().copyWith(
      notifications: notifications,
      kya: kya,
      favouritePlaces: favouritePlaces,
      analytics: analytics,
      profile: profile,
      guestUser: CustomAuth.isGuestUser(),
    ));
  }

  Future<void> _onRefreshNotifications(
    RefreshNotifications event,
    Emitter<AccountState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.noInternetConnection,
      ));
    }

    final notifications =
        Hive.box<AppNotification>(HiveBox.appNotifications).values.toList();

    final cloudNotifications = await CloudStore.getNotifications();
    final notificationsIds = notifications.map((e) => e.id).toList();

    cloudNotifications.removeWhere((x) => notificationsIds.contains(x.id));

    notifications.addAll(cloudNotifications);

    emit(state.copyWith(notifications: notifications));

    await HiveService.loadNotifications(notifications);
  }

  Future<void> _onRefreshFavouritePlaces(
    RefreshFavouritePlaces event,
    Emitter<AccountState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.noInternetConnection,
      ));
    }
    final AppService appService = AppService();
    await appService.fetchFavPlacesInsights();
    await appService.updateFavouritePlacesReferenceSites();
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
    final profile = await Profile.getProfile();
    return emit(
        state.copyWith(profile: profile, guestUser: CustomAuth.isGuestUser()));
  }

  Future<void> _onRefreshKya(
    RefreshKya _,
    Emitter<AccountState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.noInternetConnection,
      ));
    }

    final kya = state.kya;
    final cloudKya = await CloudStore.getKya();

    final List<String> kyaIds = kya.map((kya) => kya.id).toList();
    cloudKya.removeWhere((kya) => kyaIds.contains(kya.id));

    kya.addAll(cloudKya);

    emit(state.copyWith(kya: kya));

    await HiveService.loadKya(kya);

    // TODO: update cloud KYA
  }

  Future<void> _onRefreshAnalytics(
    RefreshAnalytics _,
    Emitter<AccountState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.noInternetConnection,
      ));
    }

    final AppService appService = AppService();
    await appService.refreshAirQualityReadings();
    await appService.fetchFavPlacesInsights();

    // TODO: update cloud Analytics
  }

  Future<void> _onUpdateProfile(
    UpdateProfile _,
    Emitter<AccountState> emit,
  ) async {
    emit(state.copyWith(blocStatus: BlocStatus.processing));

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

    // TODO verify profile updating

    final hiveProfile = Hive.box<Profile>(HiveBox.profile).get(HiveBox.profile);

    if (hiveProfile != null && hiveProfile.photoUrl != profile.photoUrl) {
      await profile.update();
      await _uploadPicture(emit: emit);

      // await Future.wait(
      //     [profile.update(), _uploadPicture(profile: profile, emit: emit)])
      //     .whenComplete(() => _initializeProfile(emit));
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
            AnalyticsEvent.uploadProfilePicture,
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
    if (event.passed) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.accountDeletionCheckSuccess,
        blocError: AuthenticationError.none,
      ));
    } else {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: event.error,
      ));
    }
  }

  Future<void> _fetchAccountInfo(
    Emitter<AccountState> emit,
  ) async {
    emit(AccountState.initial().copyWith(guestUser: CustomAuth.isGuestUser()));

    await Future.wait([
      _fetchProfile(emit),
      _fetchAnalytics(emit),
      _fetchKya(emit),
      _fetchFavouritePlaces(emit),
      _fetchNotifications(emit),
    ]);
  }

  Future<void> _onFetchAccountInfo(
    FetchAccountInfo event,
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

    return emit(AccountState.initial());
  }

  Future<void> _fetchAnalytics(
    Emitter<AccountState> emit,
  ) async {
    final analytics = state.guestUser
        ? Analytics.fromAirQualityReadings()
        : await CloudStore.getCloudAnalytics();
    emit(state.copyWith(
      analytics: analytics,
    ));

    await HiveService.loadAnalytics(analytics);
    return;
  }

  Future<void> _fetchKya(
    Emitter<AccountState> emit,
  ) async {
    final kya = await CloudStore.getKya();
    emit(state.copyWith(
      kya: kya,
    ));
    await HiveService.loadKya(kya);
    return;
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

  Future<void> _fetchFavouritePlaces(
    Emitter<AccountState> emit,
  ) async {
    final favouritePlaces = state.guestUser
        ? <FavouritePlace>[]
        : await CloudStore.getFavouritePlaces();
    emit(state.copyWith(
      favouritePlaces: favouritePlaces,
    ));
    await HiveService.loadFavouritePlaces(favouritePlaces);
  }

  Future<void> _fetchNotifications(
    Emitter<AccountState> emit,
  ) async {
    final notifications = state.guestUser
        ? <AppNotification>[]
        : await CloudStore.getNotifications();
    emit(state.copyWith(
      notifications: notifications,
    ));

    await HiveService.loadNotifications(notifications);
  }
}
