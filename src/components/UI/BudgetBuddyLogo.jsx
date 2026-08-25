export default function BudgetBuddyLogo({ size = 40 }) {
  const radius = Math.round(size * 0.28);
  const iconSize = Math.round(size * 0.58);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(135deg, #4fd1c5, #9f7aea)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(79,209,197,0.35)',
        flexShrink: 0,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Coin outer ring */}
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" opacity="0.85" />
        {/* Dollar vertical bar */}
        <line x1="12" y1="6.5" x2="12" y2="17.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
        {/* Upper S curve */}
        <path
          d="M14.5 9.2C14.5 9.2 13.7 7.8 12 7.8C9.8 7.8 8.5 9 8.5 10.3C8.5 11.6 9.8 12.1 12 12.5"
          stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"
        />
        {/* Lower S curve */}
        <path
          d="M9.5 14.8C9.5 14.8 10.3 16.2 12 16.2C14.2 16.2 15.5 15 15.5 13.7C15.5 12.4 14.2 11.9 12 11.5"
          stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"
        />
      </svg>
    </div>
  );
}
