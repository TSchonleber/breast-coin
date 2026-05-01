'use client'

export function BackgroundVideo() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* The ambient looping video. Falls back to a soft pink-cream gradient if files missing. */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/hero-loop.webm" type="video/webm" />
        <source src="/hero-loop.mp4" type="video/mp4" />
      </video>

      {/* Always-on fallback gradient (sits below video; visible if video fails to load) */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 80% at 30% 20%, #fdf2f8 0%, #fff5ec 50%, #ffe4f0 100%)',
        }}
      />

      {/* Top + bottom scrims keep marquee/footer regions readable, and add depth */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream/95 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-cream/95 to-transparent" />

      {/* Soft global tint so any video color stays in the brand palette */}
      <div className="absolute inset-0 bg-cream/35 mix-blend-soft-light" />
    </div>
  )
}
