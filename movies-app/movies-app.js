WatchedMovies = new Mongo.Collection("watchedMovies");
ToWatchMovies = new Mongo.Collection("toWatchMovies");

if (Meteor.isClient) {
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

      WatchedMovies.insert({
        title: title,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.title.value = "";

      // Prevent default form submit
      return false;
    },
    "submit .new-tmovie": function (event) {
      // This function is called when the new task form is submitted
      var title = event.target.title.value;

      ToWatchMovies.insert({
        title: title,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.title.value = "";

      // Prevent default form submit
      return false;
    }
  });

  // Template.movies.events({
  //   "click .toggle-checked": function (e) {
  //     // Set the checked property to the opposite of its current value
  //     toWatchMovies.update(this._id, {$set: {checked: ! this.checked}});
  //   },
  //   "click .delete": function (e) {
  //     toWatchMovies.remove(this._id);
  //   }
  // });
}
