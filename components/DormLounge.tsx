"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const [shouldAutoSpawn, setShouldAutoSpawn] =
    useState<boolean | null>(null);

  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [hair, setHair] = useState("Brown");
  const [shirt, setShirt] = useState("Blue");
  const [skinTone, setSkinTone] = useState("Light");
  const [hairstyle, setHairstyle] = useState("Short");

  const [position, setPosition] = useState({
    x: 40,
    y: 100,
  });

  const [isPlaced, setIsPlaced] = useState(false);

  const [currentLocation, setCurrentLocation] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);

  const [otherUsers, setOtherUsers] = useState<
    LoungeUser[]
  >([]);

  const loungeRef = useRef<HTMLDivElement>(null);

  /*
   * Check whether we entered through
   * a Campus building.
   */
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    setShouldAutoSpawn(
      params.get("spawn") === "true"
    );
  }, []);

  /*
   * Load everyone publicly visible
   * inside this lounge.
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

      let effectiveLocation =
        data.current_location ?? null;

      let effectiveIsPlaced =
        data.current_location === loungeId &&
        data.is_placed === true;

      const isFreshAutoSpawn =
        shouldAutoSpawn &&
        data.current_location !== loungeId;

      /*
       * Clicking a Campus building automatically
       * moves the avatar to this lounge.
       */
      if (isFreshAutoSpawn) {
        const spawnX = 25;
        const spawnY = 185;

        /*
        * Finish any previous lounge session
        * before moving locations.
        */
        const { error: timerError } =
            await supabase.rpc("stop_lounge_time");

        if (timerError) {
            console.log(
            "Could not stop previous lounge timer:",
            timerError
            );
        }

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
       * Restore saved position.
       */
      if (
        effectiveLocation === loungeId
      ) {
        /*
         * Inside lounge.
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
         * Outside lounge.
         */
        else if (!isFreshAutoSpawn) {
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

            if (
              updatedUser.id === user.id
            ) {
              return;
            }

            setOtherUsers(
              (currentUsers) => {
                const shouldBeVisible =
                  updatedUser.current_location ===
                    loungeId &&
                  updatedUser.is_placed ===
                    true;

                if (!shouldBeVisible) {
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

                if (alreadyExists) {
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
   */
  async function spawnOutsideLounge() {
    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) return;
    /*
    * If a lounge timer is currently running,
    * finish that session before moving.
    */
    const { error: timerError } =
    await supabase.rpc("stop_lounge_time");

    if (timerError) {
    console.log(
        "Could not stop previous lounge timer:",
        timerError
    );
    }
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
                ? "You're in the lounge! ♡"
                : "You don't want to hang out? :(")}
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
        <div
          className="relative mt-7 h-[540px] w-full"
          onClick={() =>
            setSelectedUserId(null)
          }
        >

          {/* YOUR AVATAR */}
          {!loading &&
            currentLocation ===
              loungeId && (
              <div
                className="
                  group
                  absolute
                  z-20
                  h-[105px]
                  w-[90px]
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
                  event.stopPropagation();

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

                  const droppedInside =
                    event.clientX >=
                      loungeRect.left &&
                    event.clientX <=
                      loungeRect.right &&
                    event.clientY >=
                      loungeRect.top &&
                    event.clientY <=
                      loungeRect.bottom;

                  const wasPlaced = isPlaced;

                    setIsPlaced(droppedInside);

                    /*
                    * LOUNGE TIME
                    *
                    * Start timer only when crossing
                    * from outside -> inside.
                    *
                    * Stop timer only when crossing
                    * from inside -> outside.
                    */
                    if (droppedInside && !wasPlaced) {
                    const { error: timerError } =
                        await supabase.rpc("start_lounge_time");

                    if (timerError) {
                        console.log(
                        "Could not start lounge timer:",
                        timerError
                        );
                    }
                    }

                    if (!droppedInside && wasPlaced) {
                    const { error: timerError } =
                        await supabase.rpc("stop_lounge_time");

                    if (timerError) {
                        console.log(
                        "Could not stop lounge timer:",
                        timerError
                        );
                    }
                    }

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

                  const parent =
                    avatar.parentElement;

                  let outsideX =
                    position.x;

                  let outsideY =
                    position.y;

                  if (parent) {
                    const parentRect =
                      parent.getBoundingClientRect();

                    outsideX =
                      avatarRect.left -
                      parentRect.left;

                    outsideY =
                      avatarRect.top -
                      parentRect.top;
                  }

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
                            outsideX,

                          outside_y:
                            outsideY,
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
                {/* Tiny YOU marker */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    left-[52px]
                    top-[-14px]
                    z-30
                    -translate-x-1/2
                    whitespace-nowrap
                    rounded-full
                    bg-[#ffe4e9]
                    px-2 py-0.5
                    text-[9px]
                    font-bold
                    text-[#b87885]
                    shadow-sm
                  "
                >
                  you ♡
                </div>

                {/* Visible avatar */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    left-0
                    top-0
                    origin-top-left
                    scale-50
                    transition
                    duration-200
                    group-hover:-translate-y-1
                    group-hover:drop-shadow-[0_0_6px_rgba(243,161,173,0.65)]
                  "
                >
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

                {/* Username */}
                <p
                  className="
                    pointer-events-none
                    absolute
                    left-[52px]
                    top-[115px]
                    -translate-x-1/2
                    whitespace-nowrap
                    rounded-full
                    bg-white/90
                    px-2 py-1
                    text-xs
                    font-semibold
                    text-[#806b67]
                    shadow-sm
                  "
                >
                  {username}
                </p>
              </div>
            )}

          {/* MAIN LOUNGE */}
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

            {/* OTHER USERS */}
            {otherUsers.map(
              (otherUser) => {
                const isSelected =
                  selectedUserId ===
                  otherUser.id;

                return (
                  <div
                    key={
                      otherUser.id
                    }
                    className="absolute z-10"
                    style={{
                      left: `${otherUser.position_x}%`,
                      top: `${otherUser.position_y}%`,
                    }}
                  >
                    {/*
                     * Small interaction area.
                     * Only this 90 x 105 box
                     * responds to hover/click.
                     */}
                    <button
                      type="button"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        setSelectedUserId(
                          isSelected
                            ? null
                            : otherUser.id
                        );
                      }}
                      className="
                        group
                        relative
                        block
                        h-[105px]
                        w-[90px]
                        cursor-pointer
                      "
                    >
                      <div
                        className="
                          pointer-events-none
                          absolute
                          left-0
                          top-0
                          origin-top-left
                          scale-50
                          transition
                          duration-200
                          group-hover:-translate-y-1
                          group-hover:drop-shadow-md
                        "
                      >
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
                    </button>

                    {/* Username */}
                    <p
                      className="
                        pointer-events-none
                        absolute
                        left-[52px]
                        top-[115px]
                        -translate-x-1/2
                        whitespace-nowrap
                        rounded-full
                        bg-white/90
                        px-2 py-1
                        text-xs
                        font-semibold
                        text-[#806b67]
                        shadow-sm
                      "
                    >
                      {
                        otherUser.username
                      }
                    </p>

                    {/* Tiny profile button */}
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          router.push(
                            `/profile/${otherUser.id}`
                          );
                        }}
                        className="
                          absolute
                          left-[53px]
                          top-[142px]
                          -translate-x-1/2
                          whitespace-nowrap
                          rounded-full
                          border border-[#f0c7cf]
                          bg-[#fffaf7]
                          px-2 py-0.5
                          text-[9px]
                          font-bold
                          text-[#b87885]
                          shadow-sm
                          transition
                          hover:bg-[#ffe4e9]
                        "
                      >
                        profile ♡
                      </button>
                    )}
                  </div>
                );
              }
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
            <div className="absolute bottom-0 left-[46%] h-4 w-[10%] rounded-t-lg bg-[#e8cfc7]" />

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