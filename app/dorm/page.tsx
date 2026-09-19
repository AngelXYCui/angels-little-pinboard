"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "../../components/Avatar";
import { createClient } from "../../lib/supabase/client";
const supabase = createClient();
type LoungeUser = {
  id: string;
  username: string;
  hair: string;
  shirt: string;
  position_x: number;
  position_y: number;
};

export default function DormPage() {
  const [username, setUsername] = useState("");
  const [hair, setHair] = useState("Brown");
  const [shirt, setShirt] = useState("Blue");

  // Position of our avatar
  const [position, setPosition] = useState({
    x: 40,
    y: 100,
  });

  const [isPlaced, setIsPlaced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUsers, setOtherUsers] = useState<LoungeUser[]>([]);
  const loungeRef = useRef<HTMLDivElement>(null);

async function loadLoungeUsers(currentUserId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, hair, shirt, position_x, position_y")
    .eq("is_placed", true)
    .neq("id", currentUserId);

  if (error) {
    console.log("Could not load lounge users:", error);
    return;
  }

  setOtherUsers(data ?? []);
}

useEffect(() => {
  async function loadUser() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("Could not get user:", userError);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "username, hair, shirt, is_placed, position_x, position_y"
      )
      .eq("id", user.id)
      .single();

    if (error) {
      console.log("Could not load profile:", error);
      setLoading(false);
      return;
    }

    setUsername(data.username ?? "");
    setHair(data.hair ?? "Brown");
    setShirt(data.shirt ?? "Blue");

    setIsPlaced(data.is_placed ?? false);

    if (!data.is_placed) {
    setPosition({
        x: 40,
        y: 100,
    });
    } else {
    requestAnimationFrame(() => {
        const lounge = loungeRef.current;

        if (!lounge) return;

        const loungeRect = lounge.getBoundingClientRect();
        const parent = lounge.parentElement;

        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();

        setPosition({
        x:
            loungeRect.left -
            parentRect.left +
            (data.position_x ?? 0),
        y:
            loungeRect.top -
            parentRect.top +
            (data.position_y ?? 0),
        });
    });
    }


    await loadLoungeUsers(user.id);
    setLoading(false);
  }

  loadUser();
}, []);
useEffect(() => {
  let channel: ReturnType<typeof supabase.channel> | null = null;
  let cancelled = false;

  async function subscribeToLounge() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || cancelled) return;

    // Remove an old subscription if one exists
    const existingChannels = supabase.getChannels();

    for (const existingChannel of existingChannels) {
      if (existingChannel.topic === `realtime:lounge-changes-${user.id}`) {
        await supabase.removeChannel(existingChannel);
      }
    }

    if (cancelled) return;

    channel = supabase
      .channel(`lounge-changes-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          console.log("REALTIME UPDATE:", payload);
          const updatedUser = payload.new as LoungeUser & {
            is_placed: boolean;
          };

          // Don't add our own avatar to otherUsers
          if (updatedUser.id === user.id) return;

          setOtherUsers((currentUsers) => {
            // If they left the lounge, remove them
            if (!updatedUser.is_placed) {
              return currentUsers.filter(
                (person) => person.id !== updatedUser.id
              );
            }

            // Check whether they're already visible
            const alreadyExists = currentUsers.some(
              (person) => person.id === updatedUser.id
            );

            // If they already exist, update only that avatar
            if (alreadyExists) {
              return currentUsers.map((person) =>
                person.id === updatedUser.id
                  ? {
                      id: updatedUser.id,
                      username: updatedUser.username,
                      hair: updatedUser.hair,
                      shirt: updatedUser.shirt,
                      position_x: updatedUser.position_x,
                      position_y: updatedUser.position_y,
                    }
                  : person
              );
            }

            // Otherwise, they just entered the lounge
            return [
              ...currentUsers,
              {
                id: updatedUser.id,
                username: updatedUser.username,
                hair: updatedUser.hair,
                shirt: updatedUser.shirt,
                position_x: updatedUser.position_x,
                position_y: updatedUser.position_y,
              },
            ];
          });
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });
  }

  subscribeToLounge();

  return () => {
    cancelled = true;

    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, []);
  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-5xl">

        <div>
        <div className="flex items-center gap-2">
            <span className="text-2xl">♡</span>

            <h1 className="text-4xl font-black tracking-tight text-[#6f5c56]">
            Dorm
            </h1>

            <span className="text-xl text-pink-300">✦</span>
        </div>

        <p className="mt-2 text-[#a18a82]">
            Drag your avatar into the lounge when you want to hang out.
        </p>
        </div>

        <p className="mt-3 min-h-6 text-sm font-semibold text-[#e58e9d]">
        {!loading &&
            (isPlaced
            ? "You're in the lounge!"
            : "You don't want to hang out? :(")}
        </p>

        {/* Everything below is our interactive area */}
        <div className="relative mt-7 h-[540px] w-full">
          {/* Your draggable avatar */}
          {!loading && (
          <div
            className="absolute z-10 cursor-grab select-none active:cursor-grabbing"
            style={{
                left: position.x,
                top: position.y,
                touchAction: "none",
            }}
            onPointerDown={(event) => {
                const avatar = event.currentTarget;
                const parent = avatar.parentElement;

                if (!parent) return;

                avatar.setPointerCapture(event.pointerId);

                const parentRect = parent.getBoundingClientRect();
                const avatarRect = avatar.getBoundingClientRect();

                const offsetX = event.clientX - avatarRect.left;
                const offsetY = event.clientY - avatarRect.top;

                avatar.dataset.offsetX = offsetX.toString();
                avatar.dataset.offsetY = offsetY.toString();
                avatar.dataset.parentLeft = parentRect.left.toString();
                avatar.dataset.parentTop = parentRect.top.toString();
            }}
            onPointerMove={(event) => {
                const avatar = event.currentTarget;

                if (!avatar.hasPointerCapture(event.pointerId)) {
                return;
                }

                const offsetX = Number(avatar.dataset.offsetX);
                const offsetY = Number(avatar.dataset.offsetY);
                const parentLeft = Number(avatar.dataset.parentLeft);
                const parentTop = Number(avatar.dataset.parentTop);

                setPosition({
                x: event.clientX - parentLeft - offsetX,
                y: event.clientY - parentTop - offsetY,
                });
            }}
            onPointerUp={async (event) => {
            const avatar = event.currentTarget;
            const pointerId = event.pointerId;

            const lounge = loungeRef.current;

            if (!lounge) {
                if (avatar.hasPointerCapture(pointerId)) {
                avatar.releasePointerCapture(pointerId);
                }
                return;
            }

            const loungeRect = lounge.getBoundingClientRect();
            const avatarRect = avatar.getBoundingClientRect();

            const loungeX = avatarRect.left - loungeRect.left;
            const loungeY = avatarRect.top - loungeRect.top;

            const droppedInside =
                event.clientX >= loungeRect.left &&
                event.clientX <= loungeRect.right &&
                event.clientY >= loungeRect.top &&
                event.clientY <= loungeRect.bottom;

            setIsPlaced(droppedInside);

            // Release the pointer immediately
            if (avatar.hasPointerCapture(pointerId)) {
                avatar.releasePointerCapture(pointerId);
            }

            // Then save to Supabase
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { error } = await supabase
                .from("profiles")
                .update({
                is_placed: droppedInside,
                position_x: loungeX,
                position_y: loungeY,
                })
                .eq("id", user.id);

                if (error) {
                console.log(error);
                }
            }
            }}
            >
            <div className="origin-top-left scale-50">
              <Avatar hair={hair} shirt={shirt} />
            </div>

            <p className="absolute left-0 top-36 w-28 text-center font-bold">
              {username}
            </p>
          </div>
          )}

          {/* Main Lounge */}
          
          <div
            ref={loungeRef}
            className="absolute bottom-0 right-0 h-[560px] w-[85%] overflow-hidden rounded-[32px] border-4 border-[#e8cfc7] bg-[#fff7ed] shadow-xl"          >

            <div className="absolute left-1/2 top-5 -translate-x-1/2">
              <h2 className="text-2xl font-bold text-black">
                Main Lounge
              </h2>
            </div>
            {/* Other users */}
            {otherUsers.map((otherUser) => (
            <div
                key={otherUser.id}
                className="absolute z-10"
                style={{
                left: otherUser.position_x,
                top: otherUser.position_y,
                }}
            >
                <div className="origin-top-left scale-50">
                <Avatar
                    hair={otherUser.hair}
                    shirt={otherUser.shirt}
                />
                </div>

                <p className="absolute left-0 top-36 w-28 text-center font-bold text-black">
                {otherUser.username}
                </p>
            </div>
            ))}
            {/* Ping pong area */}
            <div className="absolute left-[3%] top-[5%] h-[32%] w-[36%] rounded-3xl border-2 border-[#b9d9c2] bg-[#e8f5e9] shadow-sm">
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8f5e9] px-3 py-1 font-bold text-[#78947f]">
            Ping Pong
            </p>
            </div>

            {/* Top door */}
            <div className="absolute left-[46%] top-0 h-4 w-[10%] rounded-b-lg bg-[#e8cfc7]" />

            {/* Long table */}
            <div className="absolute right-[4%] top-[5%] h-[15%] w-[35%] rounded-3xl border-2 border-[#ead7a7] bg-[#fff0bd] shadow-sm">
            <p className="flex h-full items-center justify-center font-semibold text-[#a58a4d]">
                Table
            </p>
            </div>

            {/* Shelf */}
            <div className="absolute left-[2%] top-[43%] h-[25%] w-[5%] rounded-xl border-2 border-[#d7c7eb] bg-[#eee6f7] shadow-sm">
            <p className="flex h-full rotate-[-90deg] items-center justify-center whitespace-nowrap text-sm font-semibold text-[#8d79a6]">
                Shelf
            </p>
            </div>

            {/* Round table 1 */}
            <div className="absolute left-[16%] top-[45%] flex aspect-square w-[13%] items-center justify-center rounded-full border-2 border-[#f0c7cf] bg-[#ffe4e9] shadow-sm">
            <span className="text-sm font-semibold text-[#b87885]">
                Table
            </span>
            </div>

            {/* Round table 2 */}
            <div className="absolute bottom-[7%] left-[7%] flex aspect-square w-[13%] items-center justify-center rounded-full border-2 border-[#c8dceb] bg-[#e4f2fb] shadow-sm">
            <span className="text-sm font-semibold text-[#718fa5]">
                Table
            </span>
            </div>

            {/* U-shaped couch */}
            <div className="absolute right-[4%] top-[38%] h-[40%] w-[42%]">
            <div className="absolute left-0 top-0 h-[28%] w-full rounded-t-3xl bg-[#e8dff5] shadow-sm" />

            <div className="absolute bottom-0 left-0 h-[80%] w-[18%] rounded-bl-3xl bg-[#e8dff5] shadow-sm" />

            <div className="absolute bottom-0 right-0 h-[80%] w-[18%] rounded-br-3xl bg-[#e8dff5] shadow-sm" />

            <p className="absolute left-1/2 top-3 -translate-x-1/2 font-semibold text-[#8b78a5]">
                Couch
            </p>
            </div>

            {/* Bottom door */}
            <div className="absolute bottom-0 left-[35%] h-4 w-[10%] rounded-t-lg bg-[#e8cfc7]" />

            {/* TV */}
            <div className="absolute bottom-[3%] right-[8%] h-[5%] w-[34%] rounded-lg bg-[#8b7b76] shadow-sm">
            <p className="text-center text-xs font-semibold text-white">
                TV
            </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}