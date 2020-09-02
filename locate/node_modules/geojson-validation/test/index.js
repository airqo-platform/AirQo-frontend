const assert = require('assert')
const GSV = require('../index.js')

describe('Positions', () => {
  it('must be a valid position object', () => {
    assert(GSV.isPosition([2, 3]))
  })

  it('must be a valid position object', () => {
    assert.equal(false, GSV.isPosition([null, null]))
  })

  it('must be an array', () => {
    assert.equal(false, GSV.isPosition("adf"))
  })

  it('must be at least two elements', () => {
    assert.equal(false, GSV.isPosition([2]))
  })
})

describe("GeoJSON Objects", () => {
  it('must have a member with the name "type"', () => {
    gj = {
      "test": "1"
    }
    assert.equal(false, GSV.isGeoJSONObject(gj))
  })

  describe("type member", () => {
    it('must be one of: "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection", "Feature", or "FeatureCollection"', () => {
      gj = {
        type: "point"
      }
      assert.equal(false, GSV.isGeoJSONObject(gj))
    })
  })

  describe("Geometry Objects", () => {
    describe("type member", () => {
      it('must be one of "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", or "GeometryCollection"', () => {
        gj = {
          type: "Feature"
        }
        assert.equal(false, GSV.isGeometryObject(gj))
      })
    })

    describe("Point", () => {
      it('must be a valid Point Object', () => {
        gj = {
          type: "Point",
          coordinates: [2, 3]
        }
        assert(GSV.isPoint(gj))
      })

      it('member type must be "Point"', () => {
        gj = {
          type: "Polygon",
          coordinates: [2, 3]
        }
        assert.equal(false, GSV.isPoint(gj))
      })

      it('must have a member with the name "coordinates"', () => {
        gj = {
          type: "Point",
          coordinate: [2, 3]
        }
        assert.equal(false, GSV.isPoint(gj))
      })

      describe("type coordinates", () => {
        it('must be a single position', () => {
          gj = {
            type: "Point",
            coordinates: [2]
          }
          assert.equal(false, GSV.isPoint(gj))
        })
      })
    })

    describe("MultiPoint", () => {
      it('must be a valid MultiPoint Object', () => {
        gj = {
          type: "MultiPoint",
          coordinates: [
            [2, 3],
            [5, 6]
          ]
        }
        assert(GSV.isMultiPoint(gj))
      })

      it('member type must be "MultiPoint"', () => {
        gj = {
          type: "Point",
          coordinates: [
            [2, 3],
            [5, 6]
          ]
        }
        assert.equal(false, GSV.isMultiPoint(gj))
      })

      it('must have a member with the name "coordinates"', () => {
        gj = {
          type: "MultiPoint",
          coordinate: [2, 3]
        }
        assert.equal(false, GSV.isPoint(gj))
      })

      describe("type coordinates", () => {
        it('must be an array of positions', () => {
          gj = {
            type: "MultiPoint",
            coordinates: [
              [2, 3],
              [5]
            ]
          }
          assert.equal(false, GSV.isMultiPoint(gj))
        })
      })
    })

    describe("Linestring", () => {

      it('must be a valid LineString Object', () => {
        const ValidLineString = {
          "type": "LineString",
          "coordinates": [
            [102.0, 0.0],
            [103.0, 1.0],
            [104.0, 0.0],
            [105.0, 1.0]
          ]
        }
        assert(GSV.isLineString(ValidLineString))
      })

      it('member type must be "LineString"', () => {
        gj = {
          type: "lineString",
          coordinates: [
            [2, 3],
            [5, 6]
          ]
        }
        assert.equal(false, GSV.isLineString(gj))
      })

      it('must have a member with the name "coordinates"', () => {
        gj = {
          type: "LineString",
          coordinate: [
            [102.0, 0.0],
            [103.0, 1.0],
            [104.0, 0.0],
            [105.0, 1.0]
          ]
        }
        assert.equal(false, GSV.isLineString(gj))
      })

      describe("type coordinates", () => {
        it('must be an array of positions', () => {
          gj = {
            type: "LineString",
            coordinate: [
              [2, 3],
              [5]
            ]
          }
          assert.equal(false, GSV.isLineString(gj))
        })

        it('must be at least two elements', () => {
          gj = {
            type: "LineString",
            coordinates: [
              [2, 3]
            ]
          }
          assert.equal(false, GSV.isLineString(gj))
        })
      })
    })

    describe("MutliLineString", () => {

      it('must be a valid MutiLineString Object', () => {
        const validMutlineString = {
          "type": "MultiLineString",
          "coordinates": [
            [
              [100.0, 0.0],
              [101.0, 1.0]
            ],
            [
              [102.0, 2.0],
              [103.0, 3.0]
            ]
          ]
        }
        assert(GSV.isMultiLineString(validMutlineString))
      })

      it('member type must be "MutliLineString"', () => {

        const invalidMutlineString = {
          "type": "multiLineString",
          "coordinates": [
            [
              [100.0, 0.0],
              [101.0, 1.0]
            ],
            [
              [102.0, 2.0],
              [103.0, 3.0]
            ]
          ]
        }
        assert.equal(false, GSV.isMultiLineString(invalidMutlineString))
      })

      it('must have a member with the name "coordinates"', () => {
        const invalidMutlineString = {
          "type": "MultiLineString",
          "coordinate": [
            [
              [100.0, 0.0],
              [101.0, 1.0]
            ],
            [
              [102.0, 2.0],
              [103.0, 3.0]
            ]
          ]
        }
        assert.equal(false, GSV.isMultiLineString(invalidMutlineString))
      })

      describe("type coordinates", () => {
        it('must be an array of LineString coordinate arrays', () => {

          const invalidMutlineString = {
            "type": "MultiLineString",
            "coordinate": [
              [
                [100.0, 0.0],
                [101.0]
              ],
              [
                [102.0, 2.0],
                [103.0, 3.0]
              ]
            ]
          }
          assert.equal(false, GSV.isMultiLineString(invalidMutlineString))
        })
      })
    })

    describe('Polygon', () => {
      it('must be a valid Polygon Object', () => {
        const validPolygon = {
          "type": "Polygon",
          "coordinates": [
            [
              [100.0, 0.0],
              [101.0, 0.0],
              [101.0, 1.0],
              [100.0, 1.0],
              [100.0, 0.0]
            ]
          ]
        }
        assert(GSV.isPolygon(validPolygon))
      })

      it('member type must be "Polygon"', () => {
        const invalidPolygon = {
          "type": "polygon",
          "coordinates": [
            [
              [100.0, 0.0],
              [101.0, 0.0],
              [101.0, 1.0],
              [100.0, 1.0],
              [100.0, 0.0]
            ]
          ]
        }
        assert.equal(false, GSV.isPolygon(invalidPolygon))
      })

      it('must have a member with the name "coordinates"', () => {
        const invalidPolygon = {
          "type": "Polygon",
          "coordinate": [
            [
              [100.0, 0.0],
              [101.0, 0.0],
              [101.0, 1.0],
              [100.0, 1.0],
              [100.0, 0.0]
            ]
          ]
        }
        assert.equal(false, GSV.isPolygon(invalidPolygon))
      })

      describe("type coordinates", () => {
        it('must be an array of LinearRing coordinate arrays', () => {
          const invalidPolygon = {
            "type": "Polygon",
            "coordinates": "test"
          }
          assert.equal(false, GSV.isPolygon(invalidPolygon))
        })

        describe('LinearRing', () => {
          it('must be a LineString with 4 or more positions', () => {
            const invalidPolygon = {
              "type": "Polygon",
              "coordinates": [
                [
                  [100.0, 0.0],
                  [101.0, 0.0],
                  [101.0, 1.0],
                  [100.0, 1.0],
                  [100.0, 0.0]
                ],
                [
                  [100.0, 0.0],
                  [100.0, 1.0],
                  [100.0, 0.0]
                ]
              ]
            }
            assert.equal(false, GSV.isPolygon(invalidPolygon))
          })

          it('The first and last positions must be equivalent (represent equivalent points)', () => {
            const invalidPolygon = {
              "type": "Polygon",
              "coordinates": [
                [
                  [100.0, 1.0],
                  [101.0, 0.0],
                  [101.0, 1.0],
                  [100.0, 1.0],
                  [100.0, 0.0]
                ]
              ]
            }
            assert.equal(false, GSV.isPolygon(invalidPolygon))
          })
        })
      })
    })

    describe('MultiPolygon', () => {
      it('must be a valid MultiPolygon object', () => {
        const validMultiPolygon = {
          "type": "MultiPolygon",
          "coordinates": [
            [
              [
                [102.0, 2.0],
                [103.0, 2.0],
                [103.0, 3.0],
                [102.0, 3.0],
                [102.0, 2.0]
              ]
            ],
            [
              [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0]
              ],
              [
                [100.2, 0.2],
                [100.8, 0.2],
                [100.8, 0.8],
                [100.2, 0.8],
                [100.2, 0.2]
              ]
            ]
          ]
        }
        assert(GSV.isMultiPolygon(validMultiPolygon))
      })

      it('member type must be "MultiPolygon"', () => {
        const invalidMultiPolygon = {
          "type": "multiPolygon",
          "coordinates": [
            [
              [
                [102.0, 2.0],
                [103.0, 2.0],
                [103.0, 3.0],
                [102.0, 3.0],
                [102.0, 2.0]
              ]
            ],
            [
              [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0]
              ],
              [
                [100.2, 0.2],
                [100.8, 0.2],
                [100.8, 0.8],
                [100.2, 0.8],
                [100.2, 0.2]
              ]
            ]
          ]
        }
        assert.equal(false, GSV.isMultiPolygon(invalidMultiPolygon))
      })

      it('must have a member with the name "coordinates"', () => {
        const invalidMultiPolygon = {
          "type": "MultiPolygon",
          "coordinate": [
            [
              [
                [102.0, 2.0],
                [103.0, 2.0],
                [103.0, 3.0],
                [102.0, 3.0],
                [102.0, 2.0]
              ]
            ],
            [
              [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0]
              ],
              [
                [100.2, 0.2],
                [100.8, 0.2],
                [100.8, 0.8],
                [100.2, 0.8],
                [100.2, 0.2]
              ]
            ]
          ]
        }

        assert.equal(false, GSV.isMultiPolygon(invalidMultiPolygon))
      })

      describe("type coordinates", () => {
        it('must be an array of Polygon coordinate arrays', () => {

          const invalidMultiPolygon = {
            "type": "MultiPolygon",
            "coordinates": [
              [
                [
                  [102.0, 2.0],
                  [103.0, 2.0],
                  [103.0, 3.0],
                  [102.0, 3.0],
                  [102.0, 2.0]
                ]
              ],
              [
                [
                  [100.0, 0.0],
                  [101.0],
                  [101.0, 1.0],
                  [100.0, 1.0],
                  [100.0, 0.0]
                ],
                [
                  [100.2, 0.2],
                  [100.8, 0.2],
                  [100.8, 0.8],
                  [100.2, 0.8],
                  [100.2, 0.2]
                ]
              ]
            ]
          }

          assert.equal(false, GSV.isMultiPolygon(invalidMultiPolygon))
        })
      })
    })

    describe('Geometry Collection', () => {

      it('must be a valid Geometry Collection Object', () => {
        const validGeoCollection = {
          "type": "GeometryCollection",
          "geometries": [{
            "type": "Point",
            "coordinates": [100.0, 0.0]
          }, {
            "type": "LineString",
            "coordinates": [
              [101.0, 0.0],
              [102.0, 1.0]
            ]
          }]
        }
        assert(GSV.isGeometryCollection(validGeoCollection))
      })

      it('member type must be "GeometryCollection"', () => {
        const invalidGeoCollection = {
          "type": "geometryCollection",
          "geometries": [{
            "type": "Point",
            "coordinates": [100.0, 0.0]
          }, {
            "type": "LineString",
            "coordinates": [
              [101.0, 0.0],
              [102.0, 1.0]
            ]
          }]
        }
        assert.equal(false, GSV.isGeometryCollection(invalidGeoCollection))
      })

      it('must have a member with the name "geometries"', () => {
        const invalidGeoCollection = {
          "type": "GeometryCollection",
          "geometrie": [{
            "type": "Point",
            "coordinates": [100.0, 0.0]
          }, {
            "type": "LineString",
            "coordinates": [
              [101.0, 0.0],
              [102.0, 1.0]
            ]
          }]
        }
        assert.equal(false, GSV.isGeometryCollection(invalidGeoCollection))
      })

      describe('geometries', () => {
        it('must be an array of GeoJSON geometry object', () => {

          const invalidGeoCollection = {
            "type": "GeometryCollection",
            "geometries": [{
              "type": "Point",
              "coordinates": [100.0, 0.0]
            }, {
              "type": "LineString",
              "coordinates": [
                [101.0],
                [102.0, 1.0]
              ]
            }]
          }

          assert.equal(false, GSV.isGeometryCollection(invalidGeoCollection))
        })
      })
    })
  })

  describe('Feature Objects', () => {
    it('must be a valid Feature Object', () => {
      const validFeature = {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [102.0, 0.0],
            [103.0, 1.0],
            [104.0, 0.0],
            [105.0, 1.0]
          ]
        },
        "properties": {
          "prop0": "value0",
          "prop1": 0.0
        }
      }
      assert(GSV.isFeature(validFeature))
    })

    it('member type must be "Feature"', () => {
      const invalidFeature = {
        "type": "feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [102.0, 0.0],
            [103.0, 1.0],
            [104.0, 0.0],
            [105.0, 1.0]
          ]
        },
        "properties": {
          "prop0": "value0",
          "prop1": 0.0
        }
      }
      assert.equal(false, GSV.isFeature(invalidFeature))
    })

    it('must have a member with the name "geometry"', () => {
      const invalidFeature = {
        "type": "Feature",
        "geometr": {
          "type": "LineString",
          "coordinates": [
            [102.0, 0.0],
            [103.0, 1.0],
            [104.0, 0.0],
            [105.0, 1.0]
          ]
        },
        "properties": {
          "prop0": "value0",
          "prop1": 0.0
        }
      }
      assert.equal(false, GSV.isFeature(invalidFeature))
    })

    describe('geometry member', () => {
      it('must be a geometry object or a JSON null value', () => {
        const invalidFeature = {
          "type": "Feature",
          "geometr": {
            "type": "LineString",
            "coordinates": [
              [102.0],
              [103.0, 1.0],
              [104.0, 0.0],
              [105.0, 1.0]
            ]
          },
          "properties": {
            "prop0": "value0",
            "prop1": 0.0
          }
        }
        assert.equal(false, GSV.isFeature(invalidFeature))
      })
    })

    it('must have a member "properties"', () => {
      const invalidFeature = {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [102.0, 0.0],
            [103.0, 1.0],
            [104.0, 0.0],
            [105.0, 1.0]
          ]
        },
        "propertie": {
          "prop0": "value0",
          "prop1": 0.0
        }
      }
      assert.equal(false, GSV.isFeature(invalidFeature))
    })
  })

  describe('Feature Collection Objects', () => {
    it('must be a valid Feature Collection Object', () => {
      const validFeatureCollection = {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [102.0, 0.5]
          },
          "properties": {
            "prop0": "value0"
          }
        }, {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [102.0, 0.0],
              [103.0, 1.0],
              [104.0, 0.0],
              [105.0, 1.0]
            ]
          },
          "properties": {
            "prop0": "value0",
            "prop1": 0.0
          }
        }, {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0]
              ]
            ]
          },
          "properties": {
            "prop0": "value0",
            "prop1": {
              "this": "that"
            }
          }
        }]
      }
      assert(GSV.isFeatureCollection(validFeatureCollection))
    })

    it('member type must be "FeatureCollection"', () => {

      const invalidFeatureCollection = {
        "type": "featureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [102.0, 0.5]
          },
          "properties": {
            "prop0": "value0"
          }
        }, {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [102.0, 0.0],
              [103.0, 1.0],
              [104.0, 0.0],
              [105.0, 1.0]
            ]
          },
          "properties": {
            "prop0": "value0",
            "prop1": 0.0
          }
        }, {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0]
              ]
            ]
          },
          "properties": {
            "prop0": "value0",
            "prop1": {
              "this": "that"
            }
          }
        }]
      }
      assert.equal(false, GSV.isFeatureCollection(invalidFeatureCollection))
    })

    it('must have a member with the name "features"', () => {
      const invalidFeatureCollection = {
        "type": "FeatureCollection",
        "feature": [{
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [102.0, 0.5]
          },
          "properties": {
            "prop0": "value0"
          }
        }, {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [102.0, 0.0],
              [103.0, 1.0],
              [104.0, 0.0],
              [105.0, 1.0]
            ]
          },
          "properties": {
            "prop0": "value0",
            "prop1": 0.0
          }
        }, {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0]
              ]
            ]
          },
          "properties": {
            "prop0": "value0",
            "prop1": {
              "this": "that"
            }
          }
        }]
      }
      assert.equal(false, GSV.isFeatureCollection(invalidFeatureCollection))
    })

    describe('member features', () => {
      it('must have an array of feature objects', () => {
        const invalidFeatureCollection = {
          "type": "FeatureCollection",
          "features": [{
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [102.0, 0.5]
            },
            "properties": {
              "prop0": "value0"
            }
          }, {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [102.0, 0.0],
                [103.0, 1.0],
                [0.0],
                [105.0, 1.0]
              ]
            },
            "properties": {
              "prop0": "value0",
              "prop1": 0.0
            }
          }, {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [100.0, 0.0],
                  [101.0, 0.0],
                  [101.0, 1.0],
                  [100.0, 1.0],
                  [100.0, 0.0]
                ]
              ]
            },
            "properties": {
              "prop0": "value0",
              "prop1": {
                "this": "that"
              }
            }
          }]
        }
        assert.equal(false, GSV.isFeatureCollection(invalidFeatureCollection))
      })
    })
  })
})

describe('Bounding Boxes', () => {
  it('must be a member named "bbox"', () => {

  })

  it('bbox member must be a 2*n array', () => {

  })
})

describe('Custom Checks', () => {
  it("must only functions", () => {

  })

  it('must check on the described element', () => {
    GSV.define("Position", function (position) {
      errors = []
      if (position[0] < -180 || position[0] > 180) {
        errors.push("the x must be between -180 and 180")
      }
      if (position[1] < -90 || position[1] > 90) {
        errors.push("the y must be between -90 and 90")
      }
      return errors
    })

    gj = {
      type: "Point",
      coordinates: [-200, 3]
    }
    assert.equal(false, GSV.isPoint(gj))

  })
})
