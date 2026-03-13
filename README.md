# vue-svelte-gantt

Vue 3 wrapper for [svelte-gantt](https://github.com/ANovokmet/svelte-gantt) — a lightweight, high-performance interactive Gantt chart / resource booking component.

**Live Demo**: https://gcasotti.github.io/vue-svelte-gantt

**Repository**: https://github.com/gcasotti/vue-svelte-gantt

[![NPM Version](https://img.shields.io/npm/v/vue-svelte-gantt?v=1)](https://www.npmjs.com/package/vue-svelte-gantt)
[![NPM Downloads](https://img.shields.io/npm/dm/vue-svelte-gantt?v=1)](https://www.npmjs.com/package/vue-svelte-gantt)
[![NPM License](https://img.shields.io/npm/l/vue-svelte-gantt?v=1)](https://www.npmjs.com/package/vue-svelte-gantt)

[![GitHub Repo](https://img.shields.io/badge/github-repository-blue?v=1)](https://github.com/gcasotti/vue-svelte-gantt)
[![GitHub Stars](https://img.shields.io/github/stars/gcasotti/vue-svelte-gantt?v=1)](https://github.com/gcasotti/vue-svelte-gantt/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/gcasotti/vue-svelte-gantt?v=1)](https://github.com/gcasotti/vue-svelte-gantt/issues)

[![Bundle Size](https://img.shields.io/bundlephobia/minzip/vue-svelte-gantt?v=1)](https://bundlephobia.com/package/vue-svelte-gantt)
[![Types](https://img.shields.io/npm/types/vue-svelte-gantt?v=1)](https://www.npmjs.com/package/vue-svelte-gantt)

[![Demo](https://img.shields.io/badge/demo-live-blue?v=1)](https://gcasotti.github.io/vue-svelte-gantt/)


> **No Svelte build tooling required.** This package uses the pre-compiled svelte-gantt bundle via its imperative API.

## Installation

```bash
npm install vue-svelte-gantt svelte-gantt
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { SvelteGanttChart } from 'vue-svelte-gantt';

const from = ref(new Date(2025, 0, 1).valueOf());
const to = ref(new Date(2025, 0, 8).valueOf());

const rows = ref([
  { id: 1, label: 'Row 1' },
  { id: 2, label: 'Row 2' },
]);

const tasks = ref([
  {
    id: 1,
    resourceId: 1,
    label: 'Task 1',
    from: new Date(2025, 0, 1, 8).valueOf(),
    to: new Date(2025, 0, 1, 16).valueOf(),
  },
  {
    id: 2,
    resourceId: 2,
    label: 'Task 2',
    from: new Date(2025, 0, 2, 10).valueOf(),
    to: new Date(2025, 0, 3, 12).valueOf(),
  },
]);
</script>

<template>
  <SvelteGanttChart
    :rows="rows"
    :tasks="tasks"
    :from="from"
    :to="to"
    :row-height="52"
    :headers="[
      { unit: 'day', format: 'MMMM Do' },
      { unit: 'hour', format: 'H:mm' },
    ]"
    @tasks-select="(task) => console.log('Selected:', task)"
    @tasks-changed="(e) => console.log('Changed:', e)"
  />
</template>
```

## Usage with Dependencies Module

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  SvelteGanttChart,
  SvelteGanttTable,
  SvelteGanttDependencies,
} from 'vue-svelte-gantt';

const from = ref(new Date(2025, 0, 1).valueOf());
const to = ref(new Date(2025, 0, 8).valueOf());

const rows = ref([
  { id: 1, label: 'Planning' },
  { id: 2, label: 'Development' },
  { id: 3, label: 'Testing' },
]);

const tasks = ref([
  {
    id: 1,
    resourceId: 1,
    label: 'Design',
    from: new Date(2025, 0, 1, 8).valueOf(),
    to: new Date(2025, 0, 2, 17).valueOf(),
  },
  {
    id: 2,
    resourceId: 2,
    label: 'Implement',
    from: new Date(2025, 0, 3, 8).valueOf(),
    to: new Date(2025, 0, 5, 17).valueOf(),
  },
  {
    id: 3,
    resourceId: 3,
    label: 'QA',
    from: new Date(2025, 0, 6, 8).valueOf(),
    to: new Date(2025, 0, 7, 17).valueOf(),
  },
]);

const dependencies = ref([
  { id: 1, fromId: 1, toId: 2 },
  { id: 2, fromId: 2, toId: 3 },
]);

const ganttRef = ref<InstanceType<typeof SvelteGanttChart> | null>(null);

function scrollToFirstTask() {
  ganttRef.value?.scrollToTask(1, 'smooth');
}
</script>

<template>
  <button @click="scrollToFirstTask">Scroll to Task 1</button>
  <SvelteGanttChart
    ref="ganttRef"
    :rows="rows"
    :tasks="tasks"
    :from="from"
    :to="to"
    :gantt-table-modules="[SvelteGanttTable]"
    :gantt-body-modules="[SvelteGanttDependencies]"
    :table-width="200"
    :dependencies="dependencies"
    :row-height="52"
    :headers="[
      { unit: 'day', format: 'ddd D MMM' },
      { unit: 'hour', format: 'HH' },
    ]"
    @tasks-changed="(e) => console.log('Task changed:', e)"
    @tasks-dblclicked="(task, event) => console.log('Double clicked:', task)"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `RowModel[]` | **required** | Rows to display |
| `from` | `number \| Date` | **required** | Timeline start datetime |
| `to` | `number \| Date` | **required** | Timeline end datetime |
| `tasks` | `TaskModel[]` | `[]` | Tasks to display |
| `timeRanges` | `TimeRangeModel[]` | `[]` | Time ranges to display |
| `rowHeight` | `number` | `52` | Height of a single row (px) |
| `rowPadding` | `number` | `6` | Top and bottom padding of a row (px) |
| `minWidth` | `number` | `800` | Minimum width of the gantt area (px) |
| `fitWidth` | `boolean` | `false` | Stretch timeline to fit container |
| `tableWidth` | `number` | `240` | Width of the table (when using SvelteGanttTable) |
| `resizeHandleWidth` | `number` | `10` | Width of task resize handle (px) |
| `classes` | `string \| string[]` | `[]` | CSS classes for the gantt root |
| `headers` | `GanttHeader[]` | `[...]` | List of headers (unit + format) |
| `zoomLevels` | `ZoomLevel[]` | `[...]` | Zoom configurations (ctrl+scroll) |
| `columnStrokeColor` | `string` | `'#efefef'` | Column separator stroke color |
| `columnStrokeWidth` | `number` | `1` | Column separator stroke width |
| `useCanvasColumns` | `boolean` | `true` | Render columns in canvas for performance |
| `highlightedDurations` | `HighlightedDurations` | `undefined` | Highlighted time periods (e.g. weekends) |
| `highlightColor` | `string` | `'#6eb859'` | Color for highlighted durations |
| `layout` | `'overlap' \| 'pack' \| 'expand'` | `'overlap'` | Task layout strategy |
| `columnUnit` | `string` | `'minute'` | Duration unit for columns |
| `columnOffset` | `number` | `15` | Duration width of a column |
| `magnetUnit` | `string` | `'minute'` | Time unit for date snapping |
| `magnetOffset` | `number` | `15` | Amount of units for date snapping |
| `ganttTableModules` | `unknown[]` | `[]` | Table modules (e.g. `[SvelteGanttTable]`) |
| `ganttBodyModules` | `unknown[]` | `[]` | Body modules (e.g. `[SvelteGanttDependencies]`) |
| `reflectOnParentRows` | `boolean` | `true` | Show child-row tasks on parent rows |
| `reflectOnChildRows` | `boolean` | `false` | Show parent-row tasks on child rows |
| `taskContent` | `(task) => string` | `null` | Custom task content HTML |
| `taskElementHook` | `(node, task) => void` | `null` | Hook to access task DOM node |
| `onTaskButtonClick` | `(task) => void` | `null` | Task button click handler |
| `dateAdapter` | `SvelteGanttDateAdapter` | `DefaultAdapter` | Custom date adapter |
| `enableCreateTask` | `boolean` | `false` | Enable creating tasks by dragging |
| `onCreateTask` | `(e) => TaskModel` | `(built-in)` | Factory for new tasks on drag-create |
| `onCreatedTask` | `(task) => void` | `noop` | Callback after task creation |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `tasks-move` | `[TaskModel]` | Task is being dragged |
| `tasks-resize` | `[TaskModel]` | Task is being resized |
| `tasks-select` | `[SvelteTask]` | Task was selected |
| `tasks-switchRow` | `[task, targetRow, sourceRow]` | Task moved to a different row |
| `tasks-moveEnd` | `[TaskModel]` | Task drag ended |
| `tasks-change` | `[{ task, sourceRow, targetRow, previousState }]` | Task changed (before update) |
| `tasks-changed` | `[{ task, sourceRow, targetRow, previousState }]` | Task changed (after update) |
| `tasks-dblclicked` | `[SvelteTask, MouseEvent]` | Task double-clicked |
| `gantt-viewChanged` | — | Zoom level changed |
| `gantt-dateSelected` | `[{ from, to }]` | Date range selected in header |
| `timeranges-clicked` | `[{ model }]` | Time range clicked |
| `timeranges-resized` | `[{ model, left, width }]` | Time range resized |
| `timeranges-changed` | `[{ model, left, width }]` | Time range changed |

## Exposed Methods

Access these via a template ref:

```ts
const ganttRef = ref<InstanceType<typeof SvelteGanttChart>>();

// Then use:
ganttRef.value?.updateTask(taskModel);
ganttRef.value?.scrollToTask(taskId, 'smooth');
```

| Method | Signature | Description |
| --- | --- | --- |
| `getGanttInstance` | `() => SvelteGantt` | Get the raw svelte-gantt instance |
| `updateTask` | `(model: TaskModel) => void` | Add or update a single task |
| `updateTasks` | `(models: TaskModel[]) => void` | Add or update multiple tasks |
| `removeTask` | `(taskId: PropertyKey) => void` | Remove a task |
| `removeTasks` | `(taskIds: PropertyKey[]) => void` | Remove multiple tasks |
| `getTask` | `(id: PropertyKey) => SvelteTask` | Get a task by ID |
| `getTasks` | `(resourceId: PropertyKey) => SvelteTask[]` | Get tasks for a row |
| `updateRow` | `(model: RowModel) => void` | Add or update a row |
| `updateRows` | `(models: RowModel[]) => void` | Add or update multiple rows |
| `getRow` | `(resourceId: PropertyKey) => SvelteRow` | Get a row by ID |
| `selectTask` | `(id: PropertyKey) => void` | Select a task |
| `unselectTasks` | `() => void` | Deselect all tasks |
| `scrollToRow` | `(id, behavior?) => void` | Scroll to a row |
| `scrollToTask` | `(id, behavior?) => void` | Scroll to a task |
| `refreshTasks` | `() => void` | Recalculate task positions |
| `refreshTimeRanges` | `() => void` | Recalculate time range positions |
| `updateLayout` | `() => void` | Force layout recalculation |
| `getRowContainer` | `() => HTMLElement` | Get the row container DOM element |

## Re-exported Modules

These are re-exported from `svelte-gantt` for convenience:

```ts
import {
  SvelteGanttTable,
  SvelteGanttDependencies,
  SvelteGanttExternal,
  MomentSvelteGanttDateAdapter,
} from 'vue-svelte-gantt';
```

## How It Works

This wrapper uses the **imperative Svelte API** (`new SvelteGantt()`, `$set()`, `$destroy()`) to mount the pre-compiled svelte-gantt bundle inside a Vue component. All reactive props are deep-unwrapped with `toRaw()` before being passed to Svelte to avoid Vue Proxy incompatibilities.

## License

MIT
