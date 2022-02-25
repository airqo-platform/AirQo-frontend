extension StringCasingExtension on String {
  String toCapitalized() {
    try {
      return isNotEmpty ? '${this[0]
          .toUpperCase()}${substring(1).toLowerCase()}' : '';
    } catch (e) {
      return this;
    }
  }

  String toTitleCase() =>
      split(' ').map((str) => str.toCapitalized()).join(' ');
}
