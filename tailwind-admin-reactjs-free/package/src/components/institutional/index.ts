// Componentes institucionales: capa reutilizable sobre los primitives (ui/*).
// No reemplazan a Button/Card/Dialog; los componen para los patrones comunes
// de los modulos (cabecera, estados, formularios CRUD).
export { default as PageHeader } from './PageHeader';
export { default as Banner } from './Banner';
export type { BannerTone } from './Banner';
export { default as EmptyState } from './EmptyState';
export { default as LoadingState } from './LoadingState';
export { default as StatusBadge } from './StatusBadge';
export type { BadgeTone } from './StatusBadge';
export { default as CrudFormDialog } from './CrudFormDialog';
