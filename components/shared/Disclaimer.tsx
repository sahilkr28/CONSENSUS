import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#FACC15]/20 bg-[#FACC15]/5 p-4 text-xs leading-relaxed text-[#FACC15] sm:items-center">
      <AlertTriangle className="h-5 w-5 shrink-0 text-[#FACC15]" />
      <div>
        <span className="font-bold uppercase tracking-wider text-[#FACC15]">Legal Notice:</span> Consensus is an educational/portfolio demonstration. Nothing here is financial advice. Do not make investment decisions based solely on this output.
      </div>
    </div>
  );
}
