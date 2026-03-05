interface ElejeLogoProps {
  width?: number;
  height?: number;
}

export default function ElojeLogo({ width = 32, height = 36 }: ElejeLogoProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 60 68" fill="none">
      <circle cx="38" cy="10" r="9" fill="#10B981" />
      <path
        d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z"
        fill="#0D6E4F"
      />
      <circle cx="16" cy="24" r="7.5" fill="#34D399" />
      <path
        d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z"
        fill="#34D399"
      />
    </svg>
  );
}