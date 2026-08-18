import type { Rol } from 'src/types/estudiante';

export interface UsuarioAdmin {
  id_usuario: number;
  correo_institucional: string;
  activo: boolean;
  rol: Rol;
  /** "Estudiante" | "Profesor" | "Encargado" | "Administrativo" | "Sistema" */
  tipo: string;
  nombre_completo: string;
}
