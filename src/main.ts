import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import './styles/index.css';

const app = createApp(App);
app.use(Antd);
app.mount('#app');