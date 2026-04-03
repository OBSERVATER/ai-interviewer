import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './index.css';

// Suppress ResizeObserver errors globally by patching it
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    super((entries, observer) => {
      window.requestAnimationFrame(() => {
        try {
          callback(entries, observer);
        } catch (e) {
          // Ignore
        }
      });
    });
  }
};

window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('ResizeObserver loop completed with undelivered notifications') || e.message.includes('ResizeObserver loop limit exceeded'))) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const app = createApp(App);

// Also suppress in Vue's error handler just in case
app.config.errorHandler = (err: any, instance, info) => {
  if (err?.message && (err.message.includes('ResizeObserver loop') || err.message.includes('ResizeObserver loop limit exceeded'))) {
    return;
  }
  console.error(err);
};

app.use(ElementPlus);
app.mount('#root');
