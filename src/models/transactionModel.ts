import mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  signature: { type: String },
  chainId: { type: String, required: true }, // Add chain ID to track which blockchain
  time: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  buttonId: { type: mongoose.Schema.Types.ObjectId, ref: "Button" },
  amountUsd: { type: Number, required: true },
});
const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
export default Transaction;
