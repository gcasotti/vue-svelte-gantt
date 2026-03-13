/* ------------------------------------------------------------------ */
/*  vue-svelte-gantt  –  TypeScript definitions                        */
/* ------------------------------------------------------------------ */

// Re-export useful types from svelte-gantt when available
export type { SvelteGanttOptions } from 'svelte-gantt';

/* ---- Row / Task / TimeRange models (mirrors svelte-gantt) -------- */

export interface RowModel {
  id: PropertyKey;
  label?: string;
  headerHtml?: string;
  class?: string;
  contentHtml?: string;
  enableDragging?: boolean;
  height?: number;
  children?: RowModel[];
  expanded?: boolean;
  [key: string]: unknown;
}

export interface TaskModel {
  id: PropertyKey;
  resourceId: PropertyKey;
  from: number | Date;
  to: number | Date;
  label?: string;
  html?: string;
  classes?: string | string[];
  enableDragging?: boolean;
  enableResize?: boolean;
  labelBottom?: string;
  type?: 'milestone' | 'task';
  stickyLabel?: boolean;
  showButton?: boolean;
  buttonClasses?: string;
  buttonHtml?: string;
  [key: string]: unknown;
}

export interface TimeRangeModel {
  id: PropertyKey;
  from: number | Date;
  to: number | Date;
  classes?: string | string[];
  label?: string;
  resizable?: boolean;
  [key: string]: unknown;
}

export interface DependencyModel {
  id: PropertyKey;
  fromId: PropertyKey;
  toId: PropertyKey;
  stroke?: string;
  strokeWidth?: number;
  arrowSize?: number;
  [key: string]: unknown;
}

/* ---- Header -------------------------------------------------------- */

export interface GanttHeader {
  unit: string;
  format: string;
  offset?: number;
  sticky?: boolean;
}

/* ---- Zoom level ---------------------------------------------------- */

export interface ZoomLevel {
  headers: GanttHeader[];
  minWidth: number;
  fitWidth?: boolean;
  columnUnit?: string;
  columnOffset?: number;
}

/* ---- Highlighted durations ----------------------------------------- */

export interface HighlightedDurations {
  unit: string;
  fractions: number[];
}

/* ---- Props interface ----------------------------------------------- */

export interface SvelteGanttProps {
  /* Required */
  rows: RowModel[];
  from: number | Date;
  to: number | Date;

  /* Data */
  tasks?: TaskModel[];
  timeRanges?: TimeRangeModel[];

  /* Dimensions */
  rowHeight?: number;
  rowPadding?: number;
  minWidth?: number;
  fitWidth?: boolean;
  tableWidth?: number;
  resizeHandleWidth?: number;

  /* Appearance */
  classes?: string | string[];
  headers?: GanttHeader[];
  zoomLevels?: ZoomLevel[];
  columnStrokeColor?: string;
  columnStrokeWidth?: number;
  useCanvasColumns?: boolean;
  highlightedDurations?: HighlightedDurations;
  highlightColor?: string;
  layout?: 'overlap' | 'pack' | 'expand';

  /* Columns / magnet */
  columnUnit?: string;
  columnOffset?: number;
  magnetUnit?: string;
  magnetOffset?: number;

  /* Modules */
  ganttTableModules?: unknown[];
  ganttBodyModules?: unknown[];

  /* Reflection */
  reflectOnParentRows?: boolean;
  reflectOnChildRows?: boolean;

  /* Custom rendering */
  taskContent?: ((task: TaskModel) => string) | null;
  taskElementHook?: ((node: HTMLElement, task: TaskModel) => void) | null;
  onTaskButtonClick?: ((task: TaskModel) => void) | null;
  dateAdapter?: unknown;

  /* Create tasks */
  enableCreateTask?: boolean;
  onCreateTask?: (e: { from: number; to: number; resourceId: PropertyKey }) => TaskModel;
  onCreatedTask?: (task: unknown) => void;
}

/* ---- Emits map ----------------------------------------------------- */

export interface SvelteGanttEmits {
  (e: 'tasks-move', payload: unknown): void;
  (e: 'tasks-resize', payload: unknown): void;
  (e: 'tasks-select', payload: unknown): void;
  (e: 'tasks-switchRow', task: unknown, targetRow: unknown, sourceRow: unknown): void;
  (e: 'tasks-moveEnd', payload: unknown): void;
  (e: 'tasks-change', payload: unknown): void;
  (e: 'tasks-changed', payload: unknown): void;
  (e: 'tasks-dblclicked', task: unknown, event: MouseEvent): void;
  (e: 'gantt-viewChanged'): void;
  (e: 'gantt-dateSelected', payload: { from: number; to: number }): void;
  (e: 'timeranges-clicked', payload: unknown): void;
  (e: 'timeranges-resized', payload: unknown): void;
  (e: 'timeranges-changed', payload: unknown): void;
}

/* ---- Exposed methods ----------------------------------------------- */

export interface SvelteGanttExposed {
  /** Get the underlying SvelteGantt instance */
  getGanttInstance: () => unknown | null;

  /* Task CRUD */
  updateTask: (model: TaskModel) => void;
  updateTasks: (models: TaskModel[]) => void;
  removeTask: (taskId: PropertyKey) => void;
  removeTasks: (taskIds: PropertyKey[]) => void;
  getTask: (id: PropertyKey) => unknown;
  getTasks: (resourceId: PropertyKey) => unknown[] | null;

  /* Row CRUD */
  updateRow: (model: RowModel) => void;
  updateRows: (models: RowModel[]) => void;
  getRow: (resourceId: PropertyKey) => unknown;

  /* Selection */
  selectTask: (id: PropertyKey) => void;
  unselectTasks: () => void;

  /* Scrolling */
  scrollToRow: (id: PropertyKey, scrollBehavior?: ScrollBehavior) => void;
  scrollToTask: (id: PropertyKey, scrollBehavior?: ScrollBehavior) => void;

  /* Refresh */
  refreshTasks: () => void;
  refreshTimeRanges: () => void;
  updateLayout: () => void;

  /* DOM */
  getRowContainer: () => HTMLElement;
}
