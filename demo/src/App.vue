<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  SvelteGanttChart,
  SvelteGanttTable,
  SvelteGanttDependencies,
  type RowModel,
  type TaskModel,
} from 'vue-svelte-gantt';

/* ------------------------------------------------------------------ */
/*  Time helpers                                                       */
/* ------------------------------------------------------------------ */

function day(offset: number, hour = 0): number {
  const d = new Date(2025, 5, 16); // June 16 2025
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.valueOf();
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const from = ref(day(0));
const to = ref(day(5));

const rows = ref<RowModel[]>([
  { id: 1, label: 'Design', class: 'row-design' },
  { id: 2, label: 'Frontend', class: 'row-frontend' },
  { id: 3, label: 'Backend', class: 'row-backend' },
  { id: 4, label: 'DevOps', class: 'row-devops' },
  { id: 5, label: 'QA', class: 'row-qa' },
]);

const tasks = ref<TaskModel[]>([
  { id: 1,  resourceId: 1, label: 'Wireframes',       from: day(0, 8),  to: day(0, 17), classes: 'task-design' },
  { id: 2,  resourceId: 1, label: 'UI Mockups',       from: day(1, 8),  to: day(1, 17), classes: 'task-design' },
  { id: 3,  resourceId: 2, label: 'Setup Project',    from: day(0, 9),  to: day(0, 14), classes: 'task-frontend' },
  { id: 4,  resourceId: 2, label: 'Component Dev',    from: day(1, 8),  to: day(2, 17), classes: 'task-frontend' },
  { id: 5,  resourceId: 2, label: 'Integration',      from: day(3, 8),  to: day(3, 17), classes: 'task-frontend' },
  { id: 6,  resourceId: 3, label: 'API Design',       from: day(0, 8),  to: day(0, 17), classes: 'task-backend' },
  { id: 7,  resourceId: 3, label: 'Implementation',   from: day(1, 8),  to: day(3, 12), classes: 'task-backend' },
  { id: 8,  resourceId: 4, label: 'CI/CD Pipeline',   from: day(0, 10), to: day(1, 16), classes: 'task-devops' },
  { id: 9,  resourceId: 4, label: 'Deploy Staging',   from: day(3, 14), to: day(4, 12), classes: 'task-devops' },
  { id: 10, resourceId: 5, label: 'Test Plan',        from: day(1, 8),  to: day(1, 17), classes: 'task-qa' },
  { id: 11, resourceId: 5, label: 'E2E Testing',      from: day(3, 8),  to: day(4, 17), classes: 'task-qa' },
]);

const dependencies = ref([
  { id: 1, fromId: 1, toId: 2 },
  { id: 2, fromId: 2, toId: 4 },
  { id: 3, fromId: 6, toId: 7 },
  { id: 4, fromId: 4, toId: 5 },
  { id: 5, fromId: 7, toId: 5 },
  { id: 6, fromId: 8, toId: 9 },
  { id: 7, fromId: 5, toId: 11 },
  { id: 8, fromId: 10, toId: 11 },
]);

/* ------------------------------------------------------------------ */
/*  Controls                                                           */
/* ------------------------------------------------------------------ */

const layout = ref<'overlap' | 'pack' | 'expand'>('overlap');
const fitWidth = ref(false);

const headers = computed(() => [
  { unit: 'day', format: 'ddd D MMM' },
  { unit: 'hour', format: 'HH' },
]);

const ganttRef = ref<InstanceType<typeof SvelteGanttChart> | null>(null);

/* ------------------------------------------------------------------ */
/*  Event log                                                          */
/* ------------------------------------------------------------------ */

interface LogEntry {
  id: number;
  time: string;
  event: string;
  detail: string;
}

let logId = 0;
const eventLog = ref<LogEntry[]>([]);
const MAX_LOG = 50;

function logEvent(event: string, ...args: unknown[]) {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  let detail = '';
  try {
    const first = args[0];
    if (Array.isArray(first) && first.length >= 1) {
      const payload = first[0];
      if (payload?.task?.model) {
        detail = `task "${payload.task.model.label}" (id: ${payload.task.model.id})`;
      } else if (payload?.model) {
        detail = `"${payload.model.label}" (id: ${payload.model.id})`;
      } else if (payload?.label) {
        detail = `"${payload.label}" (id: ${payload.id})`;
      } else {
        detail = JSON.stringify(payload).slice(0, 120);
      }
    }
  } catch {
    detail = '(payload)';
  }

  eventLog.value.unshift({ id: ++logId, time, event, detail });
  if (eventLog.value.length > MAX_LOG) {
    eventLog.value.length = MAX_LOG;
  }
}

function clearLog() {
  eventLog.value = [];
}
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="hero">
      <div class="hero-content">
        <h1>vue-svelte-gantt</h1>
        <p class="subtitle">Vue 3 wrapper for <a href="https://github.com/ANovokmet/svelte-gantt" target="_blank" rel="noopener">svelte-gantt</a></p>
        <div class="badges">
          <a href="https://www.npmjs.com/package/vue-svelte-gantt" target="_blank" rel="noopener">
            <img src="https://img.shields.io/npm/v/vue-svelte-gantt?style=flat-square&color=4fc08d" alt="npm version" />
          </a>
          <a href="https://github.com/gcasotti/vue-svelte-gantt" target="_blank" rel="noopener">
            <img src="https://img.shields.io/badge/GitHub-repo-24292e?style=flat-square&logo=github" alt="GitHub" />
          </a>
        </div>
      </div>
    </header>

    <!-- Controls -->
    <section class="controls">
      <div class="control-group">
        <label>Layout</label>
        <div class="btn-group">
          <button
            v-for="mode in (['overlap', 'pack', 'expand'] as const)"
            :key="mode"
            :class="['btn', { active: layout === mode }]"
            @click="layout = mode"
          >
            {{ mode }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>Fit Width</label>
        <button :class="['btn', { active: fitWidth }]" @click="fitWidth = !fitWidth">
          {{ fitWidth ? 'ON' : 'OFF' }}
        </button>
      </div>

      <div class="control-group">
        <label>Actions</label>
        <button class="btn" @click="ganttRef?.scrollToTask(1, 'smooth')">Scroll to Task 1</button>
      </div>
    </section>

    <!-- Gantt Chart -->
    <section class="gantt-section">
      <SvelteGanttChart
        ref="ganttRef"
        :rows="rows"
        :tasks="tasks"
        :from="from"
        :to="to"
        :headers="headers"
        :layout="layout"
        :fit-width="fitWidth"
        :row-height="52"
        :row-padding="6"
        :table-width="140"
        :column-unit="'hour'"
        :column-offset="1"
        :gantt-table-modules="[SvelteGanttTable]"
        :gantt-body-modules="[SvelteGanttDependencies]"
        :dependencies="dependencies"
        :column-stroke-color="'#2a2d35'"
        :highlight-color="'rgba(99,102,241,0.08)'"
        :highlighted-durations="{ unit: 'day', fractions: [0, 6] }"
        :zoom-levels="[
          { headers: [{ unit: 'day', format: 'ddd D MMM' }, { unit: 'hour', format: 'HH' }], minWidth: 3000, fitWidth: false },
          { headers: [{ unit: 'day', format: 'ddd D MMM' }, { unit: 'hour', format: 'HH:mm' }], minWidth: 8000, fitWidth: false },
        ]"
        @tasks-select="(...args: unknown[]) => logEvent('tasks-select', args)"
        @tasks-move="(...args: unknown[]) => logEvent('tasks-move', args)"
        @tasks-resize="(...args: unknown[]) => logEvent('tasks-resize', args)"
        @tasks-change="(...args: unknown[]) => logEvent('tasks-change', args)"
        @tasks-changed="(...args: unknown[]) => logEvent('tasks-changed', args)"
        @tasks-dblclicked="(...args: unknown[]) => logEvent('tasks-dblclicked', args)"
        @tasks-switch-row="(...args: unknown[]) => logEvent('tasks-switchRow', args)"
        @gantt-view-changed="(...args: unknown[]) => logEvent('gantt-viewChanged', args)"
        @gantt-date-selected="(...args: unknown[]) => logEvent('gantt-dateSelected', args)"
      />
    </section>

    <!-- Event Log -->
    <section class="log-section">
      <div class="log-header">
        <h2>Event Log</h2>
        <button class="btn btn-small" @click="clearLog">Clear</button>
      </div>
      <div class="log-body">
        <div v-if="eventLog.length === 0" class="log-empty">
          Interact with the chart to see events here…
        </div>
        <div v-for="entry in eventLog" :key="entry.id" class="log-entry">
          <span class="log-time">{{ entry.time }}</span>
          <span class="log-event">{{ entry.event }}</span>
          <span class="log-detail">{{ entry.detail }}</span>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>
        Built with
        <a href="https://vuejs.org" target="_blank" rel="noopener">Vue 3</a>
        +
        <a href="https://github.com/ANovokmet/svelte-gantt" target="_blank" rel="noopener">svelte-gantt</a>
      </p>
    </footer>
  </div>
</template>

<style>
/* ------------------------------------------------------------------ */
/*  Reset & Base                                                       */
/* ------------------------------------------------------------------ */

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #0f1117;
  --surface: #181a22;
  --surface-2: #1e2029;
  --border: #2a2d35;
  --text: #e4e5e9;
  --text-muted: #8b8d97;
  --accent: #6366f1;
  --accent-glow: rgba(99, 102, 241, 0.25);
  --green: #22c55e;
  --blue: #3b82f6;
  --orange: #f59e0b;
  --pink: #ec4899;
  --cyan: #06b6d4;
  --radius: 10px;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

html {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
}

a {
  color: var(--accent);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* ------------------------------------------------------------------ */
/*  App layout                                                         */
/* ------------------------------------------------------------------ */

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

.hero {
  padding: 56px 0 32px;
  text-align: center;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 1.05rem;
}

.badges {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.badges img {
  height: 22px;
}

/* ------------------------------------------------------------------ */
/*  Controls                                                           */
/* ------------------------------------------------------------------ */

.controls {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-end;
  padding: 16px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.btn-group {
  display: flex;
  gap: 0;
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-radius: 6px 0 0 6px;
}

.btn-group .btn:last-child {
  border-radius: 0 6px 6px 0;
}

.btn {
  padding: 7px 14px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: var(--font);
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s ease;
  text-transform: capitalize;
}

.btn:hover {
  background: var(--border);
}

.btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  box-shadow: 0 0 12px var(--accent-glow);
}

.btn-small {
  padding: 4px 10px;
  font-size: 0.7rem;
}

/* ------------------------------------------------------------------ */
/*  Gantt section                                                      */
/* ------------------------------------------------------------------ */

.gantt-section {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
}

/* svelte-gantt internal overrides */
:deep(.sg-gantt) {
  font-family: var(--font) !important;
}

:deep(.sg-table-body .sg-table-row),
:deep(.sg-table-header) {
  background: var(--surface) !important;
  border-color: var(--border) !important;
  color: var(--text) !important;
}

:deep(.sg-table-body .sg-table-row:hover) {
  background: var(--surface-2) !important;
}

:deep(.sg-header) {
  background: var(--surface) !important;
  color: var(--text-muted) !important;
}

:deep(.sg-header .column-header-row) {
  border-color: var(--border) !important;
}

:deep(.sg-header .column-header-cell) {
  color: var(--text-muted) !important;
  font-size: 0.75rem !important;
}

:deep(.sg-timeline-body) {
  background: var(--surface) !important;
}

:deep(.sg-row) {
  border-color: var(--border) !important;
}

:deep(.sg-row:hover) {
  background: var(--surface-2) !important;
}

:deep(.sg-task) {
  border-radius: 5px !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3) !important;
  border: none !important;
}

:deep(.sg-task-content) {
  padding: 0 8px !important;
  color: #fff !important;
}

:deep(.sg-task.selected) {
  outline: 2px solid var(--accent) !important;
  outline-offset: 1px !important;
}

/* Task color classes */
:deep(.task-design) {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa) !important;
}

:deep(.task-frontend) {
  background: linear-gradient(135deg, #3b82f6, #60a5fa) !important;
}

:deep(.task-backend) {
  background: linear-gradient(135deg, #22c55e, #4ade80) !important;
}

:deep(.task-devops) {
  background: linear-gradient(135deg, #f59e0b, #fbbf24) !important;
}
:deep(.task-devops .sg-task-content) {
  color: #1a1a1a !important;
}

:deep(.task-qa) {
  background: linear-gradient(135deg, #ec4899, #f472b6) !important;
}

/* Dependencies */
:deep(.sg-dependency .arrow-body) {
  stroke: var(--accent) !important;
  stroke-width: 1.5 !important;
  opacity: 0.6;
}

:deep(.sg-dependency .arrow-head) {
  fill: var(--accent) !important;
  opacity: 0.6;
}

/* Resizer */
:deep(.sg-table-column-resizer) {
  background: var(--border) !important;
}

/* ------------------------------------------------------------------ */
/*  Event Log                                                          */
/* ------------------------------------------------------------------ */

.log-section {
  margin-top: 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.log-header h2 {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.log-body {
  max-height: 180px;
  overflow-y: auto;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.75rem;
}

.log-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  font-family: var(--font);
}

.log-entry {
  display: flex;
  gap: 12px;
  padding: 6px 16px;
  border-bottom: 1px solid rgba(42, 45, 53, 0.5);
  animation: log-slide-in 0.2s ease;
}

.log-entry:hover {
  background: var(--surface-2);
}

.log-time {
  color: var(--text-muted);
  flex-shrink: 0;
}

.log-event {
  color: var(--accent);
  font-weight: 600;
  flex-shrink: 0;
  min-width: 140px;
}

.log-detail {
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes log-slide-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

.footer {
  margin-top: 40px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ------------------------------------------------------------------ */
/*  Scrollbar                                                          */
/* ------------------------------------------------------------------ */

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
