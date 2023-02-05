import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:app/blocs/auth_code/auth_code_bloc.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

part 'profile_event.dart';
part 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  ProfileBloc() : super(const ProfileState.initial()) {
    on<LogOutAccount>(_onLogOutAccount);
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
    emit(const ProfileState.initial());
    await HiveService.deleteProfile();
    await SecureStorage().clearUserData();
  }

  Future<void> _onFetchProfile(
    FetchProfile _,
    Emitter<ProfileState> emit,
  ) async {
    Profile profile = await CloudStore.getProfile();
    emit(const ProfileState.initial().copyWith(profile: profile));
    await HiveService.loadProfile(profile);
  }

  Future<void> _onRefreshProfile(
    RefreshProfile _,
    Emitter<ProfileState> emit,
  ) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return emit(state.copyWith(
        blocStatus: BlocStatus.error,
        blocError: AuthenticationError.noInternetConnection,
      ));
    }
    emit(state.copyWith(blocStatus: BlocStatus.updatingData));

    final profile = await _getProfile(emit);
    return emit(state.copyWith(
      profile: profile,
      blocStatus: BlocStatus.initial,
    ));
  }

  Future<void> _onUpdateProfile(
    UpdateProfile _,
    Emitter<ProfileState> emit,
  ) async {
    Profile profile = await _getProfile(emit);

    await HiveService.updateProfile(profile);

    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return;
    }
    await CloudStore.updateProfile(profile);
    // TODO background task to upload image
  }

  Future<void> _uploadPicture({
    required Emitter<ProfileState> emit,
  }) async {
    try {
      final profile = await _getProfile(emit);

      final imageUrl = await CloudStore.uploadProfilePicture(profile.photoUrl);
      if (imageUrl.isNotEmpty) {
        // TODO verify profile updating
        emit(
          state.copyWith(
            profile: profile.copyWith(
              photoUrl: imageUrl,
            ),
          ),
        );

        await Future.wait([
          CloudAnalytics.logEvent(
            Event.uploadProfilePicture,
          ),
          // TODO update profile
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

  Future<void> _onLogOutAccount(
    LogOutAccount event,
    Emitter<ProfileState> emit,
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

    emit(
      state.copyWith(
        blocStatus: BlocStatus.processing,
        blocError: AuthenticationError.none,
      ),
    );
  }
}
