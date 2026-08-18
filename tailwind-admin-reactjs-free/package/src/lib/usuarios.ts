import { api } from './api';
import type { Rol } from 'src/types/estudiante';
import type { UsuarioAdmin } from 'src/types/usuario';

export function listUsuarios(): Promise<UsuarioAdmin[]> {
  return api.get<UsuarioAdmin[]>('/usuarios/');
}

export function listRoles(): Promise<Rol[]> {
  return api.get<Rol[]>('/catalogos/roles');
}

export function updateUsuarioRol(id: number, idRol: number): Promise<UsuarioAdmin> {
  return api.put<UsuarioAdmin>(`/usuarios/${id}`, { id_rol: idRol });
}

export function setUsuarioActivo(id: number, activo: boolean): Promise<UsuarioAdmin> {
  return api.put<UsuarioAdmin>(`/usuarios/${id}`, { activo });
}
