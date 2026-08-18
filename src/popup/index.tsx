import { render } from 'preact';
import { PopupApp } from './PopupApp';

const app = document.getElementById('app');
if (app) {
  render(<PopupApp />, app);
}
