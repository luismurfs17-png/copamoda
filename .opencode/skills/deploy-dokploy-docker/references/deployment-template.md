# Plantilla de despliegue Dokploy

Completar con valores verificados. No guardar secretos reales en este archivo.

## Identidad

```yaml
project_name: REEMPLAZAR
owner: REEMPLAZAR
repository: https://github.com/OWNER/REPOSITORY
production_branch: main
production_url: https://app.example.com
health_url: https://app.example.com/api/health
hosting: VPS_PROVIDER
deployment_platform: Dokploy
```

## Código y runtime

```yaml
language: REEMPLAZAR
runtime_version: REEMPLAZAR
package_manager: REEMPLAZAR
lockfile: REEMPLAZAR
monorepo: false
workspaces: []
install_command: REEMPLAZAR
lint_command: REEMPLAZAR
test_command: REEMPLAZAR
build_command: REEMPLAZAR
start_command: REEMPLAZAR
migrate_command: REEMPLAZAR
seed_command: REEMPLAZAR
```

## Docker

```yaml
build_type: Dockerfile
dockerfile_path: Dockerfile
docker_context_path: .
docker_build_stage: null
base_image: REEMPLAZAR
container_port: REEMPLAZAR
run_as_non_root: REVISAR
healthcheck: REVISAR
replicas: 1
```

Checklist:

- [ ] Imagen base con soporte vigente.
- [ ] Lockfile incluido.
- [ ] Build reproducible.
- [ ] Dependencias nativas Linux comprobadas.
- [ ] Secretos fuera de capas.
- [ ] Runtime contiene artefactos necesarios.
- [ ] Puerto coincide con el servidor.
- [ ] Proceso maneja `SIGTERM`.
- [ ] No hay `docker.sock`.
- [ ] No hay modo privilegiado.
- [ ] No hay datos mutables dentro de la imagen.

## Git y auto deploy

```yaml
provider: GitHub
account: REEMPLAZAR
repository: REEMPLAZAR
branch: main
build_path: /
trigger_type: On Push
auto_deploy: true
```

Checklist:

- [ ] Repo y rama existen.
- [ ] Dokploy tiene acceso.
- [ ] El commit esperado está en el remoto.
- [ ] Push a producción fue solicitado.
- [ ] No hay secretos o bases de datos en Git.
- [ ] Existe estrategia de ramas para varios agentes.

## Variables

Clasificar cada variable:

| Variable | Build | Runtime | Secreto | Valor o fuente |
|---|---:|---:|---:|---|
| `EXAMPLE` | No | Sí | No | `value` |

No usar variables de build para contraseñas. No copiar `.env` de producción al
repositorio.

## Dominio

```yaml
host: app.example.com
path: /
internal_path: /
container_port: REEMPLAZAR
https: true
certificate_provider: Lets Encrypt
custom_entrypoint: false
entrypoint_name: websecure
```

Checklist:

- [ ] DNS apunta al VPS.
- [ ] Puerto interno correcto.
- [ ] HTTPS emitido.
- [ ] No existe puerto publicado innecesario.
- [ ] Panel de Dokploy tiene HTTPS separado.

## Persistencia

```yaml
database_type: REEMPLAZAR
volume_type: Volume Mount
volume_name: PROJECT_data
mount_path: /app/data
database_file: /app/data/project.sqlite3
replicas: 1
backup_destination: REEMPLAZAR
backup_schedule: REEMPLAZAR
restore_tested: false
```

Checklist:

- [ ] Ruta mutable identificada.
- [ ] Volumen creado antes de datos reales.
- [ ] Datos permanecen después de redespliegue.
- [ ] Backup fuera del VPS.
- [ ] Restauración probada.
- [ ] Disco mantiene 20 % o más libre.
- [ ] SQLite usa una sola réplica.

## Seguridad

```yaml
application_auth: REEMPLAZAR
temporary_basic_auth: REEMPLAZAR
panel_https: REEMPLAZAR
panel_public_port_closed: REEMPLAZAR
two_factor_auth: REEMPLAZAR
cors_restricted: REEMPLAZAR
rate_limit: REEMPLAZAR
security_headers: REEMPLAZAR
api_docs_protected: REEMPLAZAR
dependency_audit_reviewed: REEMPLAZAR
```

## Verificación previa

```text
[ ] Estado Git revisado
[ ] Diff revisado
[ ] Lint aprobado
[ ] Pruebas aprobadas
[ ] Build aprobado
[ ] Imagen Docker construida
[ ] Migraciones probadas
[ ] Seed idempotente
[ ] Backup creado cuando corresponde
```

## Verificación posterior

```text
[ ] Commit correcto en Dokploy
[ ] Deployment Done
[ ] Health OK
[ ] HTTPS OK
[ ] Página principal OK
[ ] API principal OK
[ ] Datos anteriores presentes
[ ] Función modificada probada
[ ] Logs limpios
[ ] Volumen persistente
[ ] CPU, RAM y disco normales
```

## Rollback

```yaml
known_good_commit: REEMPLAZAR
rollback_image_available: false
database_backward_compatible: REVISAR
backup_before_change: REEMPLAZAR
restore_procedure: REEMPLAZAR
responsible_person: REEMPLAZAR
```

El rollback de código no revierte automáticamente una migración.

## Entrega a otro agente

```text
Proyecto:
Repositorio:
Rama:
Commit desplegado:
Dominio:
Puerto interno:
Base de datos:
Volumen y ruta:
Health endpoint:
Variables no secretas:
Ubicación de secretos:
Backups:
Verificaciones:
Riesgos pendientes:
Próximo paso recomendado:
```
