export function ReceiptCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[420px] animate-card-rise">
      {/* Torn top edge, evoking a receipt torn from a printer roll */}
      <svg
        viewBox="0 0 400 16"
        preserveAspectRatio="none"
        className="block w-full text-paper"
        aria-hidden="true"
      >
        <path
          d="M0,16 L0,6 L10,12 L20,4 L30,10 L40,2 L50,12 L60,5 L70,11 L80,3 L90,13 L100,6 L110,10 L120,2 L130,12 L140,5 L150,11 L160,3 L170,13 L180,6 L190,10 L200,2 L210,12 L220,5 L230,11 L240,3 L250,13 L260,6 L270,10 L280,2 L290,12 L300,5 L310,11 L320,3 L330,13 L340,6 L350,10 L360,2 L370,12 L380,5 L390,11 L400,4 L400,16 Z"
          fill="currentColor"
        />
      </svg>
      <div className="bg-paper px-6 py-8 text-ink sm:px-8">{children}</div>
      {/* Torn bottom edge, mirrored */}
      <svg
        viewBox="0 0 400 16"
        preserveAspectRatio="none"
        className="block w-full text-paper"
        aria-hidden="true"
      >
        <path
          d="M0,0 L0,10 L10,4 L20,12 L30,6 L40,14 L50,4 L60,11 L70,5 L80,13 L90,3 L100,10 L110,6 L120,14 L130,4 L140,11 L150,5 L160,13 L170,3 L180,10 L190,6 L200,14 L210,4 L220,11 L230,5 L240,13 L250,3 L260,10 L270,6 L280,14 L290,4 L300,11 L310,5 L320,13 L330,3 L340,10 L350,6 L360,14 L370,4 L380,11 L390,5 L400,12 L400,0 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
