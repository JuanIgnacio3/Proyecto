type CostaRicaMarkProps = {
  className?: string;
};

const CostaRicaMark = ({ className }: CostaRicaMarkProps) => {
  return (
    <svg
      viewBox="0 0 96 96"
      role="img"
      aria-label="Mapa de Costa Rica"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="11" y="11" width="74" height="74" rx="3" stroke="currentColor" strokeWidth="5" />
      <path
        d="M27.5 33.4 34 30l10.1 4.7 7.2 3.2 8.8-4 7.1 4.2 3 8.7 5.4 8.5-1.9 4.7 5.1 7.3-4.8 2.6-8.8-4.3-8.3 2.3-7.4-5.8-9.1-.8-4.6-7.3-9.7-2.9-2.3-6.4 5.4-3.3-4.4-4.9 6.7-3.1Z"
        fill="currentColor"
      />
      <path
        d="M22.1 67.1c2.8-1.7 5.6-1.4 7.8.6-1.6 2.9-5.9 4.1-9 2.9-.2-1.3.2-2.4 1.2-3.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default CostaRicaMark;
