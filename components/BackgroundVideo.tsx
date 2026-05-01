'use client'

export function BackgroundVideo() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
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

      {/* Fallback gradient sits below the video; visible only if files fail to load */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 80% at 30% 20%, #fdf2f8 0%, #fff5ec 50%, #ffe4f0 100%)',
        }}
      />

      {/* Bottom scrim — keeps the footer region readable */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream/95 to-transparent" />
    </div>
  )
}
