type AvatarProps = {
  hair: string;
  shirt: string;
};

const hairColors: Record<string, string> = {
  Brown: "#765548",
  Black: "#3f3838",
  Blonde: "#e8c77b",
};

const shirtColors: Record<string, string> = {
  Blue: "#a9d5ec",
  Red: "#f4a6ad",
  Green: "#afd9bd",
};

export default function Avatar({ hair, shirt }: AvatarProps) {
  const hairColor = hairColors[hair] ?? hairColors.Brown;
  const shirtColor = shirtColors[shirt] ?? shirtColors.Blue;

  return (
    <div className="relative h-72 w-52">
      {/* Legs — behind body */}
      <div className="absolute left-[4.6rem] top-[12.5rem] z-0 h-14 w-7 rounded-b-full bg-[#8b7c91]" />
      <div className="absolute right-[4.6rem] top-[12.5rem] z-0 h-14 w-7 rounded-b-full bg-[#8b7c91]" />

      {/* Arms — behind body */}
      <div
        className="absolute left-[2.8rem] top-[9.5rem] z-0 h-16 w-6 rotate-[12deg] rounded-full"
        style={{ backgroundColor: shirtColor }}
      />

      <div
        className="absolute right-[2.8rem] top-[9.5rem] z-0 h-16 w-6 -rotate-[12deg] rounded-full"
        style={{ backgroundColor: shirtColor }}
      />

      {/* Body */}
      <div
        className="absolute left-1/2 top-[8.8rem] z-10 h-24 w-24 -translate-x-1/2 rounded-t-[40px] rounded-b-3xl shadow-sm"
        style={{ backgroundColor: shirtColor }}
      >
        <div className="absolute left-1/2 top-5 -translate-x-1/2 text-xl text-white/80">
          ♡
        </div>
      </div>

      {/* Head — in front of body */}
      <div className="absolute left-1/2 top-8 z-20 h-28 w-28 -translate-x-1/2 rounded-[46%] bg-[#ffd9c7] shadow-sm">
        
        {/* Hair cap */}
        <div
          className="absolute -left-1 -top-3 z-30 h-[4.5rem] w-[7.5rem] rounded-t-[55%] rounded-b-[25%]"
          style={{ backgroundColor: hairColor }}
        />

        {/* Face sits over hair cap */}
        <div className="absolute inset-0 z-40">
          {/* Eyes */}
          <div className="absolute left-7 top-[4.5rem] h-2.5 w-2.5 rounded-full bg-[#66504b]" />
          <div className="absolute right-7 top-[4.5rem] h-2.5 w-2.5 rounded-full bg-[#66504b]" />

          {/* Blush */}
          <div className="absolute left-3 top-[5.4rem] h-2 w-4 rounded-full bg-[#f4a6a6]/60" />
          <div className="absolute right-3 top-[5.4rem] h-2 w-4 rounded-full bg-[#f4a6a6]/60" />

          {/* Smile */}
          <div className="absolute left-1/2 top-[5.2rem] h-2 w-4 -translate-x-1/2 rounded-b-full border-b-2 border-[#9b6c67]" />
        </div>
      </div>
    </div>
  );
}