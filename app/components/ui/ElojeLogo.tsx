import Image from "next/image";

interface ElejeLogoProps {
  width?: number;
  height?: number;
}

export default function ElojeLogo({ width = 75, height = 50 }: ElejeLogoProps) {
  return (
    <Image
      src="/image/elf_logo.png"
      alt="Eleje logo"
      width={width}
      height={height}
      priority
      style={{ objectFit: 'contain' }}
    />
  );
}