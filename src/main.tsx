import { createRoot } from 'react-dom/client';
import { setBasePath } from '@shoelace-style/shoelace';
import { App } from './app/app';
import { Provider } from './app/providers';

import '@shoelace-style/shoelace/dist/themes/light.css';
import './assets/styles/main.scss';
import './index.css';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.14.0/cdn/');


const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Provider>
    <App />
  </Provider>
);
