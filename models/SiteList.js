var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new Article object
// This is similar to a Sequelize model
var ListSchema = new Schema({
  // `title` is required and of type String
  list: {
    type: Array,
    required: true
  }
});

// This creates our model from the above schema, using mongoose's model method
var SiteList = mongoose.model("SiteList", ListSchema);

// Export the Article model
module.exports = SiteList;
