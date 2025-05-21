import 'package:airqo/src/app/learn/bloc/kya_bloc.dart';
import 'package:airqo/src/app/learn/widgets/kya_lesson_container.dart';
import 'package:airqo/src/app/shared/widgets/loading_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loggy/loggy.dart';

class KyaPage extends StatefulWidget {
  const KyaPage({super.key});

  @override
  State<KyaPage> createState() => _KyaPageState();
}

class _KyaPageState extends State<KyaPage> with UiLoggy {
  KyaBloc? kyaBloc;
  bool _isRetrying = false;

  @override
  void initState() {
    kyaBloc = context.read<KyaBloc>()..add(LoadLessons());
    super.initState();
  }

  void _retryLoading() {
    setState(() {
      _isRetrying = true;
    });
    kyaBloc?.add(LoadLessons(forceRefresh: true));
    Future.delayed(Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isRetrying = false;
        });
      }
    });
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
                "👋 Welcome! to \"Know Your Air,\" you'll learn about AirQo and air quality.",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Color(0xff7A7F87),
                ),
              ),
              SizedBox(height: 16),
              Row(
                children: [
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
                ],
              ),
              SizedBox(height: 16),
              Expanded(
                child: BlocBuilder<KyaBloc, KyaState>(
                  builder: (context, state) {
                    if (state is LessonsLoading || _isRetrying) {
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
                      // Check if we have cached data to show
                      if (state.cachedModel != null) {
                        // Silently use cached data without indicator
                        return SingleChildScrollView(
                          child: Column(
                            children: state.cachedModel!.kyaLessons.map((lesson) {
                              return KyaLessonContainer(lesson);
                            }).toList(),
                          ),
                        );
                      } else {
                        // No cached data, show error
                        return RefreshIndicator(
                          onRefresh: () async => _retryLoading(),
                          child: ListView(
                            children: [
                              SizedBox(height: 100),
                              Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.cloud_off,
                                      size: 64,
                                      color: Colors.grey,
                                    ),
                                    SizedBox(height: 16),
                                    Text(
                                      "Unable to load content",
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Theme.of(context).textTheme.headlineMedium?.color,
                                      ),
                                    ),
                                    SizedBox(height: 8),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 32.0),
                                      child: Text(
                                        "Please check your connection and try again",
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 16,
                                          color: Theme.of(context).textTheme.bodyMedium?.color,
                                        ),
                                      ),
                                    ),
                                    SizedBox(height: 24),
                                    ElevatedButton.icon(
                                      onPressed: _retryLoading,
                                      icon: Icon(Icons.refresh),
                                      label: Text('Try Again'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primaryColor,
                                        foregroundColor: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }
                    }
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 16),
                          Text("Loading know your air content...")
                        ],
                      ),
                    );
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