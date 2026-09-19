"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { createClient } from "../lib/supabase/client";

const supabase = createClient();

type LoungeUser = {
  id: string;
  username: string;
  hair: string;
  shirt: string;
  skin_tone: string;
  hairstyle: string;
  is_placed: boolean;
  lounge_id: string | null;
  current_location: string | null;
  position_x: number;
  position_y: number;
  outside_x: number;
  outside_y: number;
};

type DormLoungeProps = {
  dormName: string;
  loungeId: string;
};

export default function DormLounge({
  dormName,
  loungeId,
}: DormLoungeProps) {
const [shouldAutoSpawn, setShouldAutoSpawn] = useState<boolean | null>(null);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setShouldAutoSpawn(params.get("spawn") === "true");
}, []);
const [username, setUsername] = useState("");
  const [hair, setHair] = useState("Brown");
  const [shirt, setShirt] = useState("Blue");
  const [skinTone, setSkinTone] = useState("Light");
  const [hairstyle, setHairstyle] = useState("Short");

  const [position, setPosition] = useState({
    x: 40,
    y: 100,
  });

  /*
   * isPlaced:
   *
   * true = inside lounge, visible to everyone
   * false = outside lounge, visible only to yourself
   */
  const [isPlaced, setIsPlaced] = useState(false);

  /*
   * Where your avatar currently exists:
   *
   * "campus"
   * "low-rise-6"
   * "low-rise-7"
   * null
   */
  const [currentLocation, setCurrentLocation] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);

  const [otherUsers, setOtherUsers] = useState<
    LoungeUser[]
  >([]);

  const loungeRef = useRef<HTMLDivElement>(null);

  /*
   * Load people who are PUBLICLY inside this lounge.
   */
  async function loadLoungeUsers(
    currentUserId: string
  ) {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, hair, shirt, skin_tone, hairstyle, is_placed, lounge_id, current_location, position_x, position_y, outside_x, outside_y"
      )
      .eq("current_location", loungeId)
      .eq("is_placed", true)
      .neq("id", currentUserId);

    if (error) {
      console.log(
        "Could not load lounge users:",
        error
      );
      return;
    }

    setOtherUsers(data ?? []);
  }

  /*
   * Load our profile.
   *
   * If ?spawn=true is in the URL, that means we
   * entered by clicking the building on Campus.
   *
   * In that case, automatically move our avatar
   * to the outside area of this lounge.
   *
   * Entering from the Navbar does NOT have
   * ?spawn=true, so it does not move our avatar.
   */
  useEffect(() => {
  if (shouldAutoSpawn === null) return;

  async function loadUser() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log(
          "Could not get user:",
          userError
        );

        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "username, hair, shirt, skin_tone, hairstyle, is_placed, lounge_id, current_location, position_x, position_y, outside_x, outside_y"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(
          "Could not load profile:",
          error
        );

        setLoading(false);
        return;
      }

      setUsername(data.username ?? "");
      setHair(data.hair ?? "Brown");
      setShirt(data.shirt ?? "Blue");
      setSkinTone(
        data.skin_tone ?? "Light"
      );
      setHairstyle(
        data.hairstyle ?? "Short"
      );

      /*
       * Start with the location stored in Supabase.
       */
      let effectiveLocation =
        data.current_location ?? null;

      let effectiveIsPlaced =
        data.current_location === loungeId &&
        data.is_placed === true;

      /*
       * CAMPUS BUILDING ENTRY
       *
       * ?spawn=true means the user clicked the
       * Low Rise building on the Campus map.
       *
       * If their avatar is not already at this
       * lounge, move it here and place it outside.
       */
      if (
        shouldAutoSpawn &&
        data.current_location !== loungeId
      ) {
        const spawnX = 25;
        const spawnY = 185;

        const { error: spawnError } =
          await supabase
            .from("profiles")
            .update({
              current_location: loungeId,
              lounge_id: loungeId,
              is_placed: false,
              outside_x: spawnX,
              outside_y: spawnY,
            })
            .eq("id", user.id);

        if (spawnError) {
          console.log(
            "Could not automatically spawn avatar:",
            spawnError
          );
        } else {
          effectiveLocation = loungeId;
          effectiveIsPlaced = false;

          setPosition({
            x: spawnX,
            y: spawnY,
          });
        }
      }

      setCurrentLocation(
        effectiveLocation
      );

      setIsPlaced(
        effectiveIsPlaced
      );

      /*
       * Restore our position if our avatar
       * already belongs to this lounge.
       */
      if (
        effectiveLocation === loungeId
      ) {
        /*
         * INSIDE
         *
         * Convert the saved percentage position
         * back into page pixels.
         */
        if (effectiveIsPlaced) {
          requestAnimationFrame(() => {
            const lounge =
              loungeRef.current;

            if (!lounge) return;

            const parent =
              lounge.parentElement;

            if (!parent) return;

            const loungeRect =
              lounge.getBoundingClientRect();

            const parentRect =
              parent.getBoundingClientRect();

            const savedX =
              data.position_x ?? 50;

            const savedY =
              data.position_y ?? 50;

            setPosition({
              x:
                loungeRect.left -
                parentRect.left +
                (savedX / 100) *
                  loungeRect.width,

              y:
                loungeRect.top -
                parentRect.top +
                (savedY / 100) *
                  loungeRect.height,
            });
          });
        }

        /*
         * OUTSIDE
         *
         * If this was NOT a fresh automatic spawn,
         * restore our previously saved outside
         * position.
         *
         * If it WAS a fresh spawn, we already set
         * position to 25,185 above.
         */
        else if (
          !(
            shouldAutoSpawn &&
            data.current_location !==
              loungeId
          )
        ) {
          setPosition({
            x: data.outside_x ?? 25,
            y: data.outside_y ?? 185,
          });
        }
      }

      await loadLoungeUsers(
        user.id
      );

      setLoading(false);
    }

    loadUser();
  }, [loungeId, shouldAutoSpawn]);

  /*
   * REALTIME
   *
   * Watch everyone else's profile.
   */
  useEffect(() => {
    let channel:
      | ReturnType<
          typeof supabase.channel
        >
      | null = null;

    let cancelled = false;

    async function subscribeToLounge() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      /*
       * Remove an old lounge channel for
       * this user if one exists.
       */
      const existingChannels =
        supabase.getChannels();

      for (
        const existingChannel of
        existingChannels
      ) {
        if (
          existingChannel.topic ===
          `realtime:lounge-changes-${user.id}`
        ) {
          await supabase.removeChannel(
            existingChannel
          );
        }
      }

      if (cancelled) return;

      channel = supabase
        .channel(
          `lounge-changes-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
          },
          (payload) => {
            const updatedUser =
              payload.new as LoungeUser;

            /*
             * Ignore our own Realtime update.
             */
            if (
              updatedUser.id === user.id
            ) {
              return;
            }

            setOtherUsers(
              (currentUsers) => {
                /*
                 * Someone is publicly visible
                 * ONLY when:
                 *
                 * 1. Their current_location
                 *    matches this lounge.
                 *
                 * 2. is_placed is true.
                 */
                const shouldBeVisible =
                  updatedUser.current_location ===
                    loungeId &&
                  updatedUser.is_placed ===
                    true;

                /*
                 * They moved somewhere else
                 * or dragged outside.
                 */
                if (
                  !shouldBeVisible
                ) {
                  return currentUsers.filter(
                    (person) =>
                      person.id !==
                      updatedUser.id
                  );
                }

                const updatedLoungeUser: LoungeUser =
                  {
                    id: updatedUser.id,

                    username:
                      updatedUser.username,

                    hair:
                      updatedUser.hair,

                    shirt:
                      updatedUser.shirt,

                    skin_tone:
                      updatedUser.skin_tone,

                    hairstyle:
                      updatedUser.hairstyle,

                    is_placed:
                      updatedUser.is_placed,

                    lounge_id:
                      updatedUser.lounge_id,

                    current_location:
                      updatedUser.current_location,

                    position_x:
                      updatedUser.position_x,

                    position_y:
                      updatedUser.position_y,

                    outside_x:
                      updatedUser.outside_x,

                    outside_y:
                      updatedUser.outside_y,
                  };

                const alreadyExists =
                  currentUsers.some(
                    (person) =>
                      person.id ===
                      updatedUser.id
                  );

                if (
                  alreadyExists
                ) {
                  return currentUsers.map(
                    (person) =>
                      person.id ===
                      updatedUser.id
                        ? updatedLoungeUser
                        : person
                  );
                }

                return [
                  ...currentUsers,
                  updatedLoungeUser,
                ];
              }
            );
          }
        )
        .subscribe();
    }

    subscribeToLounge();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
    };
  }, [loungeId]);

  /*
   * Manual Spawn button.
   *
   * This appears when someone visits through
   * the Navbar and their avatar is somewhere
   * else.
   */
  async function spawnOutsideLounge() {
    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) return;

    const spawnX = 25;
    const spawnY = 185;

    const { error } =
      await supabase
        .from("profiles")
        .update({
          current_location:
            loungeId,

          lounge_id:
            loungeId,

          is_placed:
            false,

          outside_x:
            spawnX,

          outside_y:
            spawnY,
        })
        .eq("id", user.id);

    if (error) {
      console.log(
        "Could not spawn avatar:",
        error
      );

      return;
    }

    setCurrentLocation(
      loungeId
    );

    setIsPlaced(false);

    setPosition({
      x: spawnX,
      y: spawnY,
    });
  }

  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-5xl">

        {/* Heading */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              ♡
            </span>

            <h1 className="text-4xl font-black tracking-tight text-[#6f5c56]">
              {dormName}
            </h1>

            <span className="text-xl text-pink-300">
              ✦
            </span>
          </div>

          <p className="mt-2 text-[#a18a82]">
            Drag your avatar into the lounge to hang out ♡
          </p>
        </div>

        {/* Status */}
        <p className="mt-3 min-h-6 text-sm font-semibold text-[#e58e9d]">
          {!loading &&
            (currentLocation !==
            loungeId
              ? "Your avatar is somewhere else right now."
              : isPlaced
                ? "You're hanging out in the lounge! ♡"
                : "You're outside the lounge — drag yourself in!")}
        </p>

        {/* Manual Spawn button */}
        {!loading &&
          currentLocation !==
            loungeId && (
            <button
              type="button"
              onClick={
                spawnOutsideLounge
              }
              className="
                mt-2
                rounded-full
                border-2 border-[#f0c7cf]
                bg-[#ffe4e9]
                px-6 py-2
                font-bold text-[#b87885]
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              ♡ Spawn Avatar
            </button>
          )}

        {/* Interactive Area */}
        <div className="relative mt-7 h-[540px] w-full">

          {/* Your draggable avatar */}
          {!loading &&
            currentLocation ===
              loungeId && (
              <div
                className="
                  absolute z-10
                  cursor-grab
                  select-none
                  active:cursor-grabbing
                "
                style={{
                  left: position.x,
                  top: position.y,
                  touchAction:
                    "none",
                }}
                onPointerDown={(
                  event
                ) => {
                  const avatar =
                    event.currentTarget;

                  avatar.setPointerCapture(
                    event.pointerId
                  );

                  const avatarRect =
                    avatar.getBoundingClientRect();

                  avatar.dataset.offsetX =
                    (
                      event.clientX -
                      avatarRect.left
                    ).toString();

                  avatar.dataset.offsetY =
                    (
                      event.clientY -
                      avatarRect.top
                    ).toString();
                }}
                onPointerMove={(
                  event
                ) => {
                  const avatar =
                    event.currentTarget;

                  if (
                    !avatar.hasPointerCapture(
                      event.pointerId
                    )
                  ) {
                    return;
                  }

                  const parent =
                    avatar.parentElement;

                  if (!parent) {
                    return;
                  }

                  const parentRect =
                    parent.getBoundingClientRect();

                  const offsetX =
                    Number(
                      avatar.dataset
                        .offsetX
                    );

                  const offsetY =
                    Number(
                      avatar.dataset
                        .offsetY
                    );

                  setPosition({
                    x:
                      event.clientX -
                      parentRect.left -
                      offsetX,

                    y:
                      event.clientY -
                      parentRect.top -
                      offsetY,
                  });
                }}
                onPointerUp={async (
                  event
                ) => {
                  const avatar =
                    event.currentTarget;

                  const pointerId =
                    event.pointerId;

                  const lounge =
                    loungeRef.current;

                  if (!lounge) {
                    if (
                      avatar.hasPointerCapture(
                        pointerId
                      )
                    ) {
                      avatar.releasePointerCapture(
                        pointerId
                      );
                    }

                    return;
                  }

                  const loungeRect =
                    lounge.getBoundingClientRect();

                  const avatarRect =
                    avatar.getBoundingClientRect();

                  /*
                   * Convert avatar position
                   * inside the lounge to
                   * percentage coordinates.
                   */
                  const rawLoungeX =
                    ((avatarRect.left -
                      loungeRect.left) /
                      loungeRect.width) *
                    100;

                  const rawLoungeY =
                    ((avatarRect.top -
                      loungeRect.top) /
                      loungeRect.height) *
                    100;

                  const loungeX =
                    Math.max(
                      0,
                      Math.min(
                        88,
                        rawLoungeX
                      )
                    );

                  const loungeY =
                    Math.max(
                      0,
                      Math.min(
                        74,
                        rawLoungeY
                      )
                    );

                  /*
                   * Determine whether the
                   * pointer was released
                   * inside the lounge.
                   */
                  const droppedInside =
                    event.clientX >=
                      loungeRect.left &&
                    event.clientX <=
                      loungeRect.right &&
                    event.clientY >=
                      loungeRect.top &&
                    event.clientY <=
                      loungeRect.bottom;

                  setIsPlaced(
                    droppedInside
                  );

                  if (
                    avatar.hasPointerCapture(
                      pointerId
                    )
                  ) {
                    avatar.releasePointerCapture(
                      pointerId
                    );
                  }

                  const {
                    data: { user },
                  } =
                    await supabase.auth.getUser();

                  if (!user) {
                    return;
                  }

                  /*
                   * INSIDE:
                   *
                   * Publicly visible.
                   * Save percentage position.
                   *
                   *
                   * OUTSIDE:
                   *
                   * Still at this lounge.
                   * Only visible to yourself.
                   * Save pixel position.
                   */
                  const updateData =
                    droppedInside
                      ? {
                          current_location:
                            loungeId,

                          lounge_id:
                            loungeId,

                          is_placed:
                            true,

                          position_x:
                            loungeX,

                          position_y:
                            loungeY,
                        }
                      : {
                          current_location:
                            loungeId,

                          lounge_id:
                            loungeId,

                          is_placed:
                            false,

                          outside_x:
                            position.x,

                          outside_y:
                            position.y,
                        };

                  const { error } =
                    await supabase
                      .from(
                        "profiles"
                      )
                      .update(
                        updateData
                      )
                      .eq(
                        "id",
                        user.id
                      );

                  if (error) {
                    console.log(
                      "Could not save avatar position:",
                      error
                    );
                  }
                }}
              >
                <div className="origin-top-left scale-50">
                  <Avatar
                    hair={hair}
                    shirt={shirt}
                    skinTone={
                      skinTone
                    }
                    hairstyle={
                      hairstyle
                    }
                  />
                </div>

                <p className="absolute left-0 top-36 w-28 text-center font-bold">
                  {username}
                </p>
              </div>
            )}

          {/* Main Lounge */}
          <div
            ref={loungeRef}
            className="
              absolute bottom-0 right-0
              h-[560px] w-[85%]
              rounded-[32px]
              border-4 border-[#e8cfc7]
              bg-[#fff7ed]
              shadow-xl
            "
          >
            {/* Lounge title */}
            <div className="absolute left-1/2 top-5 -translate-x-1/2">
              <h2 className="text-2xl font-bold text-black">
                Main Lounge
              </h2>
            </div>

            {/* Other users */}
            {otherUsers.map(
              (otherUser) => (
                <div
                  key={
                    otherUser.id
                  }
                  className="pointer-events-none absolute z-10"
                  style={{
                    left: `${otherUser.position_x}%`,
                    top: `${otherUser.position_y}%`,
                  }}
                >
                  <div className="origin-top-left scale-50">
                    <Avatar
                      hair={
                        otherUser.hair
                      }
                      shirt={
                        otherUser.shirt
                      }
                      skinTone={
                        otherUser.skin_tone
                      }
                      hairstyle={
                        otherUser.hairstyle
                      }
                    />
                  </div>

                  <p className="absolute left-0 top-36 w-28 text-center font-bold text-black">
                    {
                      otherUser.username
                    }
                  </p>
                </div>
              )
            )}

            {/* Ping Pong */}
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