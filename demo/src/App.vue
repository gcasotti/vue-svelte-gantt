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

function today(hour = 0, minute = 0): number {
  const d = new Date(2026, 2, 13); // March 13 2026
  d.setHours(hour, minute, 0, 0);
  return d.valueOf();
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const from = ref(today(7));
const to = ref(today(16));

const rows = ref<RowModel[]>([
  { id: 1, label: 'Jedd Balden' },
  { id: 2, label: 'Rozele McFarland' },
  { id: 3, label: 'Chrissy Bullard' },
  { id: 4, label: 'Patience Leschelle' },
  { id: 5, label: 'Rosette Henrie' },
]);

const tasks = ref<TaskModel[]>([
  { id: 1, resourceId: 1, label: 'Lunch',        from: today(9, 30),  to: today(10, 30), classes: 'task-lunch' },
  { id: 2, resourceId: 2, label: 'Review',       from: today(12, 0),  to: today(14, 0),  classes: 'task-pink' },
  { id: 3, resourceId: 3, label: 'Development',  from: today(8, 30),  to: today(12, 0),  classes: 'task-gray' },
  { id: 4, resourceId: 3, label: 'Site visit',   from: today(12, 30), to: today(14, 0),  classes: 'task-blue' },
  { id: 5, resourceId: 4, label: 'Design',       from: today(8, 0),   to: today(10, 0),  classes: 'task-blue' },
  { id: 6, resourceId: 5, label: 'Review',       from: today(12, 0),  to: today(14, 30), classes: 'task-blue' },
]);

const dependencies = ref([
  { id: 1, fromId: 5, toId: 6 },
]);

/* ------------------------------------------------------------------ */
/*  Controls                                                           */
/* ------------------------------------------------------------------ */

const layout = ref<'overlap' | 'pack' | 'expand'>('overlap');
const fitWidth = ref(true);

const headers = computed(() => [
  { unit: 'day', format: 'D/M/YYYY' },
  { unit: 'hour', format: 'H:mm' },
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
        <button class="btn" @click="ganttRef?.scrollToTask(5, 'smooth')">Scroll to "Design"</button>
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
        :table-width="180"
        :column-unit="'minute'"
        :column-offset="15"
        :magnet-unit="'minute'"
        :magnet-offset="15"
        :gantt-table-modules="[SvelteGanttTable]"
        :gantt-body-modules="[SvelteGanttDependencies]"
        :dependencies="dependencies"
        :column-stroke-color="'#efefef'"
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
  --bg: #e8ecf2;
  --surface: #ffffff;
  --border: #e0e3e8;
  --text: #1a1e2c;
  --text-muted: #6b7280;
  --accent: #4f68e8;
  --radius: 12px;
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

.hero {
  padding: 48px 0 28px;
  text-align: center;
}

.hero h1 {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text);
}

.subtitle {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 1rem;
}

.badges {
  margin-top: 14px;
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
  padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-group label {
  font-size: 0.7rem;
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
  padding: 6px 13px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: var(--font);
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s ease;
  text-transform: capitalize;
}

.btn:hover {
  background: #f3f4f6;
}

.btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.btn-small {
  padding: 4px 10px;
  font-size: 0.7rem;
}

/* ------------------------------------------------------------------ */
/*  Gantt section — let svelte-gantt own its styles                     */
/* ------------------------------------------------------------------ */

.gantt-section {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Minimal overrides — only task colors */
:deep(.task-lunch) {
  background: repeating-linear-gradient(
    45deg,
    #fca5a5,
    #fca5a5 4px,
    #ffffff 4px,
    #ffffff 8px
  ) !important;
  border: none !important;
}
:deep(.task-lunch .sg-task-content) {
  color: #ef4444 !important;
}

:deep(.task-pink) {
  background: #ec4899 !important;
  border: none !important;
}
:deep(.task-pink .sg-task-content) {
  color: #fff !important;
}

:deep(.task-blue) {
  background: #3b82f6 !important;
  border: none !important;
}
:deep(.task-blue .sg-task-content) {
  color: #fff !important;
}

:deep(.task-gray) {
  background: #9ca3af !important;
  border: none !important;
}
:deep(.task-gray .sg-task-content) {
  color: #fff !important;
}

:deep(.sg-task) {
  border-radius: 4px !important;
  font-size: 0.8rem !important;
}

/* ------------------------------------------------------------------ */
/*  Event Log                                                          */
/* ------------------------------------------------------------------ */

.log-section {
  margin-top: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
}

.log-header h2 {
  font-size: 0.8rem;
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
  padding: 5px 16px;
  border-bottom: 1px solid #f3f4f6;
  animation: log-slide-in 0.2s ease;
}

.log-entry:hover {
  background: #f9fafb;
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
  margin-top: 36px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
