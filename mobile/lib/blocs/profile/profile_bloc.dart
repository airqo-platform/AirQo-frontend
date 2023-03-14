import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'profile_event.dart';
part 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  ProfileBloc() : super(ProfileState.initial()) {
    on<EditProfile>(_onEditProfile);
    on<UpdateProfile>(_onUpdateProfile);
    on<FetchProfile>(_onFetchProfile);
    on<RefreshProfile>(_onRefreshProfile);
    on<UpdateTitle>(_onUpdateTitle);
    on<UpdateName>(_onUpdateName);
    on<UpdateLocation>(_onUpdateLocation);
    on<UpdateNotification>(_onUpdateNotification);
  }

  Future<void> _onUpdateLocation(
      UpdateLocation event,
      Emitter<ProfileState> emit,
      ) async {

    Profile profile = state.profile.copyWith(location: event.enable);
    emit(state.copyWith(profile: profile));
    await HiveService.updateProfile(profile);

    if (event.enable) {
      await CloudAnalytics.logEvent(CloudAnalyticsEvent.allowLocation);
    }
  }

  Future<void> _onUpdateNotification(
      UpdateNotification event,
      Emitter<ProfileState> emit,
      ) async {

    Profile profile = state.profile.copyWith(notifications: event.enable);
    emit(state.copyWith(profile: profile));
    await HiveService.updateProfile(profile);

    if (event.enable) {
      await CloudAnalytics.logEvent(CloudAnalyticsEvent.allowNotification);
    }

  }

  Future<void> _onUpdateName(
    UpdateName event,
    Emitter<ProfileState> emit,
  ) async {
    // Profile profile = state.profile;
    // String firstName = getNames(event.fullName).first;
    // String lastName = getNames(event.fullName).last;
    //
    // return emit(state.copyWith(
    //   profile: profile.copyWith(
    //     firstName: firstName,
    //     lastName: lastName,
    //   ),
    // ));
  }

  void _onUpdateTitle(
    UpdateTitle event,
    Emitter<ProfileState> emit,
  ) {
    return emit(state.copyWith(
      profile: state.profile.copyWith(title: event.title.value),
    ));
  }

  Future<void> _onFetchProfile(
    FetchProfile _,
    Emitter<ProfileState> emit,
  ) async {
    Profile profile = await CloudStore.getProfile();
    emit(ProfileState.initial().copyWith(profile: profile));
  }

  Future<void> _onRefreshProfile(
    RefreshProfile _,
    Emitter<ProfileState> emit,
  ) async {
    // return emit(ProfileState.initial().copyWith(profile: profile));
  }

  Future<void> _onUpdateProfile(
    UpdateProfile _,
    Emitter<ProfileState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(status: ProfileStatus.noInternetConnection));
    }

    emit(state.copyWith(status: ProfileStatus.processing));

    Profile profile = state.profile;
    await HiveService.updateProfile(profile);

    await CloudStore.updateProfile().then((value) {
      emit(state.copyWith(
        status: value ? ProfileStatus.success : ProfileStatus.error,
      ));
    });

    if (profile.photoUrl.isNotEmpty && !profile.photoUrl.isValidUri()) {
      await CloudStore.uploadProfilePicture(profile.photoUrl);
    }
  }

  void _onEditProfile(
    EditProfile event,
    Emitter<ProfileState> emit,
  ) {
    return emit(
      state.copyWith(
        profile: state.profile.copyWith(
          firstName: event.firstName,
          lastName: event.lastName,
          photoUrl: event.photoUrl,
        ),
      ),
    );
  }
}
