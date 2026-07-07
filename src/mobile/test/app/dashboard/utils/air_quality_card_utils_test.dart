import 'package:airqo/src/app/dashboard/utils/air_quality_card_utils.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('sanitizeCardText', () {
    test('fixes simple Latin-1 mojibake', () {
      expect(sanitizeCardText('CafÃ©'), 'Café');
    });

    test('fixes Windows-1252 smart-quote mojibake', () {
      expect(sanitizeCardText('itâ€™s'), 'it’s');
    });

    test('fixes Windows-1252 em-dash mojibake', () {
      expect(sanitizeCardText('9amâ€“5pm'), '9am–5pm');
    });

    test('leaves plain ASCII text unchanged', () {
      const value = 'Nairobi, Kenya';
      expect(sanitizeCardText(value), value);
    });

    test('leaves legitimate accented text unchanged', () {
      // A bare 'â' is a real letter (French/Portuguese/Vietnamese etc.),
      // not a mojibake artifact — must not be "fixed" into garbage.
      const value = 'Château, âge';
      expect(sanitizeCardText(value), value);
    });
  });
}
