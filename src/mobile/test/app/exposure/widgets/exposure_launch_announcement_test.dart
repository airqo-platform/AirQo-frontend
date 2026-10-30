import 'package:airqo/src/app/exposure/widgets/exposure_launch_announcement.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  tearDown(ExposureLaunchAnnouncement.releaseHomeTour);

  test('the home tour is free to start when nothing is holding it', () async {
    var released = false;
    await ExposureLaunchAnnouncement.homeTourGate;
    released = true;
    expect(released, isTrue);
  });

  test('the home tour waits until the exposure announcement is released', () async {
    ExposureLaunchAnnouncement.holdHomeTour();
    var released = false;
    final waiting = ExposureLaunchAnnouncement.homeTourGate.then((_) {
      released = true;
    });

    await Future<void>.delayed(Duration.zero);
    expect(released, isFalse);

    ExposureLaunchAnnouncement.releaseHomeTour();
    await waiting;
    expect(released, isTrue);
  });

  test('an older shell cannot open the newest home tour gate', () async {
    final older = ExposureLaunchAnnouncement.holdHomeTour();
    final newer = ExposureLaunchAnnouncement.holdHomeTour();
    var released = false;
    final waiting = ExposureLaunchAnnouncement.homeTourGate.then((_) {
      released = true;
    });

    older.release();
    await Future<void>.delayed(Duration.zero);
    expect(released, isFalse);

    ExposureLaunchAnnouncement.releaseHomeTour(newer);
    await waiting;
    expect(released, isTrue);
  });
}
