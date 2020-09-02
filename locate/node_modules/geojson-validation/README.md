GeoJSON-Validation
==================

**A GeoJSON Validation Library**  
Check JSON objects to see whether or not they are valid GeoJSON. Validation is based off of the [GeoJSON Format Specification revision 1.0](http://geojson.org/geojson-spec.html#geojson-objects)

- [Installation](#installation)
- [Usage](#usage)
- [Cli usage](#cli-usage)
- [Api](#api)
- [Testing](#testing)
- [Cavets](#cavets)

## Installation
`npm install geojson-validation`

## usage
```javascript
const gjv = require("geojson-validation");

const validFeatureCollection = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
            "properties": {"prop0": "value0"}
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                ]
            },
            "properties": {
                "prop0": "value0",
                "prop1": 0.0
            }
        }
    ]
};

//simple test
if(gjv.valid(validFeatureCollection)){
    console.log("this is valid GeoJSON!");
}

const invalidFeature =  {
    "type": "feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
        ]
    },
    "properties": {
        "prop0": "value0",
        "prop1": 0.0
    }
};

//test to see if `invalidFeature` is valid and return a "trace" which contains the error
const trace = gjv.isFeature(invalidFeature, true)
console.log(trace)
```

## CLI usage
first install gobally   
`npm install geojson-validation -g`   
Then you can use `gjv` to validate file such as   
`gjv file1 file2..`   
Or you can stream files to it
`cat file | gjv`  
`gjv` will either return a list of error or a `valid` if the files are indeed valid.

## API
All Function return a `boolean` and take a JSON object that will be evalatued to see if it is a GeoJSON object, with the exception of [define](#definetype-function).  

**Arguments**  
* geoJSON - a JSON object that is tested to see if it is a valid GeoJSON object
* trace - `boolean` is whether or not to return an array of validation errors for an invalid JSON object. If trace is false then the a Boolean will be returned depending on the validity of the object.

### Define(type, function)
Define a Custom Validation for the give `type`. `type` can be "Feature", "FeatureCollection", "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection", "Bbox", "Position", "GeoJSON" or "GeometryObject". 

The `function` is passed the `object` being validated and should return a `string` or an `array` of  strings representing errors. If there are no errors then the function should not return anything or an empty array. See the [example](#define-example) for more.

### [Full Documention](./docs/index.md)

--------------------------------------------------------

## Define Example
Thanks to [@VitoLau](https://github.com/VitoLau>) for the code for this example.
```javascript
const gjv = require("geojson-validation");

gjv.define("Position", (position) => {
    //the postion must be valid point on the earth, x between -180 and 180
    errors = [];
    if(position[0] < -180 || position[0] > 180){
        errors.push("the x must be between -180 and 180");
    }
    if(position[1] < -90 || position[1] > 90){
        errors.push("the y must be between -90 and 90");
    }
    return errors;

});

const gj = {type: "Point", coordinates: [-200,3]};
//returns false
gjv.isPoint(gj);
```

## Testing
To run tests `npm test`   
Test use mocha

## Cavets
* Does not check ordering of Bouding Box coordinates
* Does not check Coordinate Reference System Objects
* Does not check order of rings for polygons with multiple rings
