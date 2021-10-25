extension StringCasingExtension on String {
  String toCapitalized() {
    try {
      return isNotEmpty ? '${this[0].toUpperCase()}${substring(1)}' : '';
    } catch (e) {
      return this;
    }
  }

  bool isNull() {
    if (this == null ||
        isEmpty ||
        length == 0 ||
        this == '' ||
        toLowerCase() == 'null' ||
        toLowerCase().contains('null')) {
      return true;
    }

    return false;
  }

  String toTitleCase() =>
      split(' ').map((str) => str.toCapitalized()).join(' ');
}
