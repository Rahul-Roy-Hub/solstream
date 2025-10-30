"use server";
import connectToDB from "@/database";
import Profile from "@/models/profileModel";

export async function fetchProfileAction(id: string) {
  try {
    await connectToDB();
    const profile = await Profile.findOne({ userId: id });

    if (!profile) {
      return {
        success: false,
        error: "Profile not found",
      };
    }

    return {
      success: true,
      profile,
    };
  } catch (err) {
    console.error("Error fetching profile:", err);
    return {
      success: false,
      error: "Failed to fetch profile",
      details: err instanceof Error ? err.message : err,
    };
  }
}

export async function createProfileAction(
  userId: string,
  email: string,
  cryptId: string,
  username: string
) {
  try {
    await connectToDB();
    const newProfile = new Profile({ userId, email, cryptId, username });
    await newProfile.save();

    return {
      success: true,
      message: "Profile created successfully",
      profile: newProfile,
    };
  } catch (err) {
    console.error("Error creating profile:", err);
    return {
      success: false,
      error: "Failed to create profile",
      details: err instanceof Error ? err.message : err,
    };
  }
}

export async function editProfileAction(
  id: string,
  data: { username?: string; cryptId?: string }
) {
  try {
    await connectToDB();

    const profile = await Profile.findOneAndUpdate(
      { userId: id },
      { $set: data },
      { new: true }
    );

    if (!profile) {
      return {
        success: false,
        error: "Profile not found",
      };
    }

    return {
      success: true,
      message: "Profile updated successfully",
      profile,
    };
  } catch (err) {
    console.error("Error editing profile:", err);
    return {
      success: false,
      error: "Failed to edit profile",
      details: err instanceof Error ? err.message : err,
    };
  }
}
