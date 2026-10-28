import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { router } from './router/index.js';
import { vuetify } from './plugins/vuetify.js';
import { vueQueryOptions } from './plugins/vue-query.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(VueQueryPlugin, vueQueryOptions);
app.use(router);
app.use(vuetify);

app.mount('#app');
