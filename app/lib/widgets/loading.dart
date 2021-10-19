import 'package:flutter/material.dart';

import 'custom_widgets.dart';

class CardListItem extends StatelessWidget {
  final bool isLoading;
  final String size;

  const CardListItem({Key? key, required this.isLoading, required this.size})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: getLoadingWidgets(),
    );
  }

  Widget getLoadingWidgets() {
    if (size == 'small') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTip(),
        ],
      );
    } else if (size == 'big') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCard(),
        ],
      );
    } else {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCard(),
          const SizedBox(height: 16),
          _buildText(),
          const SizedBox(height: 8),
          _buildTip(),
          const SizedBox(height: 8),
          _buildTip(),
        ],
      );
    }
  }

  Widget _buildCard() {
    return AspectRatio(
      aspectRatio: 16 / 16,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }

  Widget _buildText() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          height: 24,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ],
    );
  }

  Widget _buildTip() {
    return AspectRatio(
      aspectRatio: 16 / 3,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}

class LoadingAnimation extends StatefulWidget {
  const LoadingAnimation({
    Key? key,
  }) : super(key: key);

  @override
  _LoadingAnimationState createState() => _LoadingAnimationState();
}

class SmallLoadingAnimation extends StatefulWidget {
  const SmallLoadingAnimation({
    Key? key,
  }) : super(key: key);

  @override
  _SmallLoadingAnimationState createState() => _SmallLoadingAnimationState();
}

class _LoadingAnimationState extends State<LoadingAnimation> {
  @override
  Widget build(BuildContext context) {
    return Shimmer(
      linearGradient: shimmerGradient,
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 2),
          const ShimmerLoading(
            isLoading: true,
            child: CardListItem(
              isLoading: true,
              size: 'full',
            ),
          ),
        ],
      ),
    );
  }
}

class _SmallLoadingAnimationState extends State<SmallLoadingAnimation> {
  @override
  Widget build(BuildContext context) {
    return const Shimmer(
      linearGradient: shimmerGradient,
      child: ShimmerLoading(
        isLoading: true,
        child: CardListItem(
          isLoading: true,
          size: 'small',
        ),
      ),
    );
  }
}
