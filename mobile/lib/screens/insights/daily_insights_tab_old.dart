// import 'package:app/models/enum_constants.dart';
// import 'package:app/utils/extensions.dart';
// import 'package:app/utils/network.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_bloc/flutter_bloc.dart';
//
// import '../../blocs/daily_insights/daily_insights_bloc.dart';
// import '../../models/insights.dart';
// import '../../widgets/custom_shimmer.dart';
// import '../../widgets/custom_widgets.dart';
// import 'insights_widgets.dart';
//
// class DailyInsightsTab extends StatelessWidget {
//   DailyInsightsTab({super.key});
//
//   final GlobalKey _globalKey = GlobalKey();
//
//   @override
//   Widget build(BuildContext context) {
//     return Padding(
//       padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 0),
//       child: AppRefreshIndicator(
//         sliverChildDelegate: SliverChildBuilderDelegate(
//           (context, index) {
//             final items = [
//               BlocBuilder<DailyInsightsBloc, DailyInsightsState>(
//                   builder: (context, state) {
//                 return Padding(
//                   padding:
//                       const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
//                   child: InsightsToggleBar(
//                     frequency: Frequency.daily,
//                     isEmpty: state.insights.isEmpty,
//                     pollutant: state.pollutant,
//                   ),
//                 );
//               }),
//               const SizedBox(
//                 height: 12,
//               ),
//               Padding(
//                 padding:
//                     const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
//                 child: RepaintBoundary(
//                   key: _globalKey,
//                   child: const DailyInsightsGraph(),
//                 ),
//               ),
//               const SizedBox(
//                 height: 16,
//               ),
//               BlocBuilder<DailyInsightsBloc, DailyInsightsState>(
//                   builder: (context, state) {
//                 if (state.insights.isEmpty) {
//                   return const ContainerLoadingAnimation(
//                       height: 70.0, radius: 8.0);
//                 }
//
//                 final airQualityReading = state.airQualityReading;
//
//                 if (airQualityReading == null) {
//                   return const SizedBox();
//                 }
//                 return Padding(
//                   padding:
//                       const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
//                   child: InsightsActionBar(
//                     shareKey: _globalKey,
//                     airQualityReading: airQualityReading,
//                   ),
//                 );
//               }),
//               const SizedBox(
//                 height: 32,
//               ),
//               BlocBuilder<DailyInsightsBloc, DailyInsightsState>(
//                   builder: (context, state) {
//                 if (state.selectedInsight != null) {
//                   final insight = state.selectedInsight as Insights;
//                   if (insight.time.isToday() || insight.time.isTomorrow()) {
//                     return InsightsHealthTips(
//                       pollutant: state.pollutant,
//                       insight: insight,
//                     );
//                   }
//                 }
//                 return const SizedBox();
//               }),
//             ];
//
//             return items[index];
//           },
//           childCount: 5,
//         ),
//         onRefresh: () async {
//           await _refreshPage(context);
//         },
//       ),
//     );
//   }
//
//   Future<void> _refreshPage(BuildContext context) async {
//     context.read<DailyInsightsBloc>().add(const LoadDailyInsights());
//     await checkNetworkConnection(
//       context,
//       notifyUser: true,
//     );
//   }
// }
