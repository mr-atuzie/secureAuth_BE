const mongoose = require("mongoose");

const bondLottoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const BondLotto = mongoose.model("BondLotto", bondLottoSchema);
module.exports = BondLotto;
