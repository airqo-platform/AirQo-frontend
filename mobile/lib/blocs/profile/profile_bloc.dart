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
    on<FetchProfile>(_onFetchProfile);
    on<ClearProfile>(_onClearProfile);
  }

  void _onClearProfile(ClearProfile _, Emitter<Profile> emit) {
    emit(
      Profile.initialize().copyWith(
        lastRated: state.lastRated,
      ),
    );
  }

  Future<void> _onFetchProfile(FetchProfile _, Emitter<Profile> emit) async {
    Profile? profile = await CloudStore.getProfile();
    profile ??= Profile.initialize();
    emit(profile);
    await CloudStore.updateProfile(profile);
  }

  Future<void> _onSyncProfile(SyncProfile _, Emitter<Profile> emit) async {
    Profile profile = Profile.initialize();
    profile = profile.copyWith(
      title: state.title,
      firstName: state.firstName,
      lastName: state.lastName,
      photoUrl: state.photoUrl,
      notifications: state.notifications,
      location: state.location,
      aqShares: state.aqShares,
      lastRated: state.lastRated,
    );
    emit(profile);

    String? device = await CloudMessaging.getDeviceToken();
    profile = profile.copyWith(device: device);
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
