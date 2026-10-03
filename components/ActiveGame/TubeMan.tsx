'use client';

/**
 * Wacky waving inflatable arm-flailing tube man. Each body segment is nested
 * inside the one below it and rotates around its own joint, so the small
 * per-segment wobbles compound into the classic flail.
 */
interface TubeManProps {
  /** Narration currently being spoken; shown in a speech bubble while set. */
  speech?: string | null;
}

export function TubeMan({ speech }: TubeManProps) {
  const body = 'var(--color-danger)';
  const stripe = 'var(--color-accent-gold)';

  return (
    <div className="fixed bottom-0 left-2 z-10 pointer-events-none w-16 sm:w-20 lg:w-28 xl:w-36">
      {speech && (
        <div
          key={speech}
          role="status"
          className="speech-bubble absolute left-full bottom-[72%] ml-1 w-48 sm:w-60 lg:w-80 xl:w-96 rounded-2xl px-3 py-2 lg:px-5 lg:py-3 bg-[var(--color-foreground)] text-[var(--color-background)] text-xs sm:text-sm lg:text-lg xl:text-xl font-medium leading-snug shadow-lg"
        >
          {speech}
          {/* Tail pointing down toward the tube man's head */}
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 left-3 w-4 h-4 lg:w-5 lg:h-5 rotate-45 bg-[var(--color-foreground)]"
          />
        </div>
      )}

      <svg aria-hidden="true" viewBox="-20 0 160 230" className="w-full h-auto overflow-visible">
        {/* Fan base */}
        <rect x="38" y="204" width="44" height="22" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
        <rect x="44" y="210" width="32" height="4" rx="2" fill="var(--color-border)" />
        <rect x="44" y="218" width="32" height="4" rx="2" fill="var(--color-border)" />

        {/* Lower tube — pivots on the fan */}
        <g className="tube-seg-1" style={{ transformOrigin: '60px 204px' }}>
          <rect x="49" y="158" width="22" height="50" rx="10" fill={body} />
          <rect x="49" y="176" width="22" height="6" fill={stripe} />

          {/* Middle tube */}
          <g className="tube-seg-2" style={{ transformOrigin: '60px 162px' }}>
            <rect x="48" y="116" width="24" height="50" rx="10" fill={body} />
            <rect x="48" y="134" width="24" height="6" fill={stripe} />

            {/* Chest */}
            <g className="tube-seg-3" style={{ transformOrigin: '60px 120px' }}>
              <rect x="47" y="76" width="26" height="48" rx="11" fill={body} />

              {/* Left arm */}
              <g className="tube-arm-l" style={{ transformOrigin: '50px 88px' }}>
                <rect x="18" y="83" width="36" height="11" rx="5.5" fill={body} />
                <g className="tube-forearm-l" style={{ transformOrigin: '22px 88px' }}>
                  <rect x="-10" y="83.5" width="36" height="10" rx="5" fill={body} />
                  <rect x="-8" y="83.5" width="5" height="10" fill={stripe} />
                </g>
              </g>

              {/* Right arm */}
              <g className="tube-arm-r" style={{ transformOrigin: '70px 88px' }}>
                <rect x="66" y="83" width="36" height="11" rx="5.5" fill={body} />
                <g className="tube-forearm-r" style={{ transformOrigin: '98px 88px' }}>
                  <rect x="94" y="83.5" width="36" height="10" rx="5" fill={body} />
                  <rect x="123" y="83.5" width="5" height="10" fill={stripe} />
                </g>
              </g>

              {/* Head */}
              <g className="tube-head" style={{ transformOrigin: '60px 80px' }}>
                <rect x="48" y="44" width="24" height="40" rx="12" fill={body} />
                {/* Hair tuft */}
                <path d="M52 46 L49 34 L56 42 L60 30 L63 42 L70 34 L68 46 Z" fill={stripe} />
                {/* Eyes */}
                <circle cx="55" cy="58" r="4.5" fill="#fff" />
                <circle cx="65" cy="58" r="4.5" fill="#fff" />
                <circle className="tube-pupil" cx="55.5" cy="58.5" r="2" fill="#111" />
                <circle className="tube-pupil" cx="65.5" cy="58.5" r="2" fill="#111" />
                {/* Big goofy grin */}
                <path d="M52 67 Q60 77 68 67 Z" fill="#111" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
