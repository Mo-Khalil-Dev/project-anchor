// Design tokens from Bridge README

export const colors = {
  accent: 'oklch(52% 0.18 270)',
  accentBg: 'oklch(96.5% 0.03 270)',
  accentDark: 'oklch(40% 0.22 285)',

  green: 'oklch(51% 0.17 145)',
  greenBg: 'oklch(96.5% 0.04 145)',

  amber: 'oklch(62% 0.16 76)',
  amberBg: 'oklch(96.5% 0.05 76)',

  red: 'oklch(52% 0.18 25)',
  redBg: 'oklch(97% 0.03 25)',

  text: '#0d0f14',
  sub: '#5a5f72',
  muted: '#9197ab',
  divider: 'rgba(0,0,0,0.07)',
  border: 'rgba(0,0,0,0.08)',
  card: '#ffffff',
  bg: '#f4f5f9',
  sidebar: '#160f2e',
};

export const spacing = {
  cardPadding: '20px',
  rowPadding: '11px',
  sectionGap: '12px',
  pageMaxWidth: '840px',
  adminContentPadding: '28px',
};

export const borderRadius = {
  card: '18px',
  stat: '14px',
  button: '14px',
  buttonSm: '11px',
  input: '10px',
  pill: '100px',
};

export const shadows = {
  card: '0 1px 4px rgba(0,0,0,0.06)',
  cardElevated: '0 4px 20px oklch(52% 0.18 270 / 0.18)',
  buttonPrimary: '0 4px 18px oklch(52% 0.18 270 / 0.28)',
};

export const zIndex = {
  sticky: 50,
  dropdown: 100,
  modal: 1000,
  toast: 9999,
};
