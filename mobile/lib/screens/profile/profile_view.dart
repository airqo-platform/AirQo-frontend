import 'package:app/constants/config.dart';
import 'package:app/models/profile.dart';
import 'package:app/screens/profile/profile_edit_page.dart';
import 'package:app/screens/profile/profile_widgets.dart';
import 'package:app/services/app_service.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive/hive.dart';

import '../../models/notification.dart';
import '../../services/firebase_service.dart';
import '../../themes/app_theme.dart';
import '../auth/phone_auth_widget.dart';
import '../notification/notification_page.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({Key? key}) : super(key: key);

  @override
  _ProfileViewState createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  late Profile _profile;
  bool _isLoggedIn = false;
  bool _profileReady = false;
  final AppService _appService = AppService();
  List<AppNotification> _unreadNotifications = <AppNotification>[];

  @override
  Widget build(BuildContext context) {
    if (!_profileReady) {
      return const LoadingWidget();
    }
    return Scaffold(
        appBar: AppBar(
            toolbarHeight: 72,
            centerTitle: true,
            elevation: 0,
            backgroundColor: Config.appBodyColor,
            automaticallyImplyLeading: false,
            title: Row(
              children: [
                ProfilePicture(
                  userDetails: _profile,
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () async {
                    await Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                      return const NotificationPage();
                    }));
                  },
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    height: 40,
                    width: 40,
                    decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.all(Radius.circular(8.0))),
                    child: _unreadNotifications.isEmpty
                        ? SvgPicture.asset(
                            'assets/icon/empty_notifications.svg',
                            height: 20,
                            width: 16,
                          )
                        : SvgPicture.asset(
                            'assets/icon/has_notifications.svg',
                            height: 20,
                            width: 16,
                          ),
                  ),
                ),
              ],
            )),
        body: Container(
            color: Config.appBodyColor,
            child: Padding(
              padding: const EdgeInsets.only(left: 16.0, top: 8.0, right: 16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Visibility(
                      visible: _isLoggedIn,
                      child: ListView(
                        physics: const BouncingScrollPhysics(),
                        shrinkWrap: true,
                        children: <Widget>[
                          const SizedBox(
                            height: 10,
                          ),
                          AutoSizeText(
                            _profile.getProfileViewName(),
                            maxLines: 2,
                            style: CustomTextStyle.headline9(context),
                          ),
                          const SizedBox(
                            height: 4,
                          ),
                          GestureDetector(
                            onTap: () async {
                              await _viewProfile();
                            },
                            child: Text('Edit profile',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyText2
                                    ?.copyWith(color: Config.appColorBlue)),
                          ),
                          const SizedBox(
                            height: 40,
                          ),
                          Padding(
                            padding:
                                const EdgeInsets.fromLTRB(0.0, 16.0, 0.0, 0.0),
                            child: ProfileSection(
                              userDetails: _profile,
                            ),
                          ),
                        ],
                      )),
                  Visibility(
                    visible: _isLoggedIn,
                    child: const Spacer(),
                  ),
                  Visibility(
                      visible: _isLoggedIn,
                      child: GestureDetector(
                        onTap: _logOut,
                        child: const LogoutButton(),
                      )),
                  Visibility(
                      visible: !_isLoggedIn,
                      child: ListView(
                        shrinkWrap: true,
                        children: <Widget>[
                          Text(
                            'Guest',
                            style: CustomTextStyle.headline9(context),
                          ),
                          const SizedBox(
                            height: 24,
                          ),
                          const SignUpSection(),
                          const SizedBox(
                            height: 16,
                          ),
                          const SettingsButton(),
                        ],
                      )),
                  Visibility(
                    visible: !_isLoggedIn,
                    child: const Spacer(),
                  ),
                  const SizedBox(
                    height: 32,
                  ),
                ],
              ),
            )));
  }

  Future<void> _initialize() async {
    setState(() => _isLoggedIn = CustomAuth.isLoggedIn());
    await Future.wait([_loadProfile(), _loadNotifications(), _initListeners()]);
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _logOut() async {
    var loadingContext = context;
    loadingScreen(loadingContext);
    var successful = await _appService.logOut(context);
    if (successful) {
      Navigator.pop(loadingContext);
      await Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const PhoneLoginWidget();
      }), (r) => false);
    } else {
      Navigator.pop(loadingContext);
      await showSnackBar(context, 'failed to logout. Try again later');
    }
  }

  Future<void> _loadNotifications() async {
    if (!mounted) {
      return;
    }

    setState(() => _unreadNotifications =
        Hive.box<AppNotification>(HiveBox.appNotifications)
            .values
            .where((element) => !element.read)
            .toList()
            .cast<AppNotification>());
  }

  Future<void> _loadProfile() async {
    if (!mounted) {
      return;
    }

    await Profile.getProfile().then(
        (value) => {setState(() => _profile = value), _profileReady = true});

    if (_profile.photoUrl.isNotEmpty && mounted) {
      await precacheImage(
          CachedNetworkImageProvider(_profile.photoUrl), context);
    }
  }

  Future<void> _initListeners() async {
    if (CustomAuth.isLoggedIn()) {
      Hive.box<AppNotification>(HiveBox.appNotifications)
          .watch()
          .listen((_) => _loadNotifications())
          .onDone(_loadNotifications);
      Hive.box<Profile>(HiveBox.profile)
          .watch()
          .listen((_) => _loadProfile())
          .onDone(_loadProfile);
    }
  }

  Future<void> _viewProfile() async {
    await Navigator.push(context, MaterialPageRoute(builder: (context) {
      return const ProfileEditPage();
    }));
  }
}
