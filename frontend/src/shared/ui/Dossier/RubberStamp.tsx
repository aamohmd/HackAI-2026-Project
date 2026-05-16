import React from 'react';

export const RubberStamp = ({ text }: { text: string }) => (
  <div className="absolute -bottom-2 -right-2 transform -rotate-12 border-4 border-wax/40 text-wax/50 px-3 py-1 font-serif font-black uppercase text-sm rounded shadow-sm pointer-events-none select-none">
    {text}
  </div>
);
