import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

import '../../blocs/account/account_bloc.dart';

class KyaFinalPage extends StatefulWidget {
  const KyaFinalPage(this.kya, {super.key});
  final Kya kya;

  @override
  State<KyaFinalPage> createState() => _KyaFinalPageState();
}

class _KyaFinalPageState extends State<KyaFinalPage> {
  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          toolbarHeight: 0,
          backgroundColor: CustomColors.appBodyColor,
        ),
        body: AppSafeArea(
          widget: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SvgPicture.asset(
                'assets/icon/learn_complete.svg',
                height: 133,
                width: 221,
              ),
              const SizedBox(
                height: 33.61,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  'Congrats!',
                  style: CustomTextStyle.headline11(context),
                ),
              ),
              const SizedBox(
                height: 8.0,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 60),
                child: Text(
                  widget.kya.completionMessage,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.subtitle1?.copyWith(
                        color: CustomColors.appColorBlack.withOpacity(0.5),
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    context.read<AccountBloc>().add(UpdateKyaProgress(
        kya: widget.kya, progress: widget.kya.lessons.length));
    _initialize();
  }

  Future<void> _initialize() async {
    Future.delayed(
      const Duration(seconds: 4),
      () {
        Navigator.pop(context);
      },
    );
  }

  Future<bool> _onWillPop() {
    return Future.value(false);
  }
}
