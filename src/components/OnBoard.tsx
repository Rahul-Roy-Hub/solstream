"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { createProfileAction } from "@/actions/userActions";
export default function OnBoard() {
  const { user } = useUser();
  const [cryptId, setCryptId] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("User not found");
      return;
    }
    setLoading(true);
    if (!cryptId || !username) {
      toast.error("Please fill all the fields");
      setLoading(false);
      return;
    }
    const res = await createProfileAction(
      user.id,
      user.emailAddresses[0].emailAddress,
      cryptId,
      username
    );
    if (res.success) {
      toast.success("Profile created successfully");
      redirect("/");
    } else {
      toast.error("Failed to create profile");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Onboard Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Crypt ID"
              value={cryptId}
              onChange={(e) => setCryptId(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
