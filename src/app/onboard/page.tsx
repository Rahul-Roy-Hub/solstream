import { fetchProfileAction } from "@/actions/userActions";
import OnBoard from "@/components/OnBoard";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import React from "react";

const OnBoardPage = async () => {
  //get the auth user from the clerk
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  //fetch profile info
  const res = await fetchProfileAction(user?.id);
  const profileInfo = res.success ? res.profile : null;

  if (profileInfo) {
    redirect("/");
  } else return <OnBoard />;
};

export default OnBoardPage;
