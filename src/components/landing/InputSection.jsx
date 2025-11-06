'use client';

import React from 'react';

export default function InputSection() {
  return (
    <div>
      <input
        type="text"
        placeholder="Enter a sentence (max 5 words)..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
      />
      <button className="w-full bg-blue-600 text-white py-2 rounded">Visualize →</button>
    </div>
  );
}
