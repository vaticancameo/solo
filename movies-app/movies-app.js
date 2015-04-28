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
    "submit .new-movie": function (event) {
      var where = $('input[name="where"]:checked').val();
      var title = event.target.title.value;
      if (where === 'watched') {
        Meteor.call("addMovie", title, where);
      } else {
        Meteor.call("addMovie", title, where);
      }
      // Clear form
      event.target.title.value = "";
      // Prevent default form submit
      return false;
    },

    "click .watched .delete": function () {
      Meteor.call('deleteMovie', this._id, 'watched');
    },

    "click .toWatch .delete": function () {
      Meteor.call('deleteMovie', this._id, 'toWatch');
    }

  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({

  deleteMovie: function (movieId, where) {
    if (where === "watched") {
      WatchedMovies.remove(movieId);
    } else {
      ToWatchMovies.remove(movieId);
    }
  },

  addMovie: function (title, where) {
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
        var data = JSON.parse(result.content);
        image = data.Poster === 'N/A' ? 'image-not-available.jpg' : data.Poster; 
        if (where === 'watched') {
          WatchedMovies.insert({
            title: title,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            image: image
          });
        } else {
          ToWatchMovies.insert({
            title: title,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            image: image
          });
        }
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
