import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'email_auth_model.g.dart';

@JsonSerializable(createToJson: false)
class EmailAuthModel extends Equatable {
  const EmailAuthModel({
    required this.validToken,
    required this.emailAddress,
    required this.signInLink,
    required this.reAuthenticationLink,
    this.inputToken = 0,
  });

  factory EmailAuthModel.initial() => const EmailAuthModel(
      validToken: 0,
      inputToken: 0,
      emailAddress: '',
      signInLink: '',
      reAuthenticationLink: '');

  factory EmailAuthModel.fromJson(Map<String, dynamic> json) =>
      _$EmailAuthModelFromJson(json);

  @JsonKey(name: 'token')
  final int validToken;

  @JsonKey(includeFromJson: false)
  final int inputToken;

  @JsonKey(name: 'email')
  final String emailAddress;

  @JsonKey(name: 'login_link', required: false, defaultValue: '')
  final String signInLink;

  @JsonKey(name: 'auth_link', required: false, defaultValue: '')
  final String reAuthenticationLink;

  bool isValidInputToken() => inputToken == validToken;

  EmailAuthModel copyWith({int? inputToken}) {
    return EmailAuthModel(
        inputToken: inputToken ?? this.inputToken,
        validToken: validToken,
        emailAddress: emailAddress,
        signInLink: signInLink,
        reAuthenticationLink: reAuthenticationLink);
  }

  @override
  List<Object?> get props => [
        validToken,
        inputToken,
        emailAddress,
        signInLink,
        reAuthenticationLink,
      ];
}
