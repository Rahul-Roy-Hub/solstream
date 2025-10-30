import mongoose from "mongoose";
const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  cryptId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  buttons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Button" }],
});
const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export default Profile;
