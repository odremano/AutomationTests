# AGENTS.md — Suite E2E Playwright (ICBanking / Ficohsa)

Instrucciones para agentes de IA (Codex u otros) que trabajen en este repo. Leer completo antes de modificar código.

## Qué es este repo

Prueba de concepto de automatización E2E con Playwright + TypeScript sobre la plataforma bancaria ICBanking (subsidiaria Ficohsa). Se va a presentar a gerencia como reemplazo de un intento anterior con Katalon, así que importa tanto que funcione como que el código sea claro y las decisiones estén documentadas.

- `pages/` — Page Objects (Login, Dashboard y un POM por tipo de transferencia).
- `fixtures/authenticatedPage.fixture.ts` — fixture `authenticatedPage` que hace el login completo. Los specs de transferencia la usan en vez de loguearse a mano.
- `helpers/env.ts` — lectura de variables de entorno (`requiredEnv`, `getTransferData`).
- `tests/e2e/` — specs, una carpeta por funcionalidad (`F.WB.00`, `F.WB.02`, `F.WB.05`...).
- `docs/ROADMAP.md` — lista de tareas pendientes, en orden. Trabajar de a una.

## Comandos

- Verificar tipos (obligatorio después de cualquier cambio): `npm run typecheck` (si el script todavía no existe, crearlo es la Tarea 1 de `docs/ROADMAP.md`).
- Correr un spec: `npx playwright test "tests/e2e/<carpeta>/<archivo>.spec.ts"`
- Ver el reporte: `npx playwright show-report`
- Los tests necesitan la VPN corporativa y un `.env` válido (ver `.env.example`). Si no podés ejecutarlos, decilo explícitamente e indicá qué spec debería correr el humano. Nunca afirmes que un test "pasa" sin haberlo ejecutado.

## Regla principal: no "corregir" locators sin evidencia

El DOM de esta app no es semántico. Estos selectores son correctos aunque parezcan raros:

```
.baku-selected_product-not_selected
.stream-arrow_down_1.crawley-content-icon-arrow.baku-selected_product-icon
.salto_overlay.salto_overlay-show
.ipswich-main-buttons-link
.lisboa
```

- El primer segmento (`baku`, `salto`, `ipswich`, `lisboa`...) es un código interno del UI kit: arbitrario pero estable. El sufijo (`-not_selected`, `-show`, `-icon`, `-link`) es lo que describe el elemento o su estado.
- NO reemplazar estos selectores por `data-testid`, `getByRole` u otra clase "más prolija" salvo que se haya verificado contra la app real que el nuevo selector existe y es único. Sin esa verificación, es una hipótesis, no una corrección.
- Los tags de componente (`icb-*`, `fico-*`, `wizard-title`, `headline`) son más estables que las clases: preferirlos para escopear.
- Una misma clase puede aparecer en varios widgets de la misma pantalla (ej. `.lisboa` en cuenta origen y en cuenta destino). Escopear con un contenedor (`#creditProductId .lisboa`) o con `.filter({ hasText })`.
- Si una tarea no pide cambiar locators, no los cambies. En un refactor, los locators se mueven tal cual.

## Decisiones de arquitectura (no revertir)

- **Ejecución serial siempre** (`workers: 1`, `fullyParallel: false`). La app permite una sola sesión por usuario; paralelizar hace que las sesiones se invaliden entre sí. Por el mismo motivo no se usa `storageState`.
- **Page Object Model**, con métodos en español que describen el paso de negocio (`seleccionarCuentaOrigen`, `completarFormulario`, `continuarYConfirmar`). En los specs, `test.step()` por cada paso.
- **Datos fuera de los Page Objects**: montos, cuentas, nombres de beneficiario, códigos y correos vienen del spec, del `.env` o de `test-data/`. Nunca hardcodeados dentro de una clase de página.
- **Evitar `networkidle` en código nuevo**: la app tiene polling y la red nunca queda quieta. Usar `expect(...).toBeVisible()`, `waitForURL()` o un estado concreto de la UI.
- **No agregar `waitForTimeout` nuevos, y no quitar los existentes a ciegas.** Los que hay (10s, 20s, 30s en los POM de transferencia) se mantienen hasta identificar la condición real con el trace viewer. Reemplazarlos por una espera inventada es el mismo error que inventar un locator.
- **Resultados válidos múltiples** (éxito o rechazo esperado del negocio): modelarlos explícitamente (`Promise.race()` + tipo unión) y que el spec decida y deje registrado cuál ocurrió. Un locator que acepta ambos resultados en silencio no es una validación.
- **Mocking mínimo**: solo con `page.route()` sobre la llamada final a un riel externo que no existe en el entorno de pruebas, y documentado en el código. Un test con mock prueba el frontend, no la aprobación del backend.

## Forma de trabajar

- Una tarea por vez, en su propia rama. Antes de editar, explicá el plan en pocas líneas y listá los archivos que vas a tocar.
- Cambios mínimos: no reformatees ni renombres cosas que la tarea no pide.
- Después de cada cambio: `npm run typecheck`. Si tocaste un flujo, indicá qué spec(s) hay que correr para validarlo.
- Si algo de este archivo contradice una "buena práctica" general de Playwright, gana este archivo: las excepciones están verificadas contra la app real.
- Al terminar una tarea de `docs/ROADMAP.md`, marcala como hecha ahí mismo.
