WatchedMovies = new Mongo.Collection("watchedMovies");
ToWatchMovies = new Mongo.Collection("toWatchMovies");

if (Meteor.isClient) {
  Meteor.subscribe("watchedMovies");
  Meteor.subscribe("toWatchMovies");
  // This code only runs on the client
  Template.body.helpers({
    watchedMovies: function () {
      // Show newest tasks first
      return WatchedMovies.find({}, {sort: {createdAt: -1}});
    },
    toWatchMovies: function () {
      return ToWatchMovies.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-wmovie": function (event) {
      // This function is called when the new task form is submitted
      var title = event.target.title.value;

      Meteor.call("addWatchedMovie", title);
      // Clear form
      event.target.title.value = "";
      // Prevent default form submit
      return false;
    },
    "submit .new-tmovie": function (event) {
      // This function is called when the new task form is submitted
      var title = event.target.title.value;

      Meteor.call("addToWatchMovie", title);
      // Clear form
      event.target.title.value = "";
      // Prevent default form submit
      return false;
    }
  });


  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}


Meteor.methods({
  addToWatchMovie: function (title) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    ToWatchMovies.insert({
      title: title,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  addWatchedMovie: function (title) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    WatchedMovies.insert({
      title: title,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  }
});

if (Meteor.isServer) {
  Meteor.publish("watchedMovies", function () {
    return WatchedMovies.find();
  });

  Meteor.publish("toWatchMovies", function () {
    return ToWatchMovies.find();
  });
}
