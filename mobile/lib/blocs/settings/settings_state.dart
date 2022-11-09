// part of 'settings_bloc.dart';
//
// class SettingsState extends Equatable {
//   const SettingsState._({
//     this.error = AuthenticationError.none,
//     this.blocStatus = BlocStatus.initial,
//   });
//
//   const SettingsState({
//     this.error = AuthenticationError.none,
//     this.blocStatus = BlocStatus.initial,
//   });
//
//   const SettingsState.initial() : this._();
//
//   SettingsState copyWith({
//     AuthenticationError? error,
//     BlocStatus? blocStatus,
//   }) {
//     return SettingsState(
//       error: error ?? this.error,
//       blocStatus: blocStatus ?? this.blocStatus,
//     );
//   }
//
//   final AuthenticationError error;
//   final BlocStatus blocStatus;
//
//   @override
//   List<Object?> get props => [
//         error,
//         blocStatus,
//       ];
// }
