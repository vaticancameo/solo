WatchedMovies = new Mongo.Collection("watchedMovies");
ToWatchMovies = new Mongo.Collection("toWatchMovies");

if (Meteor.isClient) {
  Meteor.subscribe("watchedMovies");
  Meteor.subscribe("toWatchMovies");

  Template.body.helpers({
    watchedMovies: function () {
      return WatchedMovies.find({}, {sort: {createdAt: -1}});
    },
    toWatchMovies: function () {
      return ToWatchMovies.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.body.events({
    "submit .new-wmovie": function (event) {
      var title = event.target.title.value;
      Meteor.call("addWatchedMovie", title);
      // Clear form
      event.target.title.value = "";
      // Prevent default form submit
      return false;
    },
    "submit .new-tmovie": function (event) {
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

  addWatchedMovie: function (title) {
    var t = title.split(' ').join('+');
    var url = 'http://www.omdbapi.com/?t='+t+'&r=json';
    var image = '';

    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    HTTP.get(url, function (error, result) {
      if (error) {
        console.log(error);
      } else if (JSON.parse(result.content).Error) {
        //display movie not found
        console.log('movie not found');        
      } else {
        image = JSON.parse(result.content).Poster;

        WatchedMovies.insert({
          title: title,
          createdAt: new Date(),
          owner: Meteor.userId(),
          username: Meteor.user().username,
          image: image
        });
      }
    });
  },

  addToWatchMovie: function (title) {
    var t = title.split(' ').join('+');
    var url = 'http://www.omdbapi.com/?t='+t+'&r=json';
    var image = '';

    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    HTTP.get(url, function (error, result) {
      if (error) {
        console.log(error);
      } else if (JSON.parse(result.content).Error) {
        //display movie not found
        console.log('movie not found');        
      } else {
        image = JSON.parse(result.content).Poster;

        ToWatchMovies.insert({
          title: title,
          createdAt: new Date(),
          owner: Meteor.userId(),
          username: Meteor.user().username,
          image: image
        });
      }
    });
  },
});

if (Meteor.isServer) {
  // WatchedMovies.allow({
  //   'insert': function (userId, doc) {
  //     return true;
  //   }
  // });

  Meteor.publish("watchedMovies", function () {
    return WatchedMovies.find({owner: this.userId});
  });

  Meteor.publish("toWatchMovies", function () {
    return ToWatchMovies.find({owner: this.userId});
  });


}
