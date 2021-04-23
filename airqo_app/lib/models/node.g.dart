// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'node.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Nodes _$NodesFromJson(Map<String, dynamic> json) {
  return Nodes(
    nodes: (json['nodes'] as List<dynamic>)
        .map((e) => Node.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

Map<String, dynamic> _$NodesToJson(Nodes instance) => <String, dynamic>{
      'nodes': instance.nodes,
    };

Node _$NodeFromJson(Map<String, dynamic> json) {
  return Node(
    channel_id: json['channel_id'] as String,
    location: json['location'] as String,
    name: json['name'] as String,
    lat: json['lat'] as String,
    lng: json['lng'] as String,
    churl: json['churl'] as String,
    an_type: json['an_type'] as String,
  );
}

Map<String, dynamic> _$NodeToJson(Node instance) => <String, dynamic>{
      'channel_id': instance.channel_id,
      'name': instance.name,
      'location': instance.location,
      'lat': instance.lat,
      'lng': instance.lng,
      'an_type': instance.an_type,
      'churl': instance.churl,
    };
