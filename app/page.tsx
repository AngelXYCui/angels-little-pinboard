import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-6 py-16">

      {/* Little background decorations */}
      <span className="absolute left-[10%] top-[18%] rotate-[-12deg] text-3xl text-[#f3a1ad]">
        ♡
      </span>

      <span className="absolute right-[14%] top-[22%] rotate-12 text-2xl text-[#cbbbe5]">
        ✦
      </span>

      <span className="absolute bottom-[20%] left-[15%] text-2xl text-[#b8d9c0]">
        ✿
      </span>

      <span className="absolute bottom-[16%] right-[12%] text-3xl text-[#f3a1ad]">
        ♡
      </span>

      {/* Main content */}
      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">

        {/* Tiny label */}
        <div className="mb-5 rounded-full border border-[#f3d8dd] bg-[#fffaf7] px-4 py-2 text-sm font-bold text-[#d98998] shadow-sm">
          your little corner of campus ♡
        </div>

        {/* Title */}
        <h1 className="text-5xl font-black leading-tight tracking-tight text-[#6f5c56] sm:text-6xl">
          angel&apos;s little ♡
          <span className="block text-[#e58e9d]">
            PINBOARD
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#8f7b75]">
          customize your avatar, wander around campus,
          and hang out with whoever&apos;s around ♡
        </p>

        {/* Cute note */}
        <div className="relative mt-10 rotate-[-2deg] rounded-3xl border-2 border-[#ead7a7] bg-[#fff0bd] px-8 py-6 shadow-md">

          {/* Tape */}
          <div className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 bg-[#f3d8dd]/80" />

          <p className="font-bold text-[#8d765d]">
            today&apos;s plans ✿
          </p>

          <div className="mt-3 space-y-1 text-sm font-medium text-[#8d765d]">
            <p>♡ make your tiny avatar</p>
            <p>♡ explore campus</p>
            <p>♡ find your friends</p>
            <p>♡ hang out in the lounge</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="
              rounded-full
              bg-[#f3a1ad]
              px-8 py-3
              font-bold
              text-white
              shadow-md
              transition
              hover:-translate-y-1
              hover:bg-[#ed8f9f]
              hover:shadow-lg
            "
          >
            enter campus ♡
          </Link>

          <Link
            href="/signup"
            className="
              rounded-full
              border-2 border-[#e1d3ee]
              bg-[#f3eef9]
              px-8 py-3
              font-bold
              text-[#8b78a5]
              shadow-sm
              transition
              hover:-translate-y-1
              hover:bg-[#e8dff5]
              hover:shadow-md
            "
          >
            create an account
          </Link>
        </div>

        {/* Bottom doodle */}
        <p className="mt-10 text-sm font-semibold text-[#c19ba3]">
          ✦ made for little campus moments ✦
        </p>
      </div>
    </main>
  );
}