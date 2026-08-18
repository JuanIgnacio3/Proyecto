import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState } from 'react';
import CardBox from 'src/components/shared/CardBox';
import { FormSelect, SearchInput, useConfirm } from 'src/components/institutional';
import { Button } from 'src/components/ui/button';
import { Label } from 'src/components/ui/label';
import { ApiError } from 'src/lib/api';
import { matchText } from 'src/lib/search';
import { listGrupos } from 'src/lib/grupos';
import {
  listPorGrupo,
  listSinGrupo,
  matriculaMasiva,
  setGrupoEstudiante,
} from 'src/lib/matricula';
import type { Grupo } from 'src/types/grupo';
import type { EstudianteMatricula } from 'src/types/matricula';

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const Matricula = () => {
  const { confirm } = useConfirm();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Pendientes (sin grupo)
  const [pendientes, setPendientes] = useState<EstudianteMatricula[]>([]);
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [grupoDestino, setGrupoDestino] = useState('');
  const [matriculando, setMatriculando] = useState(false);

  // Matriculados por grupo
  const [grupoVer, setGrupoVer] = useState('');
  const [matriculados, setMatriculados] = useState<EstudianteMatricula[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const [qPend, setQPend] = useState('');
  const [qMat, setQMat] = useState('');

  const matchEst = (e: EstudianteMatricula, q: string) =>
    matchText(q, e.name_estudiante, e.sec_name_estudiante, e.num_documento_estudiante);
  const pendientesFiltrados = pendientes.filter((e) => matchEst(e, qPend));
  const matriculadosFiltrados = matriculados.filter((e) => matchEst(e, qMat));

  const loadPendientes = useCallback(async () => {
    try {
      setPendientes(await listSinGrupo());
      setSeleccion([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los pendientes.');
    }
  }, []);

  const loadMatriculados = useCallback(async (grupo: string) => {
    if (!grupo) {
      setMatriculados([]);
      return;
    }
    setLoadingRoster(true);
    try {
      setMatriculados(await listPorGrupo(Number(grupo)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el grupo.');
    } finally {
      setLoadingRoster(false);
    }
  }, []);

  useEffect(() => {
    listGrupos()
      .then(setGrupos)
      .catch(() => setError('No se pudieron cargar los grupos.'));
    loadPendientes();
  }, [loadPendientes]);

  useEffect(() => {
    loadMatriculados(grupoVer);
  }, [grupoVer, loadMatriculados]);

  const toggle = (id: number) =>
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleMatricular = async () => {
    if (!grupoDestino || seleccion.length === 0) return;
    setMatriculando(true);
    setError(null);
    setMensaje(null);
    try {
      await matriculaMasiva(Number(grupoDestino), seleccion);
      setMensaje(`${seleccion.length} estudiante(s) matriculado(s).`);
      await loadPendientes();
      if (grupoVer === grupoDestino) await loadMatriculados(grupoVer);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo matricular.');
    } finally {
      setMatriculando(false);
    }
  };

  const handleRetirar = async (est: EstudianteMatricula) => {
    if (
      !(await confirm({
        title: `Retirar a ${est.name_estudiante} ${est.sec_name_estudiante} del grupo?`,
        confirmLabel: 'Retirar',
        destructive: true,
      }))
    )
      return;
    setError(null);
    setMensaje(null);
    try {
      await setGrupoEstudiante(est.id_estudiante, null);
      await loadMatriculados(grupoVer);
      await loadPendientes();
      setMensaje('Estudiante retirado del grupo.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo retirar.');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CardBox className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
              <Icon icon="solar:document-add-linear" width={24} height={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Matricula</h1>
              <p className="mt-1 text-muted-foreground">
                Asigne estudiantes a un grupo y gestione la matricula por grupo.
              </p>
            </div>
          </div>
        </CardBox>
      </div>

      {error && (
        <div className="col-span-12">
          <div className="rounded-md bg-lighterror px-4 py-3 text-sm text-error">{error}</div>
        </div>
      )}
      {mensaje && (
        <div className="col-span-12">
          <div className="rounded-md bg-lightsuccess px-4 py-3 text-sm text-success">
            {mensaje}
          </div>
        </div>
      )}

      {/* Pendientes de matricula */}
      <div className="col-span-12 lg:col-span-6">
        <CardBox className="p-0 overflow-hidden">
          <div className="border-b border-ld px-6 py-4">
            <h2 className="text-lg font-semibold">Pendientes de matricula</h2>
            <p className="text-sm text-muted-foreground">
              {pendientes.length} estudiante(s) sin grupo asignado.
            </p>
            {pendientes.length > 0 && (
              <div className="mt-3">
                <SearchInput
                  value={qPend}
                  onChange={setQPend}
                  placeholder="Buscar estudiante..."
                />
              </div>
            )}
          </div>

          {pendientes.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground">
              Todos los estudiantes activos estan matriculados.
            </div>
          ) : (
            <>
              <div className="max-h-72 overflow-y-auto">
                {pendientesFiltrados.length === 0 ? (
                  <p className="px-6 py-6 text-center text-sm text-muted-foreground">
                    Sin coincidencias.
                  </p>
                ) : (
                <table className="w-full text-left">
                  <tbody>
                    {pendientesFiltrados.map((est) => (
                      <tr key={est.id_estudiante} className="border-b border-ld last:border-0">
                        <td className="w-10 px-6 py-3">
                          <input
                            type="checkbox"
                            checked={seleccion.includes(est.id_estudiante)}
                            onChange={() => toggle(est.id_estudiante)}
                          />
                        </td>
                        <td className="px-2 py-3">
                          <p className="font-medium">
                            {est.name_estudiante} {est.sec_name_estudiante}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Doc: {est.num_documento_estudiante}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-ld px-6 py-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label htmlFor="grupoDestino">Matricular en</Label>
                  <FormSelect
                    id="grupoDestino"
                    className={`${inputClass} mt-1`}
                    value={grupoDestino}
                    onChange={(e) => setGrupoDestino(e.target.value)}
                  >
                    <option value="">Seleccione grupo...</option>
                    {grupos.map((g) => (
                      <option key={g.id_grupo} value={g.id_grupo}>
                        {g.name_grupo}
                        {g.grado ? ` (${g.grado})` : ''}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <Button
                  onClick={handleMatricular}
                  disabled={!grupoDestino || seleccion.length === 0 || matriculando}
                >
                  {matriculando ? 'Matriculando...' : `Matricular (${seleccion.length})`}
                </Button>
              </div>
            </>
          )}
        </CardBox>
      </div>

      {/* Matriculados por grupo */}
      <div className="col-span-12 lg:col-span-6">
        <CardBox className="p-0 overflow-hidden">
          <div className="border-b border-ld px-6 py-4">
            <h2 className="text-lg font-semibold">Matriculados por grupo</h2>
            <div className="mt-2">
              <FormSelect
                className={`${inputClass}`}
                value={grupoVer}
                onChange={(e) => setGrupoVer(e.target.value)}
              >
                <option value="">Seleccione un grupo...</option>
                {grupos.map((g) => (
                  <option key={g.id_grupo} value={g.id_grupo}>
                    {g.name_grupo}
                        {g.grado ? ` (${g.grado})` : ''}
                  </option>
                ))}
              </FormSelect>
            </div>
            {grupoVer && (
              <div className="mt-3">
                <SearchInput value={qMat} onChange={setQMat} placeholder="Buscar estudiante..." />
              </div>
            )}
          </div>

          {!grupoVer ? (
            <div className="px-6 py-10 text-center text-muted-foreground">
              Seleccione un grupo para ver su matricula.
            </div>
          ) : loadingRoster ? (
            <div className="px-6 py-10 text-center text-muted-foreground">Cargando...</div>
          ) : matriculados.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground">
              Este grupo no tiene estudiantes matriculados.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {matriculadosFiltrados.length === 0 ? (
                <p className="px-6 py-6 text-center text-sm text-muted-foreground">
                  Sin coincidencias.
                </p>
              ) : (
              <table className="w-full text-left">
                <tbody>
                  {matriculadosFiltrados.map((est) => (
                    <tr key={est.id_estudiante} className="border-b border-ld last:border-0">
                      <td className="px-6 py-3">
                        <p className="font-medium">
                          {est.name_estudiante} {est.sec_name_estudiante}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Doc: {est.num_documento_estudiante}
                        </p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button
                          variant="ghosterror"
                          size="sm"
                          onClick={() => handleRetirar(est)}
                        >
                          Retirar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          )}
        </CardBox>
      </div>
    </div>
  );
};

export default Matricula;
