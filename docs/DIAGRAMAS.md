# Diagramas técnicos

Documentación visual de referencia para quien va a modificar el sistema. Los diagramas del README cubren el sistema completo, el flujo de publicación, la autenticación, la infraestructura y el ERD simplificado. Aquí van los de mayor profundidad.

> Nota: `erDiagram` de Mermaid no soporta color por zonas; la separación de contextos se transmite por orden y comentarios.

---

## 1. ERD completo (19 tablas)

Esquema conceptual completo del modelo persistente. Las tablas puente aparecen explícitas; la cardinalidad refleja la nulabilidad real de las FKs.

```mermaid
erDiagram
    ROL ||--o{ USUARIO : "clasifica"
    USUARIO ||--o| ESTUDIANTE : "es"
    USUARIO ||--o| PROFESOR : "es"
    USUARIO ||--o| ADMINISTRATIVO : "es"
    USUARIO ||--o| ENCARGADO : "es"
    USUARIO ||--o{ COMUNICADO : "publica"

    TIPO_DOCUMENTO ||--o{ ESTUDIANTE : "identifica"
    TIPO_DOCUMENTO ||--o{ PROFESOR : "identifica"
    TIPO_DOCUMENTO ||--o{ ENCARGADO : "identifica"
    TIPO_DOCUMENTO ||--o{ ADMINISTRATIVO : "identifica"
    ENCARGADO ||--o{ ENCARGADO_ESTUDIANTE : "vincula"
    ESTUDIANTE ||--o{ ENCARGADO_ESTUDIANTE : "vincula"

    ASIGNATURA ||--o{ GRUPO : "define"
    GRUPO |o--o{ ESTUDIANTE : "agrupa"
    GRUPO |o--o{ PROFESOR : "asigna"
    GRUPO ||--o{ SUBGRUPO : "contiene"
    SUBGRUPO ||--o{ SUBGRUPO_ESTUDIANTE : "incluye"
    ESTUDIANTE ||--o{ SUBGRUPO_ESTUDIANTE : "participa"
    SUBGRUPO ||--o{ SUBGRUPO_PROFESOR : "incluye"
    PROFESOR ||--o{ SUBGRUPO_PROFESOR : "imparte"

    GRUPO ||--o{ EVALUACION : "programa"
    GRUPO ||--o{ ASISTENCIA : "registra"
    ESTUDIANTE ||--o{ ASISTENCIA : "tiene"
    ESTUDIANTE ||--o{ NOTA : "recibe"
    EVALUACION ||--o{ NOTA : "contiene"

    ROL { int id_rol PK
        string name_rol }
    TIPO_DOCUMENTO { int id_tipo_documento PK
        string name_tipo_documento }
    USUARIO { int id_usuario PK
        string correo_institucional
        int id_rol FK
        bool activo }
    ESTUDIANTE { int id_estudiante PK
        int id_usuario FK
        string name_estudiante
        string num_documento_estudiante
        int id_tipo_documento FK
        int id_grupo FK }
    PROFESOR { int id_profesor PK
        int id_usuario FK
        string name_profesor
        int id_tipo_documento FK
        int id_grupo FK }
    ADMINISTRATIVO { int id_administrativo PK
        int id_usuario FK
        string name_administrativo
        int id_tipo_documento FK
        string cargo }
    ENCARGADO { int id_encargado PK
        int id_usuario FK
        string name_encargado
        int id_tipo_documento FK
        string parentesco }
    ENCARGADO_ESTUDIANTE { int id_encargado_estudiante PK
        int id_encargado FK
        int id_estudiante FK }
    ASIGNATURA { int id_asignatura PK
        string name_asignatura }
    GRUPO { int id_grupo PK
        string name_grupo
        int id_asignatura FK }
    SUBGRUPO { int id_subgrupo PK
        string name_subgrupo
        string tipo_subgrupo
        int id_grupo FK }
    SUBGRUPO_ESTUDIANTE { int id_subgrupo_estudiante PK
        int id_estudiante FK
        int id_subgrupo FK }
    SUBGRUPO_PROFESOR { int id_subgrupo_profesor PK
        int id_profesor FK
        int id_subgrupo FK }
    EVALUACION { int id_evaluacion PK
        int id_grupo FK
        string name_evaluacion
        int periodo
        decimal porcentaje }
    NOTA { int id_nota PK
        int id_evaluacion FK
        int id_estudiante FK
        decimal valor }
    ASISTENCIA { int id_asistencia PK
        int id_estudiante FK
        int id_grupo FK
        date fecha
        string estado }
    COMUNICADO { int id_comunicado PK
        string titulo
        int id_autor FK
        string dirigido_a
        bool es_publico
        string categoria }
    EVENTO { int id_evento PK
        string titulo
        date fecha_inicio
        string tipo
        bool es_publico }
    ESPECIALIDAD { int id_especialidad PK
        string nombre
        string nivel
        bool es_publico
        int orden }
```

### Observaciones del modelo (derivadas del código)

- **Sin eje temporal** *(hecho)*: no existe `AñoLectivo`/`Periodo` como entidad; `evaluacion.periodo` es un `int` suelto.
- **Matrícula como atributo** *(hecho)*: la pertenencia de un estudiante a un grupo es `estudiante.id_grupo` (mutable), no una entidad con historia.
- **`EVENTO` y `ESPECIALIDAD` standalone** *(hecho)*: sin FKs; la especialidad del estudiante no está modelada (es contenido publicable).
- **`GRUPO` mezcla sección y asignatura** *(hecho: `id_asignatura` NOT NULL + `estudiante.id_grupo` único)*.

---

## 2. Agregados del dominio (fronteras de consistencia)

Dónde viven las invariantes reales (criterio: `cascade` + `UniqueConstraint` en el código).

```mermaid
flowchart LR
    subgraph AG1["Agregado · Evaluación (fuerte)"]
        direction TB
        EVAL["Evaluación · raíz"]:::root
        NOTA["Nota"]:::data
        INV1["Invariante: 1 nota por<br/>(evaluación, estudiante)"]:::note
        EVAL -->|"posee · cascade"| NOTA
        EVAL -.-> INV1
    end
    subgraph AG2["Agregado · Encargado (fuerte)"]
        direction TB
        ENC["Encargado · raíz"]:::root
        ECE["EncargadoEstudiante"]:::data
        INV2["Invariante: vínculo único<br/>(encargado, estudiante)"]:::note
        ENC -->|"posee · cascade"| ECE
        ENC -.-> INV2
    end
    subgraph AG3["Agregado · SubGrupo (fuerte)"]
        direction TB
        SG["SubGrupo · raíz"]:::root
        SGE["SubGrupoEstudiante"]:::data
        SGP["SubGrupoProfesor"]:::data
        SG -->|"posee · cascade"| SGE
        SG -->|"posee · cascade"| SGP
    end
    subgraph AG4["Grupo (agregado ambiguo)"]
        direction TB
        GRP["Grupo · ¿raíz?"]:::weakroot
        N4["Sin ownership (no cascade);<br/>mezcla sección + asignatura"]:::note
        GRP -.-> N4
    end

    ASIST["Asistencia · entidad suelta"]:::data
    REP["Reporte · PROYECCIÓN<br/>(no agregado; al vuelo)"]:::projection
    REP -. "lee" .-> NOTA
    REP -. "lee" .-> ASIST

    classDef root fill:#fff8e1,stroke:#000,stroke-width:3px,color:#000
    classDef weakroot fill:#fff8e1,stroke:#f9a825,stroke-dasharray:5 4,color:#000
    classDef data fill:#fff8e1,stroke:#f9a825,color:#000
    classDef note fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:3 3,color:#000
    classDef projection fill:#f5f5f5,stroke:#616161,stroke-width:2px,stroke-dasharray:5 4,color:#000
```

Las invariantes de **negocio** (rango de nota, estado de asistencia, audiencia por rol) viven en los *handlers*, no en el modelo (dominio anémico).

---

## 3. Desarrollo vs Producción

Qué cambia entre ambos entornos.

```mermaid
flowchart LR
    subgraph DEV["DESARROLLO · iteración rápida"]
        direction TB
        DBROWSER(["Navegador · localhost"]):::actor
        VITE["Vite dev server<br/>hot reload · :5173"]:::app
        UVI["uvicorn --reload<br/>bind-mount · :8000 expuesto"]:::app
        PGDEV[("PostgreSQL<br/>:5432 expuesto al host")]:::data
        DNOTE["Sin Nginx · CORS activo<br/>puertos abiertos (5173/8000/5432)<br/>frontend fuera de compose (Vite)"]:::note
        DBROWSER -->|"carga SPA"| VITE
        VITE -->|"/api · localhost:8000 (CORS)"| UVI
        UVI -->|"SQLAlchemy"| PGDEV
    end

    subgraph PROD["PRODUCCIÓN · seguridad y aislamiento"]
        direction TB
        PBROWSER(["Navegador · Internet"]):::actor
        BUILD["build multi-stage<br/>React → dist (solo build)"]:::build
        NGINX["Nginx<br/>estáticos + reverse proxy · :80"]:::app
        API["FastAPI · 4 workers · no-root<br/>migra al iniciar · sin puerto"]:::app
        PGPROD[("PostgreSQL<br/>interno · sin puerto")]:::data
        PNOTE["Único punto de entrada (:80)<br/>backend y BD sin puerto al host<br/>imagen inmutable"]:::note
        PBROWSER -->|"HTTP/HTTPS"| NGINX
        BUILD -. "dist servido" .-> NGINX
        NGINX -->|"proxy /api · mismo origen"| API
        API -->|"SQLAlchemy"| PGPROD
    end

    classDef actor fill:#eceff1,stroke:#546e7a,color:#000
    classDef app fill:#f5f5f5,stroke:#616161,color:#000
    classDef data fill:#fff8e1,stroke:#f9a825,color:#000
    classDef note fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:3 3,color:#000
    classDef build fill:#fafafa,stroke:#9e9e9e,stroke-dasharray:4 3,color:#000
```
