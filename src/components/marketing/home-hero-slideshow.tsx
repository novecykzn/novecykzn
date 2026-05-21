"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/hero-1.png",
    alt: "Novecy hero image 1",
  },
  {
    src: "/hero-2.png",
    alt: "Novecy hero image 2",
  },
  {
    src: "/hero-3.png",
    alt: "Novecy hero image 3",
  },
];

export function HomeHeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative h-[380px] w-full sm:h-[520px]">
      {slides.map((slide, i) => (
        <div
          key={`${slide.alt}-${i}`}
          className={`absolute inset-0 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-8 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
