import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import ConfirmDialog from './ConfirmDialog';

type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type NotifyOptions = {
  title?: string;
  confirmLabel?: string;
};

type ConfirmContextValue = {
  /** Pide confirmacion (Cancelar / Confirmar). Reemplaza a window.confirm. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Muestra un aviso con un solo boton. Reemplaza a window.alert. */
  notify: (message: ReactNode, options?: NotifyOptions) => Promise<void>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

type DialogState = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive: boolean;
};

const INITIAL: DialogState = {
  open: false,
  title: '',
  confirmLabel: 'Confirmar',
  destructive: false,
};

/**
 * Provee `confirm`/`notify` imperativos (basados en promesas) a todo el panel.
 * Un unico ConfirmDialog vive aqui; las vistas solo llaman al hook `useConfirm`.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>(INITIAL);
  const resolver = useRef<((result: boolean) => void) | null>(null);

  const settle = useCallback((result: boolean) => {
    setState((prev) => ({ ...prev, open: false }));
    const resolve = resolver.current;
    resolver.current = null;
    resolve?.(result);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setState({
      open: true,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? 'Confirmar',
      cancelLabel: options.cancelLabel ?? 'Cancelar',
      destructive: options.destructive ?? false,
    });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const notify = useCallback((message: ReactNode, options?: NotifyOptions) => {
    setState({
      open: true,
      title: options?.title ?? 'Aviso',
      description: message,
      confirmLabel: options?.confirmLabel ?? 'Entendido',
      cancelLabel: undefined,
      destructive: false,
    });
    return new Promise<void>((resolve) => {
      resolver.current = () => resolve();
    });
  }, []);

  const value = useMemo<ConfirmContextValue>(() => ({ confirm, notify }), [confirm, notify]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={state.title}
        description={state.description}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        destructive={state.destructive}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  }
  return ctx;
}
