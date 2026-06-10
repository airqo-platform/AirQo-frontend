class AutoCompleteResponse {
    List<Prediction> predictions;
    String status;

    AutoCompleteResponse({
        required this.predictions,
        required this.status,
    });

    factory AutoCompleteResponse.fromJson(Map<String, dynamic> json) => AutoCompleteResponse(
        predictions: List<Prediction>.from(json["predictions"].map((x) => Prediction.fromJson(x))),
        status: json["status"],
    );

    Map<String, dynamic> toJson() => {
        "predictions": List<dynamic>.from(predictions.map((x) => x.toJson())),
        "status": status,
    };
}

class Prediction {
    String description;
    List<MatchedSubstring> matchedSubstrings;
    String placeId;
    String reference;
    StructuredFormatting structuredFormatting;
    List<Term> terms;
    List<String> types;

    Prediction({
        required this.description,
        required this.matchedSubstrings,
        required this.placeId,
        required this.reference,
        required this.structuredFormatting,
        required this.terms,
        required this.types,
    });

    factory Prediction.fromJson(Map<String, dynamic> json) => Prediction(
        description: json["description"],
        matchedSubstrings: List<MatchedSubstring>.from(json["matched_substrings"].map((x) => MatchedSubstring.fromJson(x))),
        placeId: json["place_id"],
        reference: json["reference"],
        structuredFormatting: StructuredFormatting.fromJson(json["structured_formatting"]),
        terms: List<Term>.from(json["terms"].map((x) => Term.fromJson(x))),
        types: List<String>.from(json["types"].map((x) => x)),
    );

    Map<String, dynamic> toJson() => {
        "description": description,
        "matched_substrings": List<dynamic>.from(matchedSubstrings.map((x) => x.toJson())),
        "place_id": placeId,
        "reference": reference,
        "structured_formatting": structuredFormatting.toJson(),
        "terms": List<dynamic>.from(terms.map((x) => x.toJson())),
        "types": List<dynamic>.from(types.map((x) => x)),
    };
}

class MatchedSubstring {
    int length;
    int offset;

    MatchedSubstring({
        required this.length,
        required this.offset,
    });

    factory MatchedSubstring.fromJson(Map<String, dynamic> json) => MatchedSubstring(
        length: json["length"],
        offset: json["offset"],
    );

    Map<String, dynamic> toJson() => {
        "length": length,
        "offset": offset,
    };
}

class StructuredFormatting {
    String mainText;
    List<MatchedSubstring> mainTextMatchedSubstrings;
    String secondaryText;

    StructuredFormatting({
        required this.mainText,
        required this.mainTextMatchedSubstrings,
        required this.secondaryText,
    });

    factory StructuredFormatting.fromJson(Map<String, dynamic> json) => StructuredFormatting(
        mainText: json["main_text"],
        mainTextMatchedSubstrings: List<MatchedSubstring>.from(json["main_text_matched_substrings"].map((x) => MatchedSubstring.fromJson(x))),
        secondaryText: json["secondary_text"],
    );

    Map<String, dynamic> toJson() => {
        "main_text": mainText,
        "main_text_matched_substrings": List<dynamic>.from(mainTextMatchedSubstrings.map((x) => x.toJson())),
        "secondary_text": secondaryText,
    };
}

class Term {
    int offset;
    String value;

    Term({
        required this.offset,
        required this.value,
    });

    factory Term.fromJson(Map<String, dynamic> json) => Term(
        offset: json["offset"],
        value: json["value"],
    );

    Map<String, dynamic> toJson() => {
        "offset": offset,
        "value": value,
    };
}
