import { render } from 'preact';
import { ManagerApp } from './ManagerApp';

const app = document.getElementById('app');
if (app) {
  render(<ManagerApp />, app);
}
