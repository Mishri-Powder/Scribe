# -*- coding: utf-8 -*-
"""v0.4 design tokens — every color is oklch(); textures keyed to hue."""

CSS = """
/* ===== v0.4 tokens: all colors are oklch() ===== */
:root{
  --primary:oklch(34.7% 0.073 256.7); --accent:oklch(51.8% 0.156 29.2);
  --bg:oklch(99.3% 0.004 95); --rule:oklch(87.3% 0.013 91.5);
  --ink:oklch(25.2% 0.006 256); --ink-soft:oklch(45% 0.006 256);
  --table-header:oklch(34.7% 0.073 256.7); --table-alt:oklch(96% 0.008 253.9);
  --example-bg:oklch(95.8% 0.012 91.5); --quiz-bg:oklch(97.3% 0.011 89.7); --callout-bg:oklch(97.2% 0.023 75.9);
  --app-bg:oklch(99.1% 0.005 95); --app-panel:oklch(100% 0 0); --app-sidebar:oklch(96.4% 0.008 95);
  --app-text:oklch(26% 0.008 256); --app-muted:oklch(52% 0.012 256);
  --app-accent:oklch(46% 0.13 256); --app-accent-soft:oklch(93.5% 0.028 250); --app-border:oklch(88% 0.01 95);
  --topbar-h:56px; --shadow:0 8px 28px oklch(0% 0 0/.14);
  --hl-yellow-ink:oklch(55% 0.13 95);   --hl-yellow-soft:oklch(93% 0.07 95);
  --hl-green-ink:oklch(50% 0.13 152);   --hl-green-soft:oklch(93% 0.06 152);
  --hl-blue-ink:oklch(52% 0.13 255);    --hl-blue-soft:oklch(93% 0.055 255);
  --hl-pink-ink:oklch(55% 0.16 10);     --hl-pink-soft:oklch(93% 0.05 10);
  --ok:oklch(55% 0.14 152); --ok-soft:oklch(95% 0.045 152); --warn:oklch(62% 0.14 85); --warn-soft:oklch(95% 0.05 95);
  --font-scale:1; --line-gap:1.75; --track:0em;
}
[data-theme="dark"]{
  --primary:oklch(78% 0.06 250); --accent:oklch(75% 0.14 35);
  --bg:oklch(20.3% 0.012 250); --rule:oklch(32% 0.017 244.7);
  --ink:oklch(90.9% 0.011 243.7); --ink-soft:oklch(74% 0.015 246);
  --table-header:oklch(38% 0.06 255); --table-alt:oklch(26.5% 0.013 250);
  --example-bg:oklch(28% 0.015 95); --quiz-bg:oklch(27% 0.014 90); --callout-bg:oklch(30% 0.03 75);
  --app-bg:oklch(20.3% 0.012 250); --app-panel:oklch(24.5% 0.015 250); --app-sidebar:oklch(22% 0.012 250);
  --app-text:oklch(90.9% 0.011 243.7); --app-muted:oklch(67% 0.023 246);
  --app-accent:oklch(70.5% 0.14 250); --app-accent-soft:oklch(34.2% 0.071 251.8); --app-border:oklch(32% 0.017 244.7);
  --shadow:0 8px 28px oklch(0% 0 0/.55);
  --hl-yellow-ink:oklch(82% 0.11 95);  --hl-yellow-soft:oklch(30% 0.05 95);
  --hl-green-ink:oklch(80% 0.11 152);  --hl-green-soft:oklch(29% 0.05 152);
  --hl-blue-ink:oklch(80% 0.10 255);   --hl-blue-soft:oklch(29% 0.05 255);
  --hl-pink-ink:oklch(80% 0.12 10);    --hl-pink-soft:oklch(30% 0.05 10);
  --ok:oklch(72% 0.13 152); --ok-soft:oklch(30% 0.06 152); --warn:oklch(80% 0.13 91); --warn-soft:oklch(30% 0.06 91);
}
"""
