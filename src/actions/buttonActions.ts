"use server";
import connectToDB from "@/database";
import Button from "@/models/buttonModel";
import { ButtonType } from "@/types/button";
export async function getUserButtons(userId: string) {
  try {
    await connectToDB();
    const buttons: ButtonType[] = await Button.find({ userId }).sort({
      createdAt: -1,
    });
    if (!buttons || buttons.length === 0) {
      return {
        success: true,
        buttons: [],
      };
    }
    return {
      success: true,
      buttons: JSON.parse(JSON.stringify(buttons)) as ButtonType[],
    };
  } catch (err) {
    console.error("Error fetching buttons:", err);
    return {
      success: false,
      error: "Failed to fetch buttons",
      details: err instanceof Error ? err.message : err,
    };
  }
}

export async function createButton(data: {
  name: string;
  description: string;
  amountUsd: number;
  chainId: string[];
  merchantAddress: string;
  userId: string;
}) {
  try {
    await connectToDB();

    const newButton = new Button({
      name: data.name,
      description: data.description,
      amountUsd: data.amountUsd,
      chainId: data.chainId,
      merchantAddress: data.merchantAddress,
      userId: data.userId,
    });

    await newButton.save();
    console.log("New button created:", newButton);

    return {
      success: true,
      message: "Button created successfully",
    };
  } catch (err) {
    console.error("Error creating button:", err);
    return {
      success: false,
      message: "Failed to create button",
      details: err instanceof Error ? err.message : err,
    };
  }
}

export async function getButtonById(buttonId: string) {
  try {
    await connectToDB();
    const button = await Button.findById(buttonId).populate("transactions");

    if (!button) {
      return {
        success: false,
        message: "Invalid button ID",
      };
    }

    return {
      success: true,
      button: JSON.parse(JSON.stringify(button)),
      message: "Button fetched successfully",
    };
  } catch (err) {
    console.error("Error fetching button by ID:", err);
    return {
      success: false,
      message: "Button ID is invalid or something went wrong",
      details: err instanceof Error ? err.message : err,
    };
  }
}
