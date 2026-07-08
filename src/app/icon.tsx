import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a, #1a1a2e)",
          borderRadius: "64px",
        }}
      >
        <svg
          width="256"
          height="256"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 10L90 85H10L50 10Z"
            fill="url(#g)"
            stroke="#6366f1"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <line x1="50" y1="35" x2="50" y2="60" stroke="#a5b4fc" strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="72" r="4" fill="#a5b4fc" />
          <defs>
            <linearGradient id="g" x1="50" y1="10" x2="50" y2="85">
              <stop stopColor="#818cf8" />
              <stop offset="1" stopColor="#3730a3" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
