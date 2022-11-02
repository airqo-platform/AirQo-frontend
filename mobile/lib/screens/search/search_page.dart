import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/widgets.dart';
import 'package:app_repository/app_repository.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../insights/insights_page.dart';

part 'search_widgets.dart';

class SearchPage extends StatelessWidget {
  const SearchPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final appColors = Theme.of(context).extension<AppColors>()!;

    return Scaffold(
      appBar: _SearchBar(),
      body: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        height: double.infinity,
        width: double.infinity,
        color: appColors.appBodyColor,
        child: _SearchBody(),
      ),
    );
  }
}

class _SearchBar extends StatefulWidget implements PreferredSizeWidget {
  @override
  State<_SearchBar> createState() => _SearchBarState();

  @override
  Size get preferredSize => const Size.fromHeight(60);
}

class _SearchBarState extends State<_SearchBar> {
  final _textController = TextEditingController();
  late SearchBloc _searchBloc;

  @override
  void initState() {
    super.initState();
    _searchBloc = context.read<SearchBloc>();
  }

  @override
  void dispose() {
    super.dispose();
    _textController.dispose();
    _clearSearch();
  }

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 72,
      elevation: 0,
      backgroundColor: CustomColors.appBodyColor,
      automaticallyImplyLeading: false,
      leading: const Padding(
        padding: EdgeInsets.only(
          top: 5,
          bottom: 6.5,
          left: 16,
        ),
        child: AppBackButton(),
      ),
      title: Padding(
        padding: const EdgeInsets.only(top: 0),
        child: SearchInputField(
          textEditingController: _textController,
          searchChanged: _searchChanged,
        ),
      ),
    );
  }

  void _searchChanged(String text) {
    _searchBloc.add(
      SearchTermChanged(text: text),
    );
  }

  void _clearSearch() {
    _searchBloc.add(const SearchTermChanged(text: ''));
  }
}

class _SearchBody extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchBloc, SearchState>(
      builder: (context, state) {
        if (state is SearchStateLoading) {
          return const LoadingWidget();
        }

        if (state is SearchStateNearestLocations) {
          return const NearbyLocations();
        }

        if (state is SearchStateLocationNotSupported) {
          return const AirQualityNotAvailable();
        }

        if (state is SearchStateError) {
          return SearchError(error: state.error);
        }

        if (state is SearchStateSuccess) {
          return state.items.isEmpty
              ? const SearchError(error: 'No Results')
              : SearchResultsWidget(searchResultItems: state.items);
        }

        return const NearbyLocations();
      },
    );
  }
}
