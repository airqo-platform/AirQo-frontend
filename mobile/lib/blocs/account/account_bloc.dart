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
    on<RefreshAnalytics>(_onRefreshAnalytics);
    on<RefreshNotifications>(_onRefreshNotifications);
    on<RefreshFavouritePlaces>(_onRefreshFavouritePlaces);
    on<RefreshKya>(_onRefreshKya);
    on<RefreshProfile>(_onRefreshProfile);
    on<UpdateKyaProgress>(_onUpdateKyaProgress);
    on<UpdateProfilePreferences>(_onUpdateProfilePreferences);
    on<UpdateFavouritePlace>(_onUpdateFavouritePlace);
  }

  Future<void> _onUpdateFavouritePlace(
    UpdateFavouritePlace event,
    Emitter<AccountState> emit,
  ) async {
    emit(state.copyWith(blocStatus: BlocStatus.updatingData));

    final favouritePlaces = state.favouritePlaces;
    final placesIds = favouritePlaces.map((e) => e.placeId);

    if (placesIds.contains(event.airQualityReading.placeId)) {
      favouritePlaces.removeWhere(
        (element) => element.placeId == event.airQualityReading.placeId,
      );
    } else {
      favouritePlaces
          .add(FavouritePlace.fromAirQualityReading(event.airQualityReading));
    }

    await HiveService.loadFavouritePlaces(favouritePlaces);

    emit(state.copyWith(
      blocStatus: BlocStatus.initial,
      favouritePlaces: favouritePlaces,
    ));

    final hasConnection = await hasNetworkConnection();
    if (hasConnection) {
      await CloudStore.updateFavouritePlaces();
      if (favouritePlaces.length >= 5) {
        await CloudAnalytics.logEvent(
          AnalyticsEvent.savesFiveFavorites,
        );
      }
    }
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
      await CloudAnalytics.logEvent(AnalyticsEvent.allowNotification);
    }

    if (event.location ?? false) {
      await CloudAnalytics.logEvent(AnalyticsEvent.allowLocation);
    }

    final hasConnection = await hasNetworkConnection();
    if (hasConnection) {
      await CloudStore.updateProfile(profile);
    }
  }

  Future<void> _onUpdateKyaProgress(
    UpdateKyaProgress event,
    Emitter<AccountState> emit,
  ) async {
    final progress =
        event.progress > event.kya.lessons.length ? -1 : event.progress;

    if (progress < -1) {
      return;
    }

    final stateKya = state.kya;
    Kya kya = stateKya.firstWhere((element) => element.id == event.kya.id);

    if (kya.progress == -1) {
      return;
    }

    emit(state.copyWith(blocStatus: BlocStatus.updatingData));

    kya.progress = progress;
    stateKya.removeWhere((element) => element.id == kya.id);
    stateKya.add(kya);

    emit(state.copyWith(kya: stateKya, blocStatus: BlocStatus.initial));

    await HiveService.loadKya(stateKya);

    if (progress == -1) {
      await CloudAnalytics.logEvent(AnalyticsEvent.completeOneKYA);
    }

    final hasConnection = await hasNetworkConnection();
    if (hasConnection) {
      await CloudStore.updateKya(kya);
    }
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

    return emit(const AccountState.initial().copyWith(
      notifications: notifications,
      kya: kya,
      favouritePlaces: favouritePlaces,
      analytics: analytics,
      profile: profile,
      guestUser: CustomAuth.isGuestUser(),
    ));
  }

  Future<void> _onRefreshNotifications(
    RefreshNotifications _,
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
    RefreshFavouritePlaces _,
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
    emit(state.copyWith(blocStatus: BlocStatus.updatingData));

    final profile = await Profile.getProfile();

    return emit(state.copyWith(
      profile: profile,
      guestUser: CustomAuth.isGuestUser(),
      blocStatus: BlocStatus.initial,
    ));
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

    emit(state.copyWith(blocStatus: BlocStatus.updatingData));

    final kya = state.kya;
    final cloudKya = await CloudStore.getKya();

    final List<String> kyaIds = kya.map((kya) => kya.id).toList();
    cloudKya.removeWhere((kya) => kyaIds.contains(kya.id));

    kya.addAll(cloudKya);

    emit(state.copyWith(kya: kya, blocStatus: BlocStatus.initial));

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
      _fetchAnalytics(emit),
      _fetchKya(emit),
      _fetchFavouritePlaces(emit),
      _fetchNotifications(emit),
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
  }

  Future<void> _fetchKya(
    Emitter<AccountState> emit,
  ) async {
    final kya = await CloudStore.getKya();
    emit(state.copyWith(
      kya: kya,
    ));
    await HiveService.loadKya(kya);
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
