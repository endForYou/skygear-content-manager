import { AppTheme } from './config';

export function generateCSSClass(theme: AppTheme): string {
  return `
.primary-color {
  color: ${theme.primaryColor} !important;
}

.primary-bg-color {
  background-color: ${theme.primaryColor} !important;
}

.primary-border-color {
  border-color: ${theme.primaryColor} !important;
}

.primary-button {
  background-color: ${theme.primaryColor} !important;
  border-color: ${theme.primaryColor} !important;
  opacity: 1;
}

.primary-button-active {
  background-color: white !important;
  border-color: ${theme.primaryColor} !important;
  color: ${theme.primaryColor} !important;
  opacity: 1;
}

.primary-button:hover,
.primary-button-active:hover {
  opacity: 0.7;
}

.primary-button[disabled],
.primary-button-active[disabled] {
  opacity: 0.3;
}

.sidebar-color {
  background-color: ${theme.sidebarColor} !important;
}
  `;
}
