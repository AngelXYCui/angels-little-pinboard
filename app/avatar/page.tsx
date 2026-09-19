"use client";

import { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import { createClient } from "../../lib/supabase/client";

export default function AvatarCreator() {
  const supabase = createClient();
  
  const [hair, setHair] = useState("Brown");
  const [shirt, setShirt] = useState("Blue");
  const [skinTone, setSkinTone] = useState("Light");
  const [hairstyle, setHairstyle] = useState("Short");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadAvatar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
    setLoading(false);
    return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("hair, shirt, skin_tone, hairstyle")
      .eq("id", user.id)
      .single();

    if (error) {
    console.log(error);
    setLoading(false);
    return;
    }

    setHair(data.hair ?? "Brown");
    setShirt(data.shirt ?? "Blue");
    setSkinTone(data.skin_tone ?? "Light");
    setHairstyle(data.hairstyle ?? "Short");
    setLoading(false);
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
    hair,
    shirt,
    skin_tone: skinTone,
    hairstyle,
    })
    .eq("id", user.id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Avatar saved!");
}
if (loading) {
  return (
    <main className="min-h-screen p-10">
      <p className="font-semibold text-[#a18a82]">
        Loading your avatar... ♡
      </p>
    </main>
  );
}
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">Create Your Avatar</h1>

      <div className="mt-10">
        <Avatar
        hair={hair}
        shirt={shirt}
        skinTone={skinTone}
        hairstyle={hairstyle}
        />
      </div>

      <div className="mt-6">
  <h2 className="mb-3 font-bold text-[#806b67]">Hair Color</h2>

    <div className="flex flex-wrap gap-3">
        {["Brown", "Black", "Blonde"].map((color) => (
        <button
            key={color}
            type="button"
            onClick={() => setHair(color)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
            hair === color
                ? "border-[#f19aaa] bg-[#fff0f3] text-[#806b67]"
                : "border-[#eadbd6] bg-white text-[#806b67] hover:bg-[#fffaf7]"
            }`}
        >
            {color}
        </button>
        ))}
    </div>
    </div>

    <div className="mt-6">
        <h2 className="mb-3 font-bold text-[#806b67]">Shirt Color</h2>

        <div className="flex flex-wrap gap-3">
            {["Blue", "Red", "Green"].map((color) => (
            <button
                key={color}
                type="button"
                onClick={() => setShirt(color)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                shirt === color
                    ? "border-[#f19aaa] bg-[#fff0f3] text-[#806b67]"
                    : "border-[#eadbd6] bg-white text-[#806b67] hover:bg-[#fffaf7]"
                }`}
            >
                {color}
            </button>
            ))}
        </div>
        </div>

        <div className="mt-6">
        <h2 className="mb-3 font-bold text-[#806b67]">Skin Tone</h2>

        <div className="flex flex-wrap gap-3">
            {["Light", "Fair", "Medium", "Tan", "Deep", "Dark"].map((tone) => (
            <button
                key={tone}
                type="button"
                onClick={() => setSkinTone(tone)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                skinTone === tone
                    ? "border-[#f19aaa] bg-[#fff0f3]"
                    : "border-[#eadbd6] bg-white"
                }`}
            >
                {tone}
            </button>
            ))}
        </div>
        </div>

        <div className="mt-6">
  <h2 className="mb-3 font-bold text-[#806b67]">Hairstyle</h2>

    <div className="flex flex-wrap gap-3">
        {["Short", "Braids", "Long", "Ponytail", "Buns"].map((style) => (
        <button
            key={style}
            type="button"
            onClick={() => setHairstyle(style)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
            hairstyle === style
                ? "border-[#f19aaa] bg-[#fff0f3]"
                : "border-[#eadbd6] bg-white"
            }`}
        >
            {style}
        </button>
        ))}
    </div>
    </div>

      <button
        onClick={handleSave}
        className="mt-8 rounded-full border-2 border-[#f19aaa] bg-[#f3a1ad] px-7 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ee8f9f] hover:shadow-md active:translate-y-0"
        >
        Save Avatar ♡
      </button>

    </main>
  );
}