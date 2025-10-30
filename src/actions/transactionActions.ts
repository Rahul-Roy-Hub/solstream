/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import Profile from "@/models/profileModel";
import Transaction from "@/models/transactionModel";
import Button from "@/models/buttonModel";
import { sendMerchantMail } from "@/lib/mail";
interface Transaction {
  _id: string;
  from: string;
  to: string;
  amountUsd: number;
  status: "pending" | "success" | "failed";
  buttonId?: string;
  signature?: string;
  time: string;
}
export async function getUserTransactions(userId: string) {
  try {
    const profile = (await Profile.findById(userId).lean()) as {
      email: string;
    } | null;
    if (!profile) {
      return { success: false, transaction: null };
    }

    const transactions = await Transaction.find({ from: profile.email })
      .sort({ time: -1 })
      .lean();
    console.log(transactions);

    for (let i = 0; i < transactions.length; i++) {
      if (
        Date.now() - new Date(transactions[i].time).getTime() >
          10 * 60 * 1000 &&
        transactions[i].status === "pending"
      ) {
        await Transaction.updateOne(
          { _id: transactions[i]._id },
          { $set: { status: "failed" } }
        );
        transactions[i].status = "failed";
      }
    }

    if (
      transactions.length > 0 &&
      Date.now() - new Date(transactions[0].time).getTime() < 10 * 60 * 1000
    ) {
      return {
        success: true,
        transaction: JSON.parse(JSON.stringify(transactions[0])),
      };
    }

    return {
      success: false,
      transaction: null,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to fetch transactions",
      details: err instanceof Error ? err.message : err,
    };
  }
}

export async function getTransactionById(transactionId: string) {
  try {
    const transaction = await Transaction.findById(transactionId).populate(
      "buttonId"
    );
    if (!transaction) {
      return { success: false, transaction: null };
    }
    console.log(transaction);
    if (
      transaction.time &&
      Date.now() - new Date(transaction.time).getTime() > 10 * 60 * 1000 &&
      transaction.status === "pending"
    ) {
      await Transaction.updateOne(
        { _id: transaction._id },
        { $set: { status: "failed" } }
      );
      transaction.status = "failed";
    }
    return {
      success: true,
      transaction: JSON.parse(JSON.stringify(transaction)),
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to fetch transaction",
      details: err instanceof Error ? err.message : err,
    };
  }
}

export async function updateTransactionStatus(
  transactionId: string,
  status: string,
  signature?: string,
  chainId?: string
) {
  try {
    const updateData: any = { status };
    if (!signature) {
      return { success: false };
    }
    if (signature) {
      updateData.signature = signature;
    }

    await Transaction.updateOne({ _id: transactionId }, { $set: updateData });
    const transaction = await Transaction.findById(transactionId);
    const button = await Button.findById(transaction.buttonId);
    const merchant = await Profile.findOne({ userId: button.userId });
    
    if (!merchant) {
      console.error("Merchant not found for transaction:", transactionId);
      return { success: false, error: "Merchant not found" };
    }
    
    // Use the chainId from parameter or from transaction
    const txChainId = chainId || transaction.chainId;
    
    console.log("Sending merchant email for transaction:", {
      transactionId,
      merchantEmail: merchant.email,
      signature,
      chainId: txChainId,
    });
    
    await sendMerchantMail(
      merchant.email,
      transaction.from,
      transaction.amountUsd,
      signature,
      txChainId
    );

    return { success: true };
  } catch (err) {
    console.error("Error in updateTransactionStatus:", err);
    return {
      success: false,
      error: "Failed to update transaction status",
      details: err instanceof Error ? err.message : err,
    };
  }
}

export async function fetchUserTransactions(userId: string) {
  try {
    const profile = await Profile.findOne({ userId: userId });
    if (!profile) {
      return { success: false, error: "Profile not found", transactions: [] };
    }
    const transactions = await Transaction.find({ from: profile.email }).sort({
      time: -1,
    });
    for (let i = 0; i < transactions.length; i++) {
      if (
        Date.now() - new Date(transactions[i].time).getTime() >
          10 * 60 * 1000 &&
        transactions[i].status === "pending"
      ) {
        await Transaction.updateOne(
          { _id: transactions[i]._id },
          { $set: { status: "failed" } }
        );
        transactions[i].status = "failed";
      }
    }
    return {
      success: true,
      transactions: JSON.parse(JSON.stringify(transactions)) as Transaction[],
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to fetch transactions",
      details: err instanceof Error ? err.message : err,
    };
  }
}
