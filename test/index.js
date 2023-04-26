"use strict";

var test    = require("tape");
var request = require("supertest");
var app     = require("../server");

test("Test POST /api/create", function(t) {
    var newShop = { 
        name:      "The Cracked Mug", 
        address:   "107 S Mary Ave", 
        latitude:  37.3821935, 
        longitude: -122.0454545 };
    request(app)
        .post("/api/create")
        .send( newShop )
        .expect(200)
        .end(function(err, res) {
            t.error( err, "No error" );
            t.same( res.body.name,      newShop.name );
            t.same( res.body.address,   newShop.address );
            t.same( res.body.latitude,  newShop.latitude );
            t.same( res.body.longitude, newShop.longitude );
            t.end();
        });
});

test("Test GET /api/read", function(t) {
    request(app)
        .get("/api/read")
        .query({"id":33})
        .expect(200)
        .end(function(err, res) {
            t.error( err, "No error" );
            t.same( res.body.id, 33, "Read coffeehouse id" );
            t.same( res.body.name, "Blue Bottle Coffee", "Read coffeehouse name" );
            t.end();
        });
});

test("Test PUT /api/update", function(t) {
    var newShop = {
        id:        33,
        name:      "The Dusty Cup",
        address:   "2805 Sacramento St",
        latitude:  37.7891594,
        longitude: -122.43930169 };
    request(app)
        .put("/api/update")
        .send( newShop )
        .expect(200)
        .end(function(err, res) {
            t.same(res.body.n,1,"entries");
            t.same(res.body.ok,1,"upsert status");
            t.error( err, "No error" );
            t.end();
        });
});

test("Test DELETE /api/delete", function(t) {
    request(app)
        .delete("/api/delete")
        .send( {id:33} )
        .expect(200)
        .end(function(err, res) {
            t.error( err, "No error" );
            t.end();
        });
});

test("Test GET /api/nearest", function(t) {
    request(app)
        .get("/api/nearest")
        .send( {address: "107 S Mary Ave, Sunnyvale, CA"} )
        .expect(200)
        .end(function(err, res) {
            t.error( err, "No error" );
            console.log(res.body);
            t.same(res.body.name, "The Cracked Mug", "Found my fake coffee shop");
            t.end();
        });
});
