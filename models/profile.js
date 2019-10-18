const mongoose = require("mongoose");
const Scheama = mongoose.Schema;

const ProfileSchema = new Scheam({
  user: {
    type: Scheama.Types.ObjectIdref,
    ref: "User"
  },
  handle: {
    type: String,
    required: true,
    max: 40
  },
  company: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },
  phone: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Profile", ProfileSchema);
