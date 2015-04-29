WatchedMovies = new Mongo.Collection("watchedMovies");
ToWatchMovies = new Mongo.Collection("toWatchMovies");

if (Meteor.isClient) {
  Meteor.subscribe("watchedMovies");
  Meteor.subscribe("toWatchMovies");
  
  Session.setDefault('oldest-release' ,false);
  Session.setDefault('newest-release' ,false);
  Session.setDefault('oldest-added' ,false);
  Session.setDefault('newest-added' ,false);
  Session.setDefault('default' ,true);

  Session.setDefault('notFound', false);

  Template.body.helpers({
    watchedMovies: function () {
      if (Session.get("newest-release")) {
        return WatchedMovies.find({}, {sort: {released: -1}});
      } else if (Session.get("oldest-release")) {
        return WatchedMovies.find({}, {sort: {released: 1}});
      } else if (Session.get("oldest-added")) {
        return WatchedMovies.find({}, {sort: {createdAt: 1}});
      } else {
        return WatchedMovies.find({}, {sort: {createdAt: -1}});
      }
    },

    toWatchMovies: function () {
      if (Session.get("newest-release")) {
        return ToWatchMovies.find({}, {sort: {released: -1}});
      } else if (Session.get("oldest-release")) {
        return ToWatchMovies.find({}, {sort: {released: 1}});
      } else if (Session.get("oldest-added")) {
        return ToWatchMovies.find({}, {sort: {createdAt: 1}});
      } else {
        return ToWatchMovies.find({}, {sort: {createdAt: -1}});
      }
    },

    notFound: function() {
      return Session.get('notFound');
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
    },

    "change select" : function (event) {
      Session.set('newest-release', false);
      Session.set('oldest-release', false);
      Session.set('newest-added', false);
      Session.set('oldest-added', false);
      Session.set('default', false);
      Session.set(event.target.value, true);
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
    // if (WatchedMovies.findOne({title: title, owner: Meteor.userId()}) !== null) {
    //   console.log('movie already in list!')
    //   return;
    // }
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
        Session.set('notFound', true);
        console.log('movie not found'); 
        setTimeout(function(){
          Session.set('notFound', false);
        }, 2000);       
      } else {
        var data = JSON.parse(result.content);
        image = data.Poster === 'N/A' ? 'image-not-available.jpg' : data.Poster; 
        if (where === 'watched') {
          WatchedMovies.insert({
            title: title,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            image: image,
            year: data.Year,
            released: data.Released
          });
        } else {
          ToWatchMovies.insert({
            title: title,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            image: image,
            year: data.Year,
            released: data.Released
          });
        }
      }
    });
  },
});

if (Meteor.isServer) {

  Meteor.publish("watchedMovies", function () {
    return WatchedMovies.find({owner: this.userId});
  });

  Meteor.publish("toWatchMovies", function () {
    return ToWatchMovies.find({owner: this.userId});
  });


}
