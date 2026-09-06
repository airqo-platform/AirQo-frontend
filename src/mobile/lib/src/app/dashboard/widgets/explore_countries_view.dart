import 'package:flutter/material.dart';
import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/country_model.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_card.dart';
import 'package:airqo/src/app/shared/widgets/empty_state_view.dart';
import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';

class ExploreCountriesView extends StatelessWidget {
  final List<Measurement> measurements;
  final VoidCallback? onRetry;

  const ExploreCountriesView({
    super.key,
    required this.measurements,
    this.onRetry,
  });

  Map<String, List<Measurement>> _groupByCountry() {
    final grouped = <String, List<Measurement>>{};
    for (final m in measurements) {
      final country = m.siteDetails?.country;
      if (country == null || country.isEmpty) continue;
      grouped.putIfAbsent(country, () => []).add(m);
    }
    return grouped;
  }

  @override
  Widget build(BuildContext context) {
    final grouped = _groupByCountry();
    final countries = grouped.keys.toList()..sort();

    if (countries.isEmpty) {
      return EmptyStateView(
        icon: SystemGlyph.emptyPlace(context),
        title: 'No air quality stations available',
        message: "We couldn't find any stations right now. Please try again.",
        actionLabel: onRetry != null ? 'Try Again' : null,
        onAction: onRetry,
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      itemCount: countries.length,
      itemBuilder: (context, index) {
        final country = countries[index];
        final flag = CountryModel.getFlagFromCountryName(country);
        final sample = grouped[country]!.first;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
              child: TranslatedText(
                '$flag  $country',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).textTheme.headlineMedium?.color,
                ),
              ),
            ),
            AnalyticsCard(sample),
          ],
        );
      },
    );
  }
}
