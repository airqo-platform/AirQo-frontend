class TimeSeriesData {
  final DateTime time;
  final double value;

  TimeSeriesData(this.time, this.value);

  @override
  String toString() {
    return 'TimeSeriesData{time: $time, value: $value}';
  }
}
