import 'package:airqo/src/app/learn/bloc/kya_bloc.dart';
import 'package:airqo/src/app/learn/widgets/kya_lesson_container.dart';
import 'package:airqo/src/app/shared/pages/error_page.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class KyaPage extends StatefulWidget {
  const KyaPage({super.key});

  @override
  State<KyaPage> createState() => _KyaPageState();
}

class _KyaPageState extends State<KyaPage> {
  KyaBloc? kyaBloc;

  @override
  void initState() {
    kyaBloc = context.read<KyaBloc>()..add(LoadLessons());
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 16),
              Text(
                "Know Your Air",
                style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppColors.boldHeadlineColor),
              ),
              SizedBox(height: 8),
              Text(
                "👋 Welcome! to \"Know Your Air,\" you’ll learn about AirQo and air quality.",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Color(0xff7A7F87),
                ),
              ),
              SizedBox(height: 16),
              Container(
                child: Row(
                  children: [
                    // Container(
                    //   height: 38,
                    //   width: 51,
                    //   decoration: BoxDecoration(
                    //       borderRadius: BorderRadius.circular(40),
                    //       color: AppColors.primaryColor),
                    //   child: Center(
                    //     child: Text("Lessons"),
                    //   ),
                    // ),
                    // SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      height: 38,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(40),
                          color: AppColors.primaryColor),
                      child: Center(
                        child: Text("Lessons",
                            style: TextStyle(color: Colors.white)),
                      ),
                    ),
                    // SizedBox(width: 8),
                    // Container(
                    //   padding: const EdgeInsets.symmetric(horizontal: 16),
                    //   height: 38,
                    //   decoration: BoxDecoration(
                    //       borderRadius: BorderRadius.circular(40),
                    //       color: Theme.of(context).highlightColor),
                    //   child: Center(
                    //     child: Text("Articles"),
                    //   ),
                    // ),
                  ],
                ),
              ),
              SizedBox(height: 16),
              Expanded(
                child: BlocBuilder<KyaBloc, KyaState>(
                  builder: (context, state) {
                    if (state is LessonsLoading) {
                      return Column(children: [
                        ShimmerContainer(
                            height: 200,
                            borderRadius: 8,
                            width: double.infinity),
                        SizedBox(height: 16),
                        ShimmerContainer(
                            height: 200,
                            borderRadius: 8,
                            width: double.infinity)
                      ]);
                    } else if (state is LessonsLoaded) {
                      return SingleChildScrollView(
                        child: Column(
                            children: state.model.kyaLessons.map((lesson) {
                          return KyaLessonContainer(lesson);
                        }).toList()),
                      );
                    } else if (state is LessonsLoadingError) {
                      return Container(
                          width: double.infinity,
                          child: Column(children: [ErrorPage()]));
                    }
                    return Center(child: Text(state.toString()));
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
