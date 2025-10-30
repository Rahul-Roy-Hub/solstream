import { NextRequest, NextResponse } from "next/server";
import Button from "@/models/buttonModel";
import Profile from "@/models/profileModel";
import Transaction from "@/models/transactionModel";
import { sendTransactionMail } from "@/lib/mail";
export async function POST(req: NextRequest) {
  const { buttonId, cryptoId, amountUsd, chainId } = await req.json();
  try {
    const button = await Button.findById(buttonId);
    if (!button) {
      return NextResponse.json({ error: "Button not found" }, { status: 404 });
    }
    const user = await Profile.find({ cryptId: cryptoId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log(user);
    const transaction = await Transaction.create({
      from: user[0]?.email,
      to: button.merchantAddress,
      signature: "",
      chainId: chainId || button.chainId[0], // Use provided chainId or first chain from button
      buttonId: button._id,
      status: "pending",
      amountUsd: amountUsd,
    });
    button.transactions.push(transaction._id);
    await button.save();
    console.log("Transaction created:", transaction);
    await sendTransactionMail(user[0]?.email, amountUsd, transaction._id);
    return NextResponse.json({
      transactionId: transaction._id,
      message: "Transaction created",
    });
  } catch (err) {
    console.error("Error in create-transaction route:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
