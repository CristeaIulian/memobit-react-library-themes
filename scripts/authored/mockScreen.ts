// The small app screen both preview pages draw: one card, chips, badges, fields, buttons,
// progress bars, a table and a toast, all coloured by the lib's component tokens.

import type { AppSample } from './samples/types.ts';

export const escape = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const screen = (sample: AppSample): string => `
<div class="m-app">
  <div class="m-header"><span class="m-brand">${escape(sample.app)}</span><span class="m-search">${escape(sample.search)}</span></div>
  <div class="m-body">
    <div class="m-card">
      <div class="m-card-head"><div class="m-title">${escape(sample.title)}</div><div class="m-sub">${escape(sample.subtitle)}</div></div>
      <div class="m-card-body">
        <p class="m-text">${sample.text}</p>
        <div class="m-row">${sample.chips.map((chip, index) => `<button type="button" class="chip chip--default${index === sample.selectedChip ? ' chip--selected' : ''}">${escape(chip)}</button>`).join('')}</div>
        <div class="m-row">${(['default', 'info', 'success', 'warning', 'danger'] as const).map((variant, index) => `<span class="badge badge-variant--${variant}">${escape(sample.badges[index])}</span>`).join('')}</div>
        <div class="m-fields">
          <label class="m-field"><span class="m-label">${escape(sample.field.label)}</span><span class="m-input m-input--focus">${escape(sample.field.value)}</span></label>
          <label class="m-field"><span class="m-label">${escape(sample.empty.label)}</span><span class="m-input m-input--empty">${escape(sample.empty.placeholder)}</span></label>
        </div>
        <div class="m-row">
          <span class="m-btn m-btn--info">${escape(sample.buttons[0])}</span><span class="m-btn m-btn--default">${escape(sample.buttons[1])}</span><span class="m-btn m-btn--success">${escape(sample.buttons[2])}</span><span class="m-btn m-btn--danger">${escape(sample.buttons[3])}</span>
        </div>
        ${sample.progress.map(bar => `<div class="m-progress"><span class="m-progress-label">${escape(bar.label)}</span><span class="m-track"><span class="m-fill m-fill--${bar.tone}" style="width:${bar.value}%"></span></span></div>`).join('')}
      </div>
    </div>
    <div class="m-table">
      <div class="m-tr m-th">${sample.table.columns.map(column => `<span>${escape(column)}</span>`).join('')}</div>
      ${sample.table.rows.map((row, index) => `<div class="m-tr${index === 1 ? ' m-tr--hover' : ''}${index === 2 ? ' m-tr--alt' : ''}">${row.map((cell, cellIndex) => `<span${cellIndex === 0 ? ' class="m-strong"' : ''}>${escape(cell)}</span>`).join('')}</div>`).join('')}
    </div>
    <div class="m-toast">${escape(sample.toast)}</div>
  </div>
</div>`;

export const MOCK_SCREEN_CSS = `
/* The mock screen: every colour and type value comes from the concept's component tokens. */
.m-app { background: var(--body-background); color: var(--body-color); font-family: var(--font-family); font-size: 14px; line-height: 1.5; }
.m-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 16px; background: var(--header-background-color); border-bottom: 1px solid var(--header-border-bottom-color); color: var(--header-color); font-weight: var(--header-font-weight); }
.m-brand { font-family: var(--font-family-display); font-size: 1.15rem; color: var(--body-title-color); }
.m-search { padding: 4px 10px; border-radius: var(--radius); background: var(--form-control-background-color); border: 1px solid var(--form-control-border-color); color: var(--form-control-placeholder-color); font-size: 13px; font-weight: 400; }
.m-body { display: flex; flex-direction: column; gap: 14px; padding: 16px; }
.m-card { border-radius: var(--radius); background: var(--card-background-color); border: 1px solid var(--card-border-color); box-shadow: var(--card-box-shadow); backdrop-filter: var(--card-backdrop-filter); overflow: hidden; }
.m-card-head { padding: 12px 16px; background: var(--card-background-accent-color); border-bottom: 1px solid var(--delimiter-color); }
.m-title { font-family: var(--card-title-font-family); font-size: var(--card-title-font-size); font-weight: var(--card-title-font-weight); font-style: var(--card-title-font-style); letter-spacing: var(--card-title-letter-spacing); text-transform: var(--card-title-text-transform); color: var(--card-title-color); line-height: 1.2; }
.m-sub { color: var(--body-color-muted); font-size: 13px; margin-top: 2px; }
.m-card-body { display: flex; flex-direction: column; gap: 12px; padding: 14px 16px 16px; color: var(--card-color); }
.m-text { margin: 0; }
.m-text a { color: var(--links-color); text-decoration: underline; text-underline-offset: 2px; }
.m-text .m-accent { color: var(--body-accent-color); font-weight: 600; }
.m-text mark { background: var(--tone-accent-soft); color: inherit; padding: 0 2px; border-radius: 3px; }
.m-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.chip { font: inherit; font-size: 12px; padding: 4px 12px; border-radius: var(--radius-full); border: 1px solid var(--delimiter-color); background: transparent; color: var(--body-color); cursor: pointer; }
.chip:focus-visible { outline: 2px solid var(--form-control-focus-border-color); outline-offset: 2px; }
.badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: var(--radius-full); border: 1px solid transparent; }
.m-fields { display: flex; flex-wrap: wrap; gap: 12px; }
.m-field { display: flex; flex-direction: column; gap: 4px; flex: 1 1 180px; min-width: 0; }
.m-label { color: var(--form-control-label-color); font-size: var(--form-control-label-font-size); font-weight: var(--form-control-label-font-weight); letter-spacing: var(--form-control-label-letter-spacing); text-transform: var(--form-control-label-text-transform); }
.m-input { padding: 7px 10px; border-radius: var(--radius); font-family: var(--form-control-font-family); background: var(--form-control-background-color); border: 1px solid var(--form-control-border-color); color: var(--form-control-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m-input--focus { background: var(--form-control-focus-background-color); border-color: var(--form-control-focus-border-color); box-shadow: 0 0 0 3px var(--form-control-focus-ring); }
.m-input--empty { color: var(--form-control-placeholder-color); }
.m-btn { font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: var(--radius); border: 1px solid transparent; }
.m-btn--info { background: var(--button-info-background-color); color: var(--button-info-color); border-color: var(--button-info-border-color); }
.m-btn--default { background: var(--button-default-background-color); color: var(--button-default-color); border-color: var(--button-default-border-color); }
.m-btn--success { background: var(--button-success-background-color); color: var(--button-success-color); border-color: var(--button-success-border-color); }
.m-btn--danger { background: var(--button-danger-background-color); color: var(--button-danger-color); border-color: var(--button-danger-border-color); }
.m-progress { display: flex; flex-direction: column; gap: 4px; }
.m-progress-label { font-size: 12px; color: var(--body-color-muted); }
.m-track { display: block; height: 8px; border-radius: var(--radius-full); background: var(--progress-bar-background-color); overflow: hidden; }
.m-fill { display: block; height: 100%; border-radius: inherit; }
.m-fill--info { background: var(--progress-info-bar-fill-color); }
.m-fill--success { background: var(--progress-success-bar-fill-color); }
.m-fill--warning { background: var(--progress-warning-bar-fill-color); }
.m-table { border-radius: var(--radius); border: 1px solid var(--card-border-color); background: var(--card-background-color); overflow: hidden; font-size: 13px; }
.m-tr { display: grid; grid-template-columns: 2fr 1.2fr 1fr; gap: 8px; padding: 8px 14px; border-top: 1px solid var(--delimiter-color); }
.m-th { border-top: 0; background: var(--card-background-accent-color); color: var(--body-color-muted); font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.m-tr--alt { background: var(--list-alternate-background-color); }
.m-tr--hover { background: var(--list-hover-background-color); }
.m-strong { color: var(--body-title-color); font-weight: 600; }
.m-toast { align-self: flex-start; padding: 8px 14px; border-radius: var(--radius); font-size: 13px; font-weight: 500; background: var(--toast-success-background-color); color: var(--toast-success-color); border: 1px solid var(--toast-success-border-color); }
@media (prefers-reduced-motion: no-preference) { .chip { transition: background 150ms ease, border-color 150ms ease; } }
`;
