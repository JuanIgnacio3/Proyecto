export interface SubgrupoGrupoMini {
  id_grupo: number;
  name_grupo: string;
}

export interface SubgrupoProfesorMini {
  id_profesor: number;
  name_profesor: string;
  sec_name_profesor: string;
}

export interface SubgrupoEstudianteMini {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
}

export interface Subgrupo {
  id_subgrupo: number;
  name_subgrupo: string;
  tipo_subgrupo: string;
  id_grupo: number;
  grupo: SubgrupoGrupoMini;
  profesores: SubgrupoProfesorMini[];
  estudiantes: SubgrupoEstudianteMini[];
}

export interface SubgrupoCreate {
  name_subgrupo: string;
  tipo_subgrupo: string;
  id_grupo: number;
  profesores_ids: number[];
  estudiantes_ids: number[];
}
