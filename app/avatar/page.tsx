"use client";

import { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import { createClient } from "../../lib/supabase/client";

export default function AvatarCreator() {
  const supabase = createClient();
  
  const [hair, setHair] = useState("Brown");
  const [shirt, setShirt] = useState("Blue");

  useEffect(() => {
  async function loadAvatar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("hair, shirt")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setHair(data.hair ?? "Brown");
    setShirt(data.shirt ?? "Blue");
  }

  loadAvatar();
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
    .update({
      hair: hair,
      shirt: shirt,
    })
    .eq("id", user.id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Avatar saved!");
}

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">Create Your Avatar</h1>

      <div className="mt-10">
        <Avatar hair={hair} shirt={shirt} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Choose Hair</h2>

        {["Brown", "Black", "Blonde"].map((color) => (
          <button
            key={color}
            className="m-2 rounded bg-gray-200 p-3 text-black hover:bg-gray-300"
            onClick={() => setHair(color)}
          >
            {color}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Choose Shirt</h2>

        {["Blue", "Red", "Green"].map((color) => (
          <button
            key={color}
            className="m-2 rounded bg-gray-200 p-3 text-black hover:bg-gray-300"
            onClick={() => setShirt(color)}
          >
            {color}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-8 rounded bg-black p-3 font-bold text-white hover:bg-gray-800"
      >
        Save Avatar
      </button>

      <p className="mt-6">
        Hair: <strong>{hair}</strong> | Shirt: <strong>{shirt}</strong>
      </p>
    </main>
  );
}