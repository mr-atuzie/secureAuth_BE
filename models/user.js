const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add a name."] },
    email: {
      type: String,
      required: [true, "Please add a email."],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid emaial",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Password must be up to 6 characters"],
    },
    role: {
      type: String,
      required: [true],
      default: "customer",
      enum: ["customer", "admin"],
    },

    phone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

//Encrypt password before saving to DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
