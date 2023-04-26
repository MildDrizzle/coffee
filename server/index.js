"use strict";

var mongo       = require("mongodb");
var MongoClient = mongo.MongoClient;
var url         = "mongodb://localhost:27017/test";
var monk        = require("monk");
var db          = monk(url);
var request     = require("request");
var GoogleMapsAPI = require("googlemaps");
var express     = require("express");
var bodyParser  = require('body-parser');

var app = express();
app.use(bodyParser.json()); // for parsing application/json

app.use(function(req, res, next){
    req.db = db;
    next();
});

var addLocationTo = function( record ) {
    record.location = {
        type: "Point",
        coordinates: [ record.longitude, record.latitude ]
    };
    return record;
};

app.post("/api/create", function( req, res ) {
    var db = req.db;
    var collection = db.get("coffee");
    collection.find({}, {sort:{id:-1},limit:1}).then((doc) => {
        var result = doc[0];
        var record = {
            id        : result.id + 1,
            name      : req.body.name,
            address   : req.body.address,
            latitude  : parseFloat(req.body.latitude),
            longitude : parseFloat(req.body.longitude) };
        record = addLocationTo( record );
        collection.insert( record ).then((doc) => {
            res.status(200).json( record );
        }).catch((err) => {
            res.status(500).json({});
        });
    }).catch((err) => {
        res.status(500).json({});
    });
});

app.get("/api/read", function( req, res ) {
    var id = parseInt(req.query.id);
    var db = req.db;
    var collection = db.get("coffee");
    collection.find({id:id}, {limit:1}).then((doc) => {
        var result = doc[0];
        res.status(200).json(result);
    }).catch((err) => {
        res.status(404).json({});
    });
});

app.put("/api/update", function (req,res) {
    var id = parseInt(req.body.id);
    var db = req.db;
    var record = {
        id        : id,
        name      : req.body.name,
        address   : req.body.address,
        latitude  : parseFloat(req.body.latitude),
        longitude : parseFloat(req.body.longitude) 
    };
    var collection = db.get("coffee");
    const filter = { id: '33' };
    const update = { $set: record };
    collection.update(filter, update, {upsert: true})
      .then((result) => {
        db.close();
        res.status(200).json(result)
      })
      .catch((err) => {
        db.close();
        res.status(404).json({});
      });
})


app.delete("/api/delete", function( req, res ) {
    var id = parseInt(req.body.id);
    var db = req.db;
    var collection = db.get("coffee");
    collection.find({id:id}).then((doc) => { 
        var result = doc[0];
        collection.remove( result ).then((doc) => {
            res.status(200).json({});
        }).catch(() => {
            res.status(404).json({});
        });
    }).catch((err) => {
        res.status(404).json({});
    });
});

app.get("/api/nearest", function( req, res ) {
    var address = req.body.address;
    var key = "AIzaSyAYkoES0kWQfxii3a7GL_tJa0Rn7h-DRf0";
    var form = { form: { address: address, key: key } };
    var publicConfig = {
        key: key,
        stagger_time:       1000, // for elevationPath
        encode_polylines:   false,
        secure:             true, // use https
    };
    var gmAPI = new GoogleMapsAPI(publicConfig);
    // geocode API
    var geocodeParams = {
        address: address,
    };
    gmAPI.geocode(geocodeParams, function(err, result) {
        // parse the geocoded data from Google
        var result = result.results[0];
        var lng = result.geometry.location.lng;
        var lat = result.geometry.location.lat;
        // feed lng/lat into mongodb query
        MongoClient.connect( url, function(err, mdb) {
            if (err) { console.log(err); }
            var collection = mdb.collection("coffee");
            var query = { location: { 
                            $nearSphere: { 
                                $geometry: { 
                                    type: "Point", 
                                    coordinates: [ lng, lat ] 
                                },
                            } 
                        } 
                    };
            collection.find( query ).limit(1).toArray(function(err,doc) {
                if (err) {
                    res.status(404).json({});
                }
                else {
                    res.status(200).json(doc[0]);
                    mdb.close();
                }
            });
        });
    });
});


module.exports = app;
