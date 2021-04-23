import 'package:json_annotation/json_annotation.dart';

part 'node.g.dart';

@JsonSerializable()
class Nodes {
  Nodes({
    required this.nodes,
  });

  factory Nodes.fromJson(Map<String, dynamic> json) =>
      _$NodesFromJson(json);
  Map<String, dynamic> toJson() => _$NodesToJson(this);

  final List<Node> nodes;
}

@JsonSerializable()
class Node {
  Node({
    required this.channel_id,
    required this.location,
    required this.name,
    required this.lat,
    required this.lng,
    // required this.field2,
    // required this.time,
    required this.churl,
    required this.an_type,
  });

  factory Node.fromJson(Map<String, dynamic> json) =>
      _$NodeFromJson(json);
  Map<String, dynamic> toJson() => _$NodeToJson(this);

  final String channel_id;
  final String name;
  final String location;
  final String lat;
  final String lng;
  // final String field2;
  // final String time;
  final String an_type;
  final String churl;

}
