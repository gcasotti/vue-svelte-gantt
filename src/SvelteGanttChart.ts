/* ------------------------------------------------------------------ */
/*  SvelteGanttChart  –  Vue 3 component wrapping svelte-gantt          */
/* ------------------------------------------------------------------ */
import {
  defineComponent,
  h,
  ref,
  toRaw,
  watch,
  onMounted,
  onBeforeUnmount,
  type PropType,
} from 'vue';

import { SvelteGantt } from 'svelte-gantt';

import type {
  RowModel,
  TaskModel,
  TimeRangeModel,
  GanttHeader,
  ZoomLevel,
  HighlightedDurations,
} from './types';

/* ---- helpers ------------------------------------------------------- */

/**
 * Deep-unwrap Vue reactive proxies so Svelte receives plain objects.
 */
function rawClone<T>(value: T): T {
  if (value == null) return value;
  const raw = toRaw(value);
  if (Array.isArray(raw)) {
    return raw.map((item) => rawClone(toRaw(item))) as unknown as T;
  }
  if (typeof raw === 'object' && raw.constructor === Object) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(raw)) {
      out[key] = rawClone((raw as Record<string, unknown>)[key]);
    }
    return out as T;
  }
  return raw;
}

/* ---- prop keys that map to svelte-gantt options --------------------- */

const GANTT_PROP_KEYS = [
  'rows',
  'tasks',
  'timeRanges',
  'rowHeight',
  'rowPadding',
  'from',
  'to',
  'minWidth',
  'fitWidth',
  'classes',
  'headers',
  'zoomLevels',
  'taskContent',
  'tableWidth',
  'resizeHandleWidth',
  'onTaskButtonClick',
  'dateAdapter',
  'magnetUnit',
  'magnetOffset',
  'columnUnit',
  'columnOffset',
  'ganttTableModules',
  'ganttBodyModules',
  'reflectOnParentRows',
  'reflectOnChildRows',
  'useCanvasColumns',
  'columnStrokeColor',
  'columnStrokeWidth',
  'highlightedDurations',
  'highlightColor',
  'taskElementHook',
  'layout',
  'enableCreateTask',
  'onCreateTask',
  'onCreatedTask',
] as const;

/* ---- component ----------------------------------------------------- */

export const SvelteGanttChart = defineComponent({
  name: 'SvelteGanttChart',

  props: {
    /* Required */
    rows: { type: Array as PropType<RowModel[]>, required: true },
    from: { type: [Number, Date] as PropType<number | Date>, required: true },
    to: { type: [Number, Date] as PropType<number | Date>, required: true },

    /* Data */
    tasks: { type: Array as PropType<TaskModel[]>, default: () => [] },
    timeRanges: { type: Array as PropType<TimeRangeModel[]>, default: () => [] },

    /* Dimensions */
    rowHeight: { type: Number, default: undefined },
    rowPadding: { type: Number, default: undefined },
    minWidth: { type: Number, default: undefined },
    fitWidth: { type: Boolean, default: undefined },
    tableWidth: { type: Number, default: undefined },
    resizeHandleWidth: { type: Number, default: undefined },

    /* Appearance */
    classes: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    headers: { type: Array as PropType<GanttHeader[]>, default: undefined },
    zoomLevels: { type: Array as PropType<ZoomLevel[]>, default: undefined },
    columnStrokeColor: { type: String, default: undefined },
    columnStrokeWidth: { type: Number, default: undefined },
    useCanvasColumns: { type: Boolean, default: undefined },
    highlightedDurations: {
      type: Object as PropType<HighlightedDurations>,
      default: undefined,
    },
    highlightColor: { type: String, default: undefined },
    layout: {
      type: String as PropType<'overlap' | 'pack' | 'expand'>,
      default: undefined,
    },

    /* Column / magnet */
    columnUnit: { type: String, default: undefined },
    columnOffset: { type: Number, default: undefined },
    magnetUnit: { type: String, default: undefined },
    magnetOffset: { type: Number, default: undefined },

    /* Modules */
    ganttTableModules: { type: Array as PropType<unknown[]>, default: undefined },
    ganttBodyModules: { type: Array as PropType<unknown[]>, default: undefined },

    /* Reflection */
    reflectOnParentRows: { type: Boolean, default: undefined },
    reflectOnChildRows: { type: Boolean, default: undefined },

    /* Custom rendering */
    taskContent: { type: [Function, null] as unknown as PropType<((task: TaskModel) => string) | null>, default: undefined },
    taskElementHook: {
      type: [Function, null] as unknown as PropType<((node: HTMLElement, task: TaskModel) => void) | null>,
      default: undefined,
    },
    onTaskButtonClick: {
      type: [Function, null] as unknown as PropType<((task: TaskModel) => void) | null>,
      default: undefined,
    },
    dateAdapter: { type: Object, default: undefined },

    /* Create tasks */
    enableCreateTask: { type: Boolean, default: undefined },
    onCreateTask: {
      type: Function as PropType<
        (e: { from: number; to: number; resourceId: PropertyKey }) => TaskModel
      >,
      default: undefined,
    },
    onCreatedTask: {
      type: Function as PropType<(task: unknown) => void>,
      default: undefined,
    },
  },

  emits: [
    /* tasks */
    'tasks-move',
    'tasks-resize',
    'tasks-select',
    'tasks-switchRow',
    'tasks-moveEnd',
    'tasks-change',
    'tasks-changed',
    'tasks-dblclicked',

    /* gantt */
    'gantt-viewChanged',
    'gantt-dateSelected',

    /* timeranges */
    'timeranges-clicked',
    'timeranges-resized',
    'timeranges-changed',
  ],

  setup(props, { emit, expose }) {
    const container = ref<HTMLElement | null>(null);
    let ganttInstance: InstanceType<typeof SvelteGantt> | null = null;
    const unsubscribers: (() => void)[] = [];

    /* ---- collect props for Svelte ---------------------------------- */

    function collectProps(): Record<string, unknown> {
      const svelteProps: Record<string, unknown> = {};
      for (const key of GANTT_PROP_KEYS) {
        const val = props[key];
        if (val !== undefined) {
          svelteProps[key] = rawClone(val);
        }
      }
      return svelteProps;
    }

    /* ---- mount / subscribe ----------------------------------------- */

    onMounted(() => {
      if (!container.value) return;

      const svelteProps = collectProps();

      ganttInstance = new SvelteGantt({
        target: container.value,
        props: svelteProps,
      });

      /* Subscribe to all API events and re-emit as Vue events */
      const api = (ganttInstance as any).api;
      if (api) {
        /* tasks events */
        if (api.tasks) {
          unsubscribers.push(api.tasks.on.move((...args: unknown[]) => emit('tasks-move', ...args)));
          unsubscribers.push(api.tasks.on.resize((...args: unknown[]) => emit('tasks-resize', ...args)));
          unsubscribers.push(api.tasks.on.select((...args: unknown[]) => emit('tasks-select', ...args)));
          unsubscribers.push(
            api.tasks.on.switchRow((...args: unknown[]) => emit('tasks-switchRow', ...args)),
          );
          unsubscribers.push(api.tasks.on.moveEnd((...args: unknown[]) => emit('tasks-moveEnd', ...args)));
          unsubscribers.push(api.tasks.on.change((...args: unknown[]) => emit('tasks-change', ...args)));
          unsubscribers.push(
            api.tasks.on.changed((...args: unknown[]) => emit('tasks-changed', ...args)),
          );
          unsubscribers.push(
            api.tasks.on.dblclicked((...args: unknown[]) => emit('tasks-dblclicked', ...args)),
          );
        }

        /* gantt events */
        if (api.gantt) {
          unsubscribers.push(
            api.gantt.on.viewChanged((...args: unknown[]) => emit('gantt-viewChanged', ...args)),
          );
          unsubscribers.push(
            api.gantt.on.dateSelected((...args: unknown[]) => emit('gantt-dateSelected', ...args)),
          );
        }

        /* timeranges events */
        if (api.timeranges) {
          unsubscribers.push(
            api.timeranges.on.clicked((...args: unknown[]) => emit('timeranges-clicked', ...args)),
          );
          unsubscribers.push(
            api.timeranges.on.resized((...args: unknown[]) => emit('timeranges-resized', ...args)),
          );
          unsubscribers.push(
            api.timeranges.on.changed((...args: unknown[]) => emit('timeranges-changed', ...args)),
          );
        }
      }
    });

    /* ---- watch props → $set ---------------------------------------- */

    watch(
      () => GANTT_PROP_KEYS.map((k) => props[k]),
      () => {
        if (!ganttInstance) return;
        const svelteProps = collectProps();
        (ganttInstance as any).$set(svelteProps);
      },
      { deep: true },
    );

    /* ---- unmount ---------------------------------------------------- */

    onBeforeUnmount(() => {
      for (const unsub of unsubscribers) {
        unsub();
      }
      unsubscribers.length = 0;

      if (ganttInstance) {
        (ganttInstance as any).$destroy();
        ganttInstance = null;
      }
    });

    /* ---- expose imperative methods --------------------------------- */

    function getInstance() {
      return ganttInstance;
    }

    expose({
      getGanttInstance: getInstance,

      /* Task CRUD */
      updateTask: (model: TaskModel) => (ganttInstance as any)?.updateTask(rawClone(model)),
      updateTasks: (models: TaskModel[]) => (ganttInstance as any)?.updateTasks(rawClone(models)),
      removeTask: (taskId: PropertyKey) => (ganttInstance as any)?.removeTask(taskId),
      removeTasks: (taskIds: PropertyKey[]) => (ganttInstance as any)?.removeTasks(rawClone(taskIds)),
      getTask: (id: PropertyKey) => (ganttInstance as any)?.getTask(id),
      getTasks: (resourceId: PropertyKey) => (ganttInstance as any)?.getTasks(resourceId),

      /* Row CRUD */
      updateRow: (model: RowModel) => (ganttInstance as any)?.updateRow(rawClone(model)),
      updateRows: (models: RowModel[]) => (ganttInstance as any)?.updateRows(rawClone(models)),
      getRow: (resourceId: PropertyKey) => (ganttInstance as any)?.getRow(resourceId),

      /* Selection */
      selectTask: (id: PropertyKey) => (ganttInstance as any)?.selectTask(id),
      unselectTasks: () => (ganttInstance as any)?.unselectTasks(),

      /* Scrolling */
      scrollToRow: (id: PropertyKey, scrollBehavior?: ScrollBehavior) =>
        (ganttInstance as any)?.scrollToRow(id, scrollBehavior),
      scrollToTask: (id: PropertyKey, scrollBehavior?: ScrollBehavior) =>
        (ganttInstance as any)?.scrollToTask(id, scrollBehavior),

      /* Refresh */
      refreshTasks: () => (ganttInstance as any)?.refreshTasks(),
      refreshTimeRanges: () => (ganttInstance as any)?.refreshTimeRanges(),
      updateLayout: () => (ganttInstance as any)?.updateLayout(),

      /* DOM */
      getRowContainer: () => (ganttInstance as any)?.getRowContainer(),
    });

    /* ---- render ----------------------------------------------------- */

    return () => h('div', { ref: container });
  },
});
