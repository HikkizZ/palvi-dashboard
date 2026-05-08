# palvi-dashboard

Executive metrics dashboard for B2B SaaS — React + TypeScript

## Cómo correrlo

```bash
npm install
npm run dev
```

## Decisiones técnicas

**Stack: Vite + shadcn/ui + Tailwind CSS + Recharts**
Vite por velocidad de desarrollo. shadcn/ui porque entrega componentes accesibles (Radix) con estilos controlables — no una librería que impone su diseño. Recharts por integración nativa con React y buen soporte TypeScript. Tailwind porque es lo que shadcn requiere y permite iterar rápido en UI.

**Capa de datos separada en `src/data/`**
Todas las queries viven en `queries.ts`. Los componentes no tocan el JSON directamente — reciben `dataset` y `period` como props y llaman funciones tipadas. Esto hace cada componente independiente y testeable sin montar la app.

**Algoritmo de foco (`getFocusAreas`)**
Compara el promedio de los últimos 7 días contra los 30 anteriores para cada métrica. Usa el campo `direction` del metadata del JSON para determinar si un cambio es bueno o malo — sin hardcodear lógica de dominio. Muestra las 3 métricas más problemáticas; si hay menos de 3, completa con las que van bien.

**Selector de período (7d / 14d / 30d)**
El Jefe de Ventas puede necesitar contexto distinto según la reunión: un problema de hoy versus una tendencia del mes. Todos los componentes responden al período seleccionado.

**Targets de métricas**
El dataset no incluye benchmarks. Definí umbrales basados en estándares de B2B SaaS (respuesta ≤ 30 min, win rate ≥ 60%, etc.) para dar contexto visual al usuario. Son una decisión de diseño, no datos del sistema.

**Sin backend**
Los datos son estáticos. Añadir un servidor solo agregaría latencia y complejidad sin ningún beneficio.

## Segunda iteración

**Targets configurables**
Los umbrales actuales están hardcodeados. En producción cada empresa tiene sus propios benchmarks — deberían ser configurables por el usuario o venir del backend.

**Tests de la capa de datos**
`queries.ts` contiene lógica pura sobre arreglos: es directamente testeable con Vitest sin montar ningún componente. Es lo primero que añadiría.

**Drill-down por métrica**
Click en una card para ver el historial completo de esa métrica, no solo el resumen del período.

**Rango de fechas personalizado**
El selector 7d/14d/30d es simple pero no permite analizar períodos específicos como "la semana después del lanzamiento". Un date range picker reemplazaría el selector actual.

**Comparación entre datasets**
Ver dos datasets en paralelo para identificar diferencias entre equipos, regiones o canales sin tener que cambiar de pestaña.
