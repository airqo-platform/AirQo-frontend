import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';

part 'profile_event.dart';

class ProfileBloc extends HydratedBloc<ProfileEvent, Profile> {
  ProfileBloc() : super(Profile.initialize()) {
    on<UpdateProfile>(_onUpdateProfile);
    on<SyncProfile>(_onSyncProfile);
    on<ClearProfile>(_onClearProfile);
  }

  void _onClearProfile(ClearProfile _, Emitter<Profile> emit) {
    return emit(Profile.initialize());
  }

  Future<void> _onSyncProfile(SyncProfile _, Emitter<Profile> emit) async {
    Profile profile = await state.setUserCredentials();
    emit(profile);

    Profile? cloudProfile = await CloudStore.getProfile();

    if (cloudProfile == null) {
      await CloudStore.updateProfile(profile);

      return;
    }

    profile = profile.copyWith(
      firstName: profile.firstName.isEmpty
          ? cloudProfile.firstName
          : profile.firstName,
      lastName:
          profile.lastName.isEmpty ? cloudProfile.lastName : profile.lastName,
      photoUrl:
          profile.photoUrl.isEmpty ? cloudProfile.photoUrl : profile.photoUrl,
      utcOffset: DateTime.now().getUtcOffset(),
      notifications: await PermissionService.checkPermission(
        AppPermission.notification,
      ),
      location: await PermissionService.checkPermission(
        AppPermission.location,
      ),
      aqShares:
          profile.aqShares == 0 ? cloudProfile.aqShares : profile.aqShares,
      title: profile.title.isEmpty ? cloudProfile.title : profile.title,
    );

    emit(profile);
    await CloudStore.updateProfile(profile);
  }

  Future<void> _onUpdateProfile(
    UpdateProfile event,
    Emitter<Profile> emit,
  ) async {
    emit(event.profile);
    await CloudStore.updateProfile(event.profile);
  }

  @override
  Profile? fromJson(Map<String, dynamic> json) {
    return Profile.fromJson(json);
  }

  @override
  Map<String, dynamic>? toJson(Profile state) {
    return state.toJson();
  }
}
