import 'package:airqo/src/app/auth/pages/register_page.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/pages/lesson_finished.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:flutter/material.dart';

class LessonPage extends StatefulWidget {
  final KyaLesson lesson;

  const LessonPage(this.lesson, {super.key});

  @override
  State<LessonPage> createState() => _LessonPageState();
}

class _LessonPageState extends State<LessonPage> {
  late final CardSwiperController _controller;
  int _currentIndex = 0;
  bool _finished = false;

  @override
  void initState() {
    super.initState();
    _controller = CardSwiperController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onIndexChanged(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _LessonSheetHeader(
          lesson: widget.lesson,
          currentIndex: _currentIndex,
          taskCount: widget.lesson.tasks.length,
          finished: _finished,
        ),
        Expanded(
          child: _finished
              ? LessonFinishedWidget()
              : _LessonCardBody(
                  lesson: widget.lesson,
                  controller: _controller,
                  currentIndex: _currentIndex,
                  onIndexChanged: _onIndexChanged,
                  onFinished: () => setState(() => _finished = true),
                ),
        ),
      ],
    );
  }
}

// ─── Sheet header: drag handle + title + stepper + close ─────────────────────

class _LessonSheetHeader extends StatelessWidget {
  final KyaLesson lesson;
  final int currentIndex;
  final int taskCount;
  final bool finished;

  const _LessonSheetHeader({
    required this.lesson,
    required this.currentIndex,
    required this.taskCount,
    required this.finished,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Drag handle
        const SizedBox(height: 10),
        Container(
          height: 4,
          width: 40,
          decoration: BoxDecoration(
            color: Colors.grey.shade300,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Expanded(
                child: TranslatedText(
                  lesson.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.boldHeadlineColor,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Container(
                  height: 32,
                  width: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.grey.shade200,
                  ),
                  child: const Icon(Icons.close, size: 18, color: Colors.black54),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (!finished)
          SizedBox(
            height: 6,
            child: StepperWidget(
              green: true,
              currentIndex: currentIndex,
              count: taskCount,
            ),
          ),
        const SizedBox(height: 8),
      ],
    );
  }
}

// ─── Card body: swiper + nav buttons ─────────────────────────────────────────

class _LessonCardBody extends StatelessWidget {
  final KyaLesson lesson;
  final CardSwiperController controller;
  final int currentIndex;
  final ValueChanged<int> onIndexChanged;
  final VoidCallback onFinished;

  const _LessonCardBody({
    required this.lesson,
    required this.controller,
    required this.currentIndex,
    required this.onIndexChanged,
    required this.onFinished,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: CardSwiper(
            allowedSwipeDirection: AllowedSwipeDirection.none(),
            controller: controller,
            cardsCount: lesson.tasks.length,
            onSwipe: (previousIndex, idx, direction) async {
              onIndexChanged(idx!);
              if (idx == lesson.tasks.length - 1) {
                await Future.delayed(const Duration(seconds: 3));
                onFinished();
              }
              return true;
            },
            onUndo: (previousIndex, idx, direction) {
              onIndexChanged(idx);
              return true;
            },
            cardBuilder: (context, index, percentX, percentY) =>
                CardContent(data: lesson.tasks[index]),
          ),
        ),
        _NavButtons(controller: controller),
        const SizedBox(height: 24),
      ],
    );
  }
}

class _NavButtons extends StatelessWidget {
  final CardSwiperController controller;
  const _NavButtons({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _NavButton(
            onTap: () => controller.undo(),
            icon: Icons.arrow_back_ios,
            color: Theme.of(context).highlightColor,
          ),
          const SizedBox(width: 12),
          _NavButton(
            onTap: () => controller.swipe(CardSwiperDirection.left),
            icon: Icons.arrow_forward_ios,
            color: const Color(0xff57D175),
          ),
        ],
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  final VoidCallback onTap;
  final IconData icon;
  final Color color;
  const _NavButton({required this.onTap, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 62,
        width: 78,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(40),
          color: color,
        ),
        child: Center(
          child: Icon(icon, color: Colors.black, size: 17),
        ),
      ),
    );
  }
}

// ─── Card content ─────────────────────────────────────────────────────────────

class CardContent extends StatelessWidget {
  final Task data;
  const CardContent({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        image: DecorationImage(
          image: NetworkImage(data.image),
          fit: BoxFit.cover,
        ),
        color: Colors.blue,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Spacer(),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xff57D175),
              borderRadius: BorderRadius.only(
                bottomRight: Radius.circular(8),
                bottomLeft: Radius.circular(8),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TranslatedText(
                  data.title,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 8),
                TranslatedText(
                  data.content,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w500,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 4),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Kept for any existing code that still references [CardContentData] by name.
class CardContentData {
  final String title;
  final String text;
  const CardContentData({required this.title, required this.text});
}
