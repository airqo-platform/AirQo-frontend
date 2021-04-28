// import 'dart:async';
//
// import 'package:app/models/device.dart';
// import 'package:sqflite/sqflite.dart';
//
// class DBHelper {
//   DBHelper._();
//
//   final String nodesTable = 'Nodes';
//   final String columnId = '_id';
//   final String columnName = 'name';
//   final String columnLat = 'lat';
//   final String columnLng = 'lng';
//
//   static final DBHelper db = DBHelper._();
//
//   Database _database;
//
//   Future<Database> get database async {
//     if (_database != null) return _database;
//     _database = await initDB();
//     return _database;
//   }
//
//   initDB() async {
//     // var documentsDirectory = await getApplicationDocumentsDirectory();
//     // var path = join(documentsDirectory.path, "TestDB.db");
//     return await openDatabase(await getDatabasesPath(), version: 1,
//         onOpen: (db) {},
//         onCreate: (Database db, int version) async {
//           createdDefaultDatabases(db);
//         });
//   }
//
//   createdDefaultDatabases(Database db) async{
//
//     await db.execute('''
//         create table $nodesTable (
//           $columnId integer primary key autoincrement,
//           $columnName text not null,
//           $columnLat text not null,
//           $columnLng text not null,
//           )
//       ''');
//
//
//   }
//
//   updateNode(Node newNode) async {
//     final db = await database;
//     var res = await db.update("Node", newNode.toMap(),
//         where: "id = ?", whereArgs: [newNode.id]);
//     return res;
//   }
//
//   getNode(int id) async {
//     final db = await database;
//     var res = await db.query("Node", where: "id = ?", whereArgs: [id]);
//     return res.isNotEmpty ? Node.fromMap(res.first) : null;
//   }
//
//   Future<List<Node>> getNodes() async {
//     final db = await database;
//     final List<Map<String, dynamic>> maps = await db.query(nodesTable);
//
//     return List.generate(maps.length, (i) {
//       return Node(
//         channel_id: maps[i]['channel_id'],
//         churl: maps[i]['churl'],
//         name: maps[i]['name'],
//         an_type: maps[i]['an_type'],
//         lat: maps[i]['lat'],
//         lng: maps[i]['lng'],
//         location: maps[i]['location'],
//       );
//     });
//
//
//   }
//
// }
