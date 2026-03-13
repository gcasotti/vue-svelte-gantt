/* ------------------------------------------------------------------ */
/*  vue-svelte-gantt  –  Package entry point                            */
/* ------------------------------------------------------------------ */

/* Main component */
export { SvelteGanttChart } from './SvelteGanttChart';

/* Types */
export type {
  SvelteGanttProps,
  SvelteGanttEmits,
  SvelteGanttExposed,
  RowModel,
  TaskModel,
  TimeRangeModel,
  DependencyModel,
  GanttHeader,
  ZoomLevel,
  HighlightedDurations,
} from './types';

/* Re-export svelte-gantt modules (consumers need these for ganttTableModules / ganttBodyModules) */
export {
  SvelteGanttTable,
  SvelteGanttDependencies,
  SvelteGanttExternal,
  MomentSvelteGanttDateAdapter,
} from 'svelte-gantt';
