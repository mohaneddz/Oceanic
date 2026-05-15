import { useState } from "react";

type CachedVideoProps = {
  src: string;
  className?: string;
  wrapperClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
};

export function CachedVideo({
  src,
  className,
  wrapperClassName,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload = "metadata",
}: CachedVideoProps) {
  const [ready, setReady] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName ?? ""}`}>
      {!ready ? (
        <div
          className="absolute inset-0 z-[1] animate-pulse bg-gradient-to-r from-[#1c395a94] via-[#345c88a6] to-[#1c395a94]"
          aria-hidden="true"
        />
      ) : null}
      <video
        src={src}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload={preload}
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
        className={`block ${className ?? ""}`}
      />
    </div>
  );
}
