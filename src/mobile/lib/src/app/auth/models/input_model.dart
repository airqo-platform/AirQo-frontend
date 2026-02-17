import 'dart:convert';

String registerInputModelToJson(RegisterInputModel data) => json.encode(data.toJson());

class RegisterInputModel {
    final String? firstName;
    final String? lastName;
    final String? email;
    final String? password;
    final String? category;

    RegisterInputModel({
        this.firstName,
        this.lastName,
        this.email,
        this.password,
        this.category,
    });

    Map<String, dynamic> toJson() => {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "password": password,
        "category": category,
    };
}
