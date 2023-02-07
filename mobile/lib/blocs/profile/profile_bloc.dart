import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app/utils/utils.dart';

part 'profile_event.dart';
part 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  ProfileBloc() : super(const ProfileState()) {
    on<EditProfile>(_onEditProfile);
    on<UpdateProfile>(_onUpdateProfile);
    on<FetchProfile>(_onFetchProfile);
    on<RefreshProfile>(_onRefreshProfile);
    on<ClearProfile>(_onClearProfile);
    on<UpdateTitle>(_onUpdateTitle);
    on<UpdateName>(_onUpdateName);
  }

  Future<Profile> _getProfile(Emitter<ProfileState> emit) async {
    Profile profile = state.profile ?? await HiveService.getProfile();
    emit(state.copyWith(profile: profile));
    return profile;
  }

  Future<void> _onUpdateName(
    UpdateName event,
    Emitter<ProfileState> emit,
  ) async {
    Profile profile = await _getProfile(emit);
    String firstName = getNames(event.fullName).first;
    String lastName = getNames(event.fullName).last;

    return emit(state.copyWith(
      profile: profile.copyWith(
        firstName: firstName,
        lastName: lastName,
      ),
    ));
  }

  Future<void> _onUpdateTitle(
    UpdateTitle event,
    Emitter<ProfileState> emit,
  ) async {
    Profile profile = await _getProfile(emit);

    return emit(state.copyWith(
      profile: profile.copyWith(title: event.title.value),
    ));
  }

  Future<void> _onClearProfile(
    ClearProfile _,
    Emitter<ProfileState> emit,
  ) async {
    emit(const ProfileState());
    await HiveService.deleteProfile();
    await SecureStorage().clearUserData();
  }

  Future<void> _onFetchProfile(
    FetchProfile _,
    Emitter<ProfileState> emit,
  ) async {
    Profile profile = await CloudStore.getProfile();
    emit(const ProfileState().copyWith(profile: profile));
    await HiveService.loadProfile(profile);
  }

  Future<void> _onRefreshProfile(
      RefreshProfile _, Emitter<ProfileState> emit) async {
    final profile = await _getProfile(emit);
    return emit(const ProfileState().copyWith(profile: profile));
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

    Profile profile = await _getProfile(emit);

    await HiveService.updateProfile(profile);

    bool success = await CloudStore.updateProfile(profile);
    emit(state.copyWith(
      status: success ? ProfileStatus.success : ProfileStatus.error,
    ));

    if (profile.photoUrl.isNotEmpty && !profile.photoUrl.isValidUri()) {
      await CloudStore.uploadProfilePicture(profile.photoUrl);
    }
  }

  Future<void> _onEditProfile(
    EditProfile event,
    Emitter<ProfileState> emit,
  ) async {
    final profile = await _getProfile(emit);

    return emit(
      state.copyWith(
        profile: profile.copyWith(
          firstName: event.firstName,
          lastName: event.lastName,
          photoUrl: event.photoUrl,
        ),
      ),
    );
  }
}
