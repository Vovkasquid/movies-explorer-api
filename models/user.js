const mongoose = require("mongoose");
const validatorModule = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: "Александр Петров",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validatorModule.isEmail(email),
      message: (props) => `${props.value} не является электронной почтой!`,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, { versionKey: false });

module.exports = mongoose.model("user", userSchema);
