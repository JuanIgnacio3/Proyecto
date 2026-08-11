import { useState, type FormEvent } from 'react';
import { Icon } from '@iconify/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { PasswordInput } from 'src/components/ui/password-input';
import { Label } from 'src/components/ui/label';
import { api, getErrorMessage } from 'src/lib/api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MIN_LEN = 8;

/** Permite al usuario autenticado cambiar su propia contrasena. */
const ChangePasswordDialog = ({ open, onOpenChange }: Props) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetFields = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      resetFields();
      setError(null);
      setOk(false);
    }
    onOpenChange(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < MIN_LEN) {
      setError(`La nueva contrasena debe tener al menos ${MIN_LEN} caracteres.`);
      return;
    }
    if (!/[a-zA-Z]/.test(next) || !/[0-9]/.test(next)) {
      setError('La nueva contrasena debe incluir al menos una letra y un numero.');
      return;
    }
    if (next !== confirm) {
      setError('La confirmacion no coincide con la nueva contrasena.');
      return;
    }
    if (next === current) {
      setError('La nueva contrasena debe ser distinta de la actual.');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/me/password', {
        current_password: current,
        new_password: next,
      });
      resetFields();
      setOk(true);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cambiar la contrasena.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Cambiar contrasena</DialogTitle>
        </DialogHeader>

        {ok ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Icon icon="solar:check-circle-bold" width={40} className="text-success" />
            <p className="text-sm">Tu contrasena se actualizo correctamente.</p>
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-current">Contrasena actual</Label>
              <PasswordInput
                id="cp-current"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-next">Nueva contrasena</Label>
              <PasswordInput
                id="cp-next"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={MIN_LEN}
              />
              <p className="text-xs text-muted-foreground">
                Minimo {MIN_LEN} caracteres, con al menos una letra y un numero.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-confirm">Confirmar nueva contrasena</Label>
              <PasswordInput
                id="cp-confirm"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
