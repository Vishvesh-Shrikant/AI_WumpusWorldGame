import React from "react";

const legendItems = [
  { key: "🤖", label: "Agent", className: "bg-indigo-500 text-white text-lg" },
  {
    key: "✨",
    label: "Optimum Exit",
    className: "bg-yellow-500/20 text-yellow-300 text-lg",
  },
  {
    key: "[OK]",
    label: "Visited & Safe",
    className: "bg-gray-700 text-gray-400",
  },
  {
    key: "[S]",
    label: "Inferred Safe",
    className: "bg-green-500/10 text-green-300",
  },
  {
    key: "[?]",
    label: "Inferred Risk",
    className: "bg-red-500/10 text-red-300",
  },
  {
    key: " ",
    label: "Unknown",
    className: "bg-gray-800/60 border border-gray-700",
  },
];

const Key = ({ children, className }) => (
  <span
    className={`flex-shrink-0 grid place-items-center w-8 h-6 mr-2.5 rounded-md font-mono font-bold text-sm ${className}`}
  >
    {children}
  </span>
);

export default function Legend() {
  return (
    <div className='text-left bg-gray-900/50 p-3 rounded-xl border border-gray-700'>
      <h4 className='text-base font-bold text-white mt-0 mb-3'>Legend</h4>
      <ul className='list-none p-0 m-0 space-y-1.5'>
        {legendItems.map((item) => (
          <li
            key={item.label}
            className='flex items-center text-sm text-gray-300'
          >
            <Key className={item.className}>{item.key}</Key>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
