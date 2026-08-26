export default function CuteEmptyFace({ size = 96 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Face */}
      <circle cx="60" cy="62" r="46" fill="#1e2d45" stroke="#4fd1c5" strokeWidth="2.5" />

      {/* Left eye white */}
      <ellipse cx="42" cy="54" rx="9" ry="10" fill="#e2e8f0" />
      {/* Right eye white */}
      <ellipse cx="78" cy="54" rx="9" ry="10" fill="#e2e8f0" />

      {/* Left pupil */}
      <ellipse cx="44" cy="56" rx="5" ry="6" fill="#0f172a" />
      {/* Right pupil */}
      <ellipse cx="80" cy="56" rx="5" ry="6" fill="#0f172a" />

      {/* Eye highlights */}
      <circle cx="46" cy="53" r="2" fill="white" />
      <circle cx="82" cy="53" r="2" fill="white" />

      {/* Sad brows */}
      <path d="M34 42 Q42 38 48 41" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M72 41 Q78 38 86 42" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Mouth — small sad curve */}
      <path d="M47 78 Q60 72 73 78" stroke="#4fd1c5" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Rosy cheeks */}
      <ellipse cx="33" cy="68" rx="9" ry="5.5" fill="#f687b3" opacity="0.25" />
      <ellipse cx="87" cy="68" rx="9" ry="5.5" fill="#f687b3" opacity="0.25" />

      {/* Floating sparkles */}
      <g opacity="0.45">
        <path d="M10 22 L11.5 18 L13 22 L17 23.5 L13 25 L11.5 29 L10 25 L6 23.5Z" fill="#4fd1c5" />
        <path d="M104 14 L105 11 L106 14 L109 15 L106 16 L105 19 L104 16 L101 15Z" fill="#a78bfa" />
        <path d="M108 88 L109 85 L110 88 L113 89 L110 90 L109 93 L108 90 L105 89Z" fill="#4fd1c5" />
      </g>
    </svg>
  );
}
