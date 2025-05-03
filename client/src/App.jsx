function App() {
  return (
    <>
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <p className="mt-4 text-gray-600 0 text-lg font-semibold">
            Your Shelf-Society project is ready for development
          </p>

          {/* Elephant SVG */}
          <div className="mt-8">
            <svg viewBox="0 0 400 300" className="w-64 h-64 mx-auto">
              {/* Body */}
              <ellipse cx="220" cy="180" rx="120" ry="80" fill="#86898f" />

              {/* Head */}
              <ellipse cx="100" cy="120" rx="60" ry="70" fill="#86898f" />

              {/* Ears */}
              <ellipse cx="50" cy="80" rx="30" ry="40" fill="#86898f" />
              <ellipse cx="150" cy="80" rx="30" ry="40" fill="#86898f" />

              {/* Eyes */}
              <circle cx="85" cy="100" r="8" fill="black" />
              <circle cx="115" cy="100" r="8" fill="black" />
              <circle cx="87" cy="98" r="3" fill="white" />
              <circle cx="117" cy="98" r="3" fill="white" />

              {/* Trunk */}
              <path
                d="M100,130 Q80,170 60,210 Q70,220 90,210 Q85,170 100,130"
                fill="#86898f"
              />

              {/* Tusks */}
              <path
                d="M85,140 Q70,160 65,180"
                stroke="white"
                strokeWidth="5"
                fill="none"
              />
              <path
                d="M115,140 Q130,160 135,180"
                stroke="white"
                strokeWidth="5"
                fill="none"
              />

              {/* Legs */}
              <rect
                x="160"
                y="230"
                width="20"
                height="50"
                rx="5"
                fill="#86898f"
              />
              <rect
                x="200"
                y="230"
                width="20"
                height="50"
                rx="5"
                fill="#86898f"
              />
              <rect
                x="240"
                y="230"
                width="20"
                height="50"
                rx="5"
                fill="#86898f"
              />
              <rect
                x="280"
                y="230"
                width="20"
                height="50"
                rx="5"
                fill="#86898f"
              />

              {/* Tail */}
              <path
                d="M330,170 Q350,160 360,180"
                stroke="#86898f"
                strokeWidth="8"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
