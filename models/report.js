const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportSchema = new Schema({
  by: {
    type: String,
    required: true,
  },
  against: {
    type: String,
    required: true,
  },
  for: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: "No details provided",
  },
  resolved: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Report", reportSchema);
