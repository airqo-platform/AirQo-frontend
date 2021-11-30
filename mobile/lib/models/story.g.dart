// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'story.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Story _$StoryFromJson(Map<String, dynamic> json) {
  $checkKeys(
    json,
    requiredKeys: const [
      'link',
      'pubDate',
      'title',
      'author',
      'guid',
      'thumbnail',
      'content',
      'description'
    ],
  );
  return Story(
    json['link'] as String,
    json['pubDate'] as String,
    json['title'] as String,
    json['author'] as String,
    json['guid'] as String,
    json['thumbnail'] as String,
    json['content'] as String,
    json['description'] as String,
  );
}

Map<String, dynamic> _$StoryToJson(Story instance) => <String, dynamic>{
      'link': instance.link,
      'pubDate': instance.pubDate,
      'title': instance.title,
      'author': instance.author,
      'guid': instance.guid,
      'thumbnail': instance.thumbnail,
      'content': instance.content,
      'description': instance.description,
    };
