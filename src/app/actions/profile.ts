"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateDisplayName(formData: FormData) {
  const name = String(formData.get("display_name") ?? "").trim().slice(0, 40);
  if (!name) redirect("/profile?error=Display+name+cannot+be+empty");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("players").update({ display_name: name }).eq("profile_id", user.id);
  if (error) redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  redirect("/profile?saved=1");
}
