import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_v3/app/dashboard/widgets/nearby_view.dart';
import 'package:mobile_v3/app/dashboard/viewmodels/nearby_view_model.dart';
import 'package:mobile_v3/app/dashboard/models/nearby_item.dart';

/// Wraps [NearbyView] in a [MaterialApp] for widget testing.
Widget _buildTestableWidget(NearbyViewModel viewModel) {
  return MaterialApp(
    home: NearbyView(viewModel: viewModel),
  );
}

void main() {
  group('NearbyView Widget', () {
    testWidgets('shows a CircularProgressIndicator when loading', (WidgetTester tester) async {
      final viewModel = NearbyViewModel();
      viewModel.stateNotifier.value = ViewState.loading;
      viewModel.items = [];
      viewModel.errorMessage = null;

      await tester.pumpWidget(_buildTestableWidget(viewModel));

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('renders a ListView of NearbyItem names when data is available', (WidgetTester tester) async {
      final viewModel = NearbyViewModel();
      viewModel.stateNotifier.value = ViewState.data;
      viewModel.items = [
        NearbyItem(id: '1', name: 'Coffee Shop'),
        NearbyItem(id: '2', name: 'Library'),
      ];
      viewModel.errorMessage = null;

      await tester.pumpWidget(_buildTestableWidget(viewModel));
      await tester.pumpAndSettle();

      expect(find.byType(ListView), findsOneWidget);
      expect(find.text('Coffee Shop'), findsOneWidget);
      expect(find.text('Library'), findsOneWidget);
    });

    testWidgets('shows empty message when items list is empty', (WidgetTester tester) async {
      final viewModel = NearbyViewModel();
      viewModel.stateNotifier.value = ViewState.data;
      viewModel.items = [];
      viewModel.errorMessage = null;

      await tester.pumpWidget(_buildTestableWidget(viewModel));
      await tester.pumpAndSettle();

      expect(find.text('No nearby places found.'), findsOneWidget);
    });

    testWidgets('displays the errorMessage when state is error', (WidgetTester tester) async {
      final viewModel = NearbyViewModel();
      viewModel.stateNotifier.value = ViewState.error;
      viewModel.items = [];
      viewModel.errorMessage = 'Network failed';

      await tester.pumpWidget(_buildTestableWidget(viewModel));
      await tester.pumpAndSettle();

      expect(find.text('Network failed'), findsOneWidget);
    });
  });
}