import CostaRicaMark from 'src/components/brand/CostaRicaMark';

const FullLogo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-md bg-primary text-secondary">
        <CostaRicaMark className="size-8" />
      </div>
      <div className="leading-tight">
        <p className="text-base font-semibold text-sidebar-foreground dark:text-white">
          Colegio CR
        </p>
        <p className="text-xs text-muted-foreground">Gestion institucional</p>
      </div>
    </div>
  );
};

export default FullLogo;
