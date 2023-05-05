import 'package:app/blocs/blocs.dart';
import 'package:app/models/email_auth_model.dart';
import 'package:app/models/enum_constants.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('EmailAuthBloc', () {
    late EmailAuthBloc emailAuthBloc;
    late String emailAddress;

    setUp(() {
      emailAuthBloc = EmailAuthBloc();
      emailAddress = "";
    });

    test('test initial state', () {
      expect(emailAuthBloc.state.errorMessage, "");
      expect(emailAuthBloc.state.emailAuthModel, EmailAuthModel.initial());
      expect(emailAuthBloc.state.authProcedure, AuthProcedure.login);
      expect(emailAuthBloc.state.status, EmailAuthStatus.initial);
      expect(emailAuthBloc.state.codeCountDown, 0);
      expect(emailAuthBloc.state.emailAddress, "");
      expect(emailAuthBloc.state.errorMessage, "");
    });

    blocTest<EmailAuthBloc, EmailAuthState>(
      'test initialization',
      build: () => emailAuthBloc,
      act: (act) => act.add(InitializeEmailAuth(
          emailAddress: emailAddress, authProcedure: AuthProcedure.login)),
      expect: () => [
        emailAuthBloc.state.copyWith(
            emailAddress: emailAddress, authProcedure: AuthProcedure.login)
      ],
    );

    blocTest<EmailAuthBloc, EmailAuthState>(
      'test Update email',
      build: () => emailAuthBloc,
      act: (act) =>
          act.add(const UpdateEmailAddress("automated-test@airqo.net")),
      expect: () => [
        emailAuthBloc.state.copyWith(emailAddress: "automated-test@airqo.net")
      ],
    );

    blocTest<EmailAuthBloc, EmailAuthState>(
      'test clear email',
      build: () => emailAuthBloc,
      act: (act) => act.add(const ClearEmailAddress()),
      expect: () => [emailAuthBloc.state.copyWith(emailAddress: "")],
    );

    blocTest<EmailAuthBloc, EmailAuthState>(
      'test update status',
      build: () => emailAuthBloc,
      act: (act) => act.add(const UpdateEmailAuthStatus(
          EmailAuthStatus.emailAddressDoesNotExist)),
      expect: () => [
        emailAuthBloc.state
            .copyWith(status: EmailAuthStatus.emailAddressDoesNotExist)
      ],
    );

    blocTest<EmailAuthBloc, EmailAuthState>(
      'test update error message',
      build: () => emailAuthBloc,
      act: (act) =>
          act.add(const UpdateEmailAuthErrorMessage("an error occurred")),
      expect: () =>
          [emailAuthBloc.state.copyWith(errorMessage: "an error occurred")],
    );

    blocTest<EmailAuthBloc, EmailAuthState>(
      'test update count down',
      build: () => emailAuthBloc,
      act: (act) => act.add(const UpdateEmailAuthCountDown(5)),
      expect: () => [emailAuthBloc.state.copyWith(codeCountDown: 5)],
    );

    blocTest<EmailAuthBloc, EmailAuthState>(
      // TODO review this test case
      'test update email model',
      build: () => emailAuthBloc,
      act: (act) => act.add(UpdateEmailAuthModel(EmailAuthModel.initial())),
      expect: () => [
        emailAuthBloc.state.copyWith(emailAuthModel: EmailAuthModel.initial())
      ],
    );

    blocTest<EmailAuthBloc, EmailAuthState>(
      'test update email auth code',
      build: () => emailAuthBloc,
      act: (act) => act.add(const UpdateEmailInputCode(1234545)),
      expect: () => [
        emailAuthBloc.state.copyWith(
            emailAuthModel:
                EmailAuthModel.initial().copyWith(inputToken: 1234545))
      ],
    );
  });
}
