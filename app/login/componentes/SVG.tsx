"use client";

export default function SVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Neural Network Animation */}
      <defs>
        <style>{`
              @keyframes blink1 { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
              @keyframes blink2 { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
              @keyframes blink3 { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
              @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
              .node1 { animation: blink1 3s ease-in-out infinite; }
              .node2 { animation: blink2 4s ease-in-out infinite; }
              .node3 { animation: blink3 3.5s ease-in-out infinite; }
              .node4 { animation: blink1 4.5s ease-in-out infinite; }
              .node5 { animation: blink2 3.2s ease-in-out infinite; }
              .node6 { animation: blink3 4.2s ease-in-out infinite; }
              .connection { animation: pulse 4s ease-in-out infinite; }
            `}</style>
      </defs>

      {/* Connections */}
      <g
        className="connection"
        stroke="url(#gradient1)"
        strokeWidth="2"
        fill="none"
      >
        <line x1="15%" y1="20%" x2="35%" y2="40%" />
        <line x1="35%" y1="40%" x2="65%" y2="35%" />
        <line x1="65%" y1="35%" x2="85%" y2="25%" />
        <line x1="15%" y1="20%" x2="25%" y2="70%" />
        <line x1="25%" y1="70%" x2="55%" y2="75%" />
        <line x1="55%" y1="75%" x2="85%" y2="25%" />
        <line x1="35%" y1="40%" x2="55%" y2="75%" />
        <line x1="65%" y1="35%" x2="75%" y2="80%" />
        <line x1="25%" y1="70%" x2="75%" y2="80%" />
        <line x1="15%" y1="20%" x2="50%" y2="15%" />
        <line x1="50%" y1="15%" x2="85%" y2="25%" />
        <line x1="35%" y1="40%" x2="25%" y2="70%" />
        <line x1="50%" y1="15%" x2="65%" y2="35%" />
        <line x1="10%" y1="50%" x2="35%" y2="40%" />
        <line x1="10%" y1="50%" x2="25%" y2="70%" />
        <line x1="90%" y1="60%" x2="85%" y2="25%" />
        <line x1="90%" y1="60%" x2="75%" y2="80%" />
      </g>

      {/* Nodes */}
      <circle
        className="node1"
        cx="15%"
        cy="20%"
        r="6"
        fill="#6366f1"
        opacity="0.8"
      />
      <circle
        className="node2"
        cx="35%"
        cy="40%"
        r="7"
        fill="#8b5cf6"
        opacity="0.8"
      />
      <circle
        className="node3"
        cx="65%"
        cy="35%"
        r="6"
        fill="#06b6d4"
        opacity="0.8"
      />
      <circle
        className="node4"
        cx="85%"
        cy="25%"
        r="7"
        fill="#10b981"
        opacity="0.8"
      />
      <circle
        className="node5"
        cx="25%"
        cy="70%"
        r="6"
        fill="#8b5cf6"
        opacity="0.8"
      />
      <circle
        className="node6"
        cx="55%"
        cy="75%"
        r="7"
        fill="#06b6d4"
        opacity="0.8"
      />
      <circle
        className="node1"
        cx="75%"
        cy="80%"
        r="6"
        fill="#6366f1"
        opacity="0.8"
      />
      <circle
        className="node3"
        cx="50%"
        cy="15%"
        r="6"
        fill="#a78bfa"
        opacity="0.8"
      />
      <circle
        className="node5"
        cx="10%"
        cy="50%"
        r="6"
        fill="#f472b6"
        opacity="0.8"
      />
      <circle
        className="node2"
        cx="90%"
        cy="60%"
        r="7"
        fill="#34d399"
        opacity="0.8"
      />

      {/* Gradient for connections */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
