import 'dart:convert';

ProfileResponseModel profileResponseModelFromJson(String str) => ProfileResponseModel.fromJson(json.decode(str));

String profileResponseModelToJson(ProfileResponseModel data) => json.encode(data.toJson());

class ProfileResponseModel {
    bool success;
    String message;
    List<User> users;

    ProfileResponseModel({
        required this.success,
        required this.message,
        required this.users,
    });

    factory ProfileResponseModel.fromJson(Map<String, dynamic> json) => ProfileResponseModel(
        success: json["success"],
        message: json["message"],
        users: List<User>.from(json["users"].map((x) => User.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "success": success,
        "message": message,
        "users": List<dynamic>.from(users.map((x) => x.toJson())),
    };
}

class User {
    String id;
    String firstName;
    String lastName;
    String? profilePicture;
    DateTime lastLogin;
    bool isActive;
    int loginCount;
    String userName;
    String email;
    bool verified;
    int analyticsVersion;
    String privilege;
    DateTime updatedAt;

    User({
        required this.id,
        required this.firstName,
        required this.lastName,
        required this.profilePicture,
        required this.lastLogin,
        required this.isActive,
        required this.loginCount,
        required this.userName,
        required this.email,
        required this.verified,
        required this.analyticsVersion,
        required this.privilege,
        required this.updatedAt,
    });

    factory User.fromJson(Map<String, dynamic> json) => User(
        id: json["_id"],
        firstName: json["firstName"],
        lastName: json["lastName"],
        profilePicture: json["profilePicture"],
        lastLogin: DateTime.parse(json["lastLogin"]),
        isActive: json["isActive"],
        loginCount: json["loginCount"],
        userName: json["userName"],
        email: json["email"],
        verified: json["verified"],
        analyticsVersion: json["analyticsVersion"],
        privilege: json["privilege"],
        updatedAt: DateTime.parse(json["updatedAt"]),
    );

    Map<String, dynamic> toJson() => {
        "_id": id,
        "firstName": firstName,
        "lastName": lastName,
        "profilePicture": profilePicture,
        "lastLogin": lastLogin.toIso8601String(),
        "isActive": isActive,
        "loginCount": loginCount,
        "userName": userName,
        "email": email,
        "verified": verified,
        "analyticsVersion": analyticsVersion,
        "privilege": privilege,
        "updatedAt": updatedAt.toIso8601String(),
    };
}
