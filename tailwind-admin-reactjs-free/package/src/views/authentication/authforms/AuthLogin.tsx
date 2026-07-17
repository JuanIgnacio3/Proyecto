import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { ApiError } from 'src/lib/api';

const AuthLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(correo, password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? 'Correo o contrasena incorrectos.' : err.message);
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="correo">Correo institucional</Label>
        </div>
        <Input
          id="correo"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="usuario@ctpsanpedrodebarva.ed.cr"
          required
        />
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="userpwd">Contrasena</Label>
        </div>
        <Input
          id="userpwd"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full mt-2" disabled={submitting}>
        {submitting ? 'Ingresando...' : 'Iniciar sesion'}
      </Button>
    </form>
  );
};

export default AuthLogin;
