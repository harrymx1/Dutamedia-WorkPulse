import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

export const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1E40AF',
          secondary: '#64748B',
          accent: '#3B82F6',
          error: '#EF4444',
          info: '#0284C7',
          success: '#10B981',
          warning: '#F59E0B',
          background: '#F8FAFC',
          surface: '#FFFFFF',
        },
      },
    },
  },
});
