import React from "react";
import ProfileSettings from "@/components/ProfileSettings";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
const page = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return <ProfileSettings userId={user.id} />;
};

export default page;
