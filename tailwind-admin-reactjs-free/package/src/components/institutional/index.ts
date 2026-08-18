// Componentes institucionales: capa reutilizable sobre los primitives (ui/*).
// No reemplazan a Button/Card/Dialog; los componen para los patrones comunes
// de los modulos (cabecera, estados, formularios CRUD).
export { default as PageContainer } from './PageContainer';
export { default as PageHeader } from './PageHeader';
export { default as PageActions } from './PageActions';
export { default as SectionCard } from './SectionCard';
export { default as CrudTable } from './CrudTable';
export type { Column } from './CrudTable';
export { default as Pagination } from './Pagination';
export { default as RowActions } from './RowActions';
export { default as Banner } from './Banner';
export type { BannerTone } from './Banner';
export { default as EmptyState } from './EmptyState';
export { default as LoadingState } from './LoadingState';
export { default as StatusBadge } from './StatusBadge';
export type { BadgeTone } from './StatusBadge';
export { default as SearchInput } from './SearchInput';
export { default as FormField } from './FormField';
export { default as PasswordInput } from './PasswordInput';
export { default as FormSelect } from './FormSelect';
export { default as CheckboxList } from './CheckboxList';
export { default as CrudFormDialog } from './CrudFormDialog';
export { default as CrudScaffold } from './CrudScaffold';
export { default as PublicationBadge } from './PublicationBadge';
export { default as VisibilityFilter } from './VisibilityFilter';
export type { Visibilidad } from './VisibilityFilter';
export { default as ConfirmDialog } from './ConfirmDialog';
export { ConfirmProvider, useConfirm } from './ConfirmProvider';
