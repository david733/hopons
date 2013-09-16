
Riders = new Meteor.Collection("riders");
Drivers = new Meteor.Collection("drivers");

if (Meteor.isClient) {
  Template.page.greeting = function () {
    return "some event held at some place at some time hosted by some person";
  };
  
  Template.page.riders = function () {
    // return all the riders without a driver
    return Riders.find( {driver: {$exists: false}} );
  };

  Template.page.drivers = function () {
    // return all the drivers
    return Drivers.find();
  };

  Template.page.events({
    'click button.add-rider' : function () {
      Riders.insert({
        name: $("#newname").val(),
        email: $("#newemail").val(),
        location: $("#newlocation").val()
      });
    },
    'click button.add-driver' : function () {
      Drivers.insert({
        name: $("#newname").val(),
        email: $("#newemail").val(),
        location: $("#newlocation").val(),
        seats: $("#newseats").val()
      });
    }
  });

  Template.rider.drivers = function () {
    // generate a list of drivers that this rider can transfer to
    // should return every driver except the one she's currently with
    var currentDriver = Riders.findOne(this._id).driver;
    return currentDriver ? Drivers.find( {_id: {$ne: currentDriver}} ) : Drivers.find();
  };

  Template.rider.hasdriver = function() {
    return Riders.findOne(this._id).driver;
  };
  
  Template.rider.events({
    'click a.move-rider' : function () { Session.set("current-rider-focus", this._id); }, // keep tab on which rider is being assigned
    'click a.driver-select' : function () { // assign a rider to a driver
      Riders.update( 
        Session.get("current-rider-focus"), 
        {$set: {driver: this._id}}
        );
    },
    'click a.driver-unselect' : function () { // moving rider back to "needs rides" column
      Riders.update( 
        Session.get("current-rider-focus"), 
        {$unset: {driver: ""}}
        );
    },
    'click a.remove-rider' : function () { Riders.remove(this._id); }
  });

  Template.driver.riders = function () {
    // return all the riders currently with this driver
    return Riders.find( {driver: this._id} );
  };

  Template.driver.events({
    // 'click button.add-rider-to-driver' : function () { Riders.insert({ name: $("#newname").val(), email: $("#newemail").val(), location: $("#newlocation").val(), driver: this._id }); },
    'click a.remove-driver' : function () { 
      // shift all the riders back to the "need rides" column
      var myRiders = Riders.find( { driver:this._id } );
      myRiders.forEach( function(rider) {
        Riders.update( rider._id, {$unset: {driver: ""}} ); // can only update records one-by-one, with _id, from client side...
      });
      // then remove the driver
      Drivers.remove( this._id );
    }
  });
}

// On server startup, create some riders if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    /*if (Riders.find().count() === 0) {
      Riders.insert({name: "Eugene", location: "brookline"});
      Riders.insert({name: "David", location: "cambridge"});
    }*/
  });
}
