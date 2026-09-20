"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Avatar from "../../../components/Avatar";
import { createClient } from "../../../lib/supabase/client";

type PublicProfile = {
  username: string;
  major: string | null;
  year: string | null;
  bio: string | null;
  hair: string;
  shirt: string;
  skin_tone: string;
  hairstyle: string;
};

export default function PublicProfilePage() {
  const params = useParams();
  const supabase = createClient();

  const [profile, setProfile] =
    useState<PublicProfile | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const id = params.id;

      if (!id || Array.isArray(id)) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "username, major, year, bio, hair, shirt, skin_tone, hairstyle"
        )
        .eq("id", id)
        .single();

      if (error) {
        console.log("Could not load profile:", error);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [params.id]);

  if (loading) {
    return null;
  }

  if (!profile) {
    return (
      <main className="min-h-screen p-10">
        <p className="font-semibold text-[#806b67]">
          Profile not found ♡
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[32px] border-2 border-[#f3d8dd] bg-[#fffaf7] p-8 shadow-md">

          <div className="flex flex-col items-center">
            <div className="origin-top scale-75">
              <Avatar
                hair={profile.hair ?? "Brown"}
                shirt={profile.shirt ?? "Blue"}
                skinTone={profile.skin_tone ?? "Light"}
                hairstyle={profile.hairstyle ?? "Short"}
              />
            </div>

            <h1 className="mt-2 text-3xl font-black text-[#6f5c56]">
              {profile.username}
            </h1>

            <p className="mt-1 text-sm font-semibold text-[#e58e9d]">
              ♡ PINBOARD profile
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-[#e4f2fb] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#7896a8]">
                Major
              </p>

              <p className="mt-1 font-semibold text-[#6f5c56]">
                {profile.major || "Not added yet"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#e8f5e9] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#78947f]">
                Year
              </p>

              <p className="mt-1 font-semibold text-[#6f5c56]">
                {profile.year || "Not added yet"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#fff0bd] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#a58a4d]">
                About
              </p>

              <p className="mt-1 whitespace-pre-wrap text-[#6f5c56]">
                {profile.bio || "No bio yet ♡"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}