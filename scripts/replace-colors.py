#!/usr/bin/env python3
"""Replace all hardcoded Binance dark-theme hex colors in page.tsx with semantic Tailwind classes."""

import re

FILE = '/home/z/my-project/src/app/page.tsx'

with open(FILE, 'r') as f:
    content = f.read()

# ─── Replacement map (order matters: longer/more-specific patterns first) ───
replacements = [
    # Text colors
    ('text-[#848E9C]', 'text-muted-foreground'),
    ('text-[#EAECEF]', 'text-foreground'),
    ('text-[#F0B90B]/80', 'text-primary/80'),
    ('text-[#F0B90B]', 'text-primary'),
    ('text-[#F6465D]', 'text-destructive'),
    ('text-[#0ECB81]', 'text-qfs-green'),
    ('text-[#0B0E11]', 'text-primary-foreground'),
    ('text-[#5E6673]', 'text-nav-inactive'),
    ('text-[#1E90FF]', 'text-info-blue'),

    # BG colors - with opacity modifiers (must come before plain bg)
    ('bg-[#F0B90B]/20', 'bg-primary/20'),
    ('bg-[#F0B90B]/15', 'bg-primary/15'),
    ('bg-[#F0B90B]/10', 'bg-primary/10'),
    ('bg-[#F0B90B]/5', 'bg-primary/5'),
    ('bg-[#F0B90B]', 'bg-primary'),

    ('bg-[#F6465D]/90', 'bg-destructive/90'),
    ('bg-[#F6465D]/10', 'bg-destructive/10'),
    ('bg-[#F6465D]/5', 'bg-destructive/5'),
    ('bg-[#F6465D]', 'bg-destructive'),

    ('bg-[#0ECB81]/10', 'bg-qfs-green/10'),
    ('bg-[#0ECB81]', 'bg-qfs-green'),

    ('bg-[#2B3139]/50', 'bg-secondary/50'),
    ('bg-[#2B3139]', 'bg-secondary'),

    ('bg-[#363C45]', 'bg-elevated'),
    ('bg-[#181A20]', 'bg-background'),
    ('bg-[#1E2329]', 'bg-card'),
    ('bg-[#0B0E11]', 'bg-primary-foreground'),
    ('bg-[#848E9C]', 'bg-muted-foreground'),

    # Border colors - with opacity (before plain)
    ('border-[#F0B90B]/50', 'border-primary/50'),
    ('border-[#F0B90B]/30', 'border-primary/30'),
    ('border-[#F0B90B]/20', 'border-primary/20'),
    ('border-[#F0B90B]', 'border-primary'),

    ('border-[#F6465D]/20', 'border-destructive/20'),
    ('border-[#F6465D]', 'border-destructive'),

    ('border-[#0ECB81]/30', 'border-qfs-green/30'),

    ('border-[#363C45]', 'border-elevated'),
    ('border-[#2B3139]', 'border-border'),
    ('border-[#181A20]', 'border-background'),

    # Divide colors
    ('divide-[#2B3139]', 'divide-border'),

    # Placeholder
    ('placeholder-[#5E6673]', 'placeholder-nav-inactive'),
]

for old, new in replacements:
    count = content.count(old)
    if count > 0:
        content = content.replace(old, new)
        print(f'  {old:30s} -> {new:25s} ({count} occurrences)')

with open(FILE, 'w') as f:
    f.write(content)

# Verify no hardcoded hex colors remain (excluding CSS-in-JS style props, imports, etc.)
remaining = re.findall(r'(?:text|bg|border|divide|placeholder|ring)-\[#[A-Fa-f0-9]+\]', content)
if remaining:
    print(f'\nWARNING: {len(remaining)} hardcoded color classes remain:')
    from collections import Counter
    for color, count in Counter(remaining).most_common():
        print(f'  {color}: {count}')
else:
    print(f'\nAll hardcoded color classes replaced successfully!')
