extension StringCasingExtension on String {
  String toCapitalized() {
    try {
      return isNotEmpty ? '${this[0].toUpperCase()}${substring(1)}' : '';
    } catch (e) {
      return this;
    }
  }

  bool isValidEmail() {
    return RegExp(
            r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$')
        .hasMatch(this);
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
