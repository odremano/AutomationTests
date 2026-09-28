# Roadmap — tareas en orden

Estado revisado sobre el commit `2d2642f` (24/04/2026). Hacer una tarea por vez, en su propia rama, y marcarla `[x]` al terminar. Cada tarea trae el prompt listo para pegarle a Codex.

Regla para validar cualquier tarea: `npm run typecheck` en verde **y** correr (con VPN) los specs que la tarea toca. Si el comportamiento cambió sin que la tarea lo pidiera, se descarta el cambio.

---

## [ ] Tarea 1 — Herramientas básicas y `.env.example`

**Por qué:** hoy no hay forma de verificar tipos con un solo comando (no hay `typescript` ni `tsconfig.json`), y `.env.example` no incluye dos variables que `helpers/env.ts` exige (`TRANSFER_ACCOUNT_ACH`, `TRANSFER_DESCRIPTION_BENEFICIARIO`): quien copie el ejemplo tal cual ve fallar todos los specs de transferencia.

**Prompt:**
> Leé AGENTS.md. Tarea 1 de docs/ROADMAP.md: agregá `typescript` como devDependency, un `tsconfig.json` (strict, noEmit, types node) y en package.json los scripts `typecheck` (`tsc --noEmit`) y `test` (`playwright test`). Completá `.env.example` con todas las variables que usa `helpers/env.ts`, sin valores reales. No toques nada más. Corré `npm run typecheck` y mostrame el resultado.

---

## [ ] Tarea 2 — Bugs concretos (sin refactor)

**Por qué:** son errores de datos, no de estructura. Conviene arreglarlos antes del refactor para no mezclar cambios de comportamiento con cambios de forma.

1. `pages/transfACHPage.ts` → `completarFormulario()`: ignora el parámetro `concepto` y escribe siempre `"Prueba transf Automation"`.
2. `F.WB.05.003.01 - ACH - Nuevo Destinatario.spec.ts`: llama `seleccionarCuentaDestinoNueva(data.codeABA, data.cuentaABA)`, pero la firma del método es `(descripcion, cuentaACH)`. Está mandando datos de Al Exterior (ABA) a ACH. Debería ser `(data.descripcion, data.cuentaACH)`. **Ojo:** requiere que `TRANSFER_ACCOUNT_ACH` tenga una cuenta ACH válida en tu `.env`; correr el spec para confirmarlo.
3. `pages/transfAlExteriorPage.ts` línea con `//BUG ACÁ`: el spec de Al Exterior pasa los parámetros en el orden correcto, así que el comentario parece viejo (probablemente el problema real era el punto 2). Confirmarlo corriendo el spec y, si anda bien, borrar el comentario.
4. `bankInput.selectOption('10: Object')` en ACH: valor interno de Angular, frágil. Pasarlo a variable de entorno (`TRANSFER_BANK_ACH`) como ya sugiere el comentario del código. Confirmar antes en la app si se puede seleccionar por texto visible del banco (`selectOption({ label: '...' })`), que es más estable.

**Prompt:**
> Leé AGENTS.md. Tarea 2 de docs/ROADMAP.md, puntos 1, 2 y 4 (el 3 lo verifico yo corriendo el test). Hacé solo esos cambios, sin tocar locators ni esperas. Corré `npm run typecheck` y decime qué specs tengo que correr.

---

## [ ] Tarea 3 — Extraer `BaseTransferPage`

**Por qué:** los 4 POM de transferencia repiten casi idéntico: menú Transferir, cuenta origen, `completarFormulario`, `continuarYConfirmar`, `volverAInicio` y ~10 locators. Cualquier cambio (por ejemplo, la validación del PDF) hoy habría que hacerlo 4 veces.

Criterios:
- `pages/BaseTransferPage.ts` abstracta con lo común. `seleccionarCuentaDestino()` abstracto por subclase.
- Cada subclase conserva **sus** locators cuando difieren (`siguienteButton`, `confirmarButtonEnabled`, `conceptoInput` de Al Exterior, `transferenciaExitosaHeading` de Al Exterior).
- Las esperas que difieren entre flujos (el `waitForTimeout(30_000)` antes o después de confirmar) se preservan en cada subclase mediante un método protegido sobreescribible, no se unifican ni se borran.
- Los specs no deberían necesitar cambios (mismos nombres de métodos públicos).

**Prompt:**
> Leé AGENTS.md. Tarea 3 de docs/ROADMAP.md. Primero mostrame una tabla de qué es idéntico y qué difiere entre los 4 POM de transferencia, y el diseño que proponés. Esperá mi OK antes de escribir código. El refactor tiene que preservar comportamiento exacto: mismos locators, mismas esperas, mismos métodos públicos.

---

## [ ] Tarea 4 — Sacar datos de negocio de los Page Objects

Valores hoy fijos en POM: `'Cuenta de cheques Prueba'` (A terceros), `'test Automation 3301290511'` (Al Exterior), `'840'` (país), `'Test Address'`. Pasarlos a `.env` o a `test-data/` y recibirlos como parámetro.

**Prompt:**
> Leé AGENTS.md. Tarea 4 de docs/ROADMAP.md: mové esos valores a variables de entorno (agregalas a `.env.example` y a `helpers/env.ts`) y pasalos como parámetro desde los specs. No cambies ningún locator salvo el texto que pasa a ser parámetro.

---

## [ ] Tarea 5 — Al Exterior: resultado explícito

**Situación actual:** `transferenciaExitosaHeading` de Al Exterior acepta `/Tu transferencia ha sido|Tu transferencia no ha podido/`. El test pasa tanto si la transferencia sale como si es rechazada, y el reporte no dice cuál pasó. Eso no es una validación.

**Decisión previa (humana, no de Codex):** preguntar al equipo de backend/ambiente si existe un beneficiario o corredor de prueba que el entorno apruebe de verdad.
- **Si existe:** usarlo y validar solo el éxito.
- **Si no existe:** separar los dos resultados. El spec valida el rechazo esperado de forma explícita (heading de rechazo, sin transacción a medias) y lo registra con `test.info().annotations`. Si además se quiere probar el comprobante de éxito, mockear únicamente la llamada final con `page.route()` en un test aparte, marcado como tal.

**Prompt (completar según la respuesta):**
> Leé AGENTS.md. Tarea 5 de docs/ROADMAP.md. En el entorno de pruebas [SÍ / NO] existe un corredor que apruebe transferencias al exterior. Proponé los cambios en el POM y los specs de Al Exterior según corresponda, y esperá mi OK.

---

## [ ] Tarea 6 — Validación del comprobante PDF

Agregar `pdf-parse`, capturar la descarga del comprobante (`page.waitForEvent('download')`) y validar monto, concepto y cuentas. Primero en Entre cuentas propias (el flujo más estable), después en el resto. Guardar los PDFs en `comprobantes/` y agregar esa carpeta a `.gitignore` (contienen datos de cuentas del entorno).

**Prompt:**
> Leé AGENTS.md. Tarea 6 de docs/ROADMAP.md, solo para Entre cuentas propias. Primero decime cómo se descarga el comprobante en la pantalla de éxito según el código actual; si no lo sabés, pedime que lo verifique en la app antes de escribir el locator del botón de descarga.

---

## [ ] Tarea 7 — Reemplazar `waitForTimeout` por condiciones reales

Esto no se puede hacer sin la app: hay que correr con `npx playwright test --trace on` (o `--headed`), mirar qué cambia durante esos segundos y esperar esa condición. Hacerlo espera por espera, corriendo el spec afectado 3 veces seguidas antes de dar el cambio por bueno.

---

## Para más adelante (no ahora)

- **CI/CD:** `.github/workflows/playwright.yml` corre en runners de GitHub, que no llegan al servidor interno (VPN) y no tienen el `.env`. Hoy falla o no aporta. Plan confirmado: agente self-hosted de Azure DevOps dentro de la red corporativa, cuando haya más cobertura. Mientras tanto, conviene desactivar el workflow para no tener un rojo permanente.
- **Multi-país:** `.env` por entorno y `test-data/<país>/` cargado con una variable `COUNTRY`.
