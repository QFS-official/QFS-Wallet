"""Process and optimize the 4 official token logos.

- Resize to 256x256 (primary) + 64x64 (small) + 48x48 (tiny)
- For non-transparent images, preserve original aspect (already square)
- Save to /home/z/my-project/public/
"""
import os
from PIL import Image

UPLOAD = '/home/z/my-project/upload'
PUBLIC = '/home/z/my-project/public'

# (source file, target base name)
FILES = [
    ('Big Size PNG.png', 'qfs-logo-official'),
    ('ALA Coin (1).png', 'ala-logo-official'),
    ('GCRM 200X200.png', 'gcrm-logo-official'),
    ('traex moneda.jpeg', 'traex-logo-official'),
]

SIZES = [(256, 256), (128, 128), (64, 64), (48, 48)]

for src_name, base in FILES:
    src_path = os.path.join(UPLOAD, src_name)
    print(f'\nProcessing {src_name} -> {base}')

    img = Image.open(src_path)
    print(f'  Original: {img.size} {img.mode}')

    # Convert to RGBA for consistency (handles both PNG with alpha and JPEG)
    img = img.convert('RGBA')

    # Save a large reference version (512px) with original colors
    large = img.resize((512, 512), Image.LANCZOS)
    large_path = os.path.join(PUBLIC, f'{base}.png')
    large.save(large_path, 'PNG', optimize=True)
    print(f'  Saved {large_path} ({large.size})')

    # Save smaller versions
    for size in SIZES:
        small = img.resize(size, Image.LANCZOS)
        small_path = os.path.join(PUBLIC, f'{base}-{size[0]}.png')
        small.save(small_path, 'PNG', optimize=True)
        print(f'  Saved {small_path} ({small.size})')

print('\nAll logos processed.')
