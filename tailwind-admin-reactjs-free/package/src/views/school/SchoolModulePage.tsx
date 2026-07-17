import { Icon } from '@iconify/react';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';

type SchoolModulePageProps = {
  title: string;
  description: string;
  icon: string;
  primaryAction?: string;
  checklist?: string[];
};

const defaultChecklist = [
  'Definir campos principales',
  'Disenar tabla/listado',
  'Conectar con API FastAPI',
  'Agregar permisos por rol',
];

const SchoolModulePage = ({
  title,
  description,
  icon,
  primaryAction = 'Nuevo registro',
  checklist = defaultChecklist,
}: SchoolModulePageProps) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CardBox className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-secondary">
                <Icon icon={icon} width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="mt-2 max-w-3xl text-muted-foreground">{description}</p>
              </div>
            </div>
            <Button className="w-full rounded-md bg-primary text-secondary hover:bg-primaryemphasis md:w-auto">
              {primaryAction}
            </Button>
          </div>
        </CardBox>
      </div>

      <div className="col-span-12 lg:col-span-8">
        <CardBox className="p-0 overflow-hidden">
          <div className="border-b border-ld px-6 py-4">
            <h2 className="text-lg font-semibold">Listado</h2>
            <p className="text-sm text-muted-foreground">
              Espacio reservado para la tabla principal del modulo.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-ld bg-primary text-secondary">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold">Nombre</th>
                  <th className="px-6 py-3 text-sm font-semibold">Estado</th>
                  <th className="px-6 py-3 text-sm font-semibold">Ultima actualizacion</th>
                </tr>
              </thead>
              <tbody>
                {['Registro de ejemplo', 'Pendiente de configurar', 'Datos de prueba'].map(
                  (row, index) => (
                    <tr key={row} className="border-b border-ld last:border-0">
                      <td className="px-6 py-4 font-medium">{row}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {index === 0 ? 'Activo' : 'Borrador'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">Sin backend</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </CardBox>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <CardBox className="p-6">
          <h2 className="text-lg font-semibold">Pendiente para este modulo</h2>
          <div className="mt-4 space-y-3">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <span className="size-2 rounded-full bg-secondary" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardBox>
      </div>
    </div>
  );
};

export default SchoolModulePage;
