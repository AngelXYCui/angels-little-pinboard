"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
  async function loadProfile() {
    // Find out who is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    // Find this user's profile
    const { data, error } = await supabase
      .from("profiles")
      .select("username, major, year, bio")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    // Put the database information into our React state
    setUsername(data.username ?? "");
    setMajor(data.major ?? "");
    setYear(data.year ?? "");
    setBio(data.bio ?? "");
  }

  loadProfile();
}, []);

async function handleSave() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be logged in first.");
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      username: username,
      major: major,
      year: year,
      bio: bio,
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Profile saved!");
}

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">Create Your Profile</h1>

      <div className="mt-10 flex max-w-md flex-col gap-6">

        <div>
          <label className="mb-2 block font-bold">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter a username"
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-bold">
            Major
          </label>

          <input
            type="text"
            value={major}
            onChange={(event) => setMajor(event.target.value)}
            placeholder="Example: Electrical Engineering"
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-bold">
            Year
          </label>

          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-full rounded border p-3"
          >
            <option value="">Select your year</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Graduate">Graduate</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-bold">
            Bio
          </label>

          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Tell people a little about yourself..."
            className="h-32 w-full rounded border p-3"
          />
        </div>

        <button
          onClick={handleSave}
          className="rounded bg-black p-3 font-bold text-white hover:bg-gray-800"
        >
          Save Profile
        </button>

      </div>
    </main>
  );
}