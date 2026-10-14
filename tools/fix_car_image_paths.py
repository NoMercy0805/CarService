from pathlib import Path
import re
import subprocess

p = Path('app/src/main/assets/index.html')
s = p.read_text()

pattern = r'const img=v\.id==="508"\?"data:image/jpeg;base64,[^"]+":"data:image/jpeg;base64,[^"]+";'
replacement = 'const img=v.id==="508"?"file:///android_asset/peugeot-508.jpg":"file:///android_asset/peugeot-2008.jpg";'
s, n = re.subn(pattern, replacement, s, count=1)
if n != 1:
    raise SystemExit(f'renderTabs image assignment not replaced: {n}')

pattern2 = r"(\.next-service-panel:after\{[^}]*background:)url\('data:image/jpeg;base64,[^']+'\)([^}]*\})"
s, n2 = re.subn(pattern2, r"\1url('file:///android_asset/peugeot-508.jpg')\2", s, count=1)
if n2 != 1:
    raise SystemExit(f'next-service background not replaced: {n2}')

old = '<div class="vehicle-photo"><img src="${img}" alt="${esc(v.name)}"></div>'
new = '<div class="vehicle-photo"><img src="${img}" alt="${esc(v.name)}" onerror="this.style.display=\'none\';this.parentElement.classList.add(\'image-load-error\')"></div>'
if old in s:
    s = s.replace(old, new, 1)

css = "\n.vehicle-photo.image-load-error:after{content:'Fahrzeugbild';font-size:11px;font-weight:700;color:var(--muted)}\n"
s = s.replace('</style>', css + '</style>', 1)

p.write_text(s)

scripts = re.findall(r'<script>(.*?)</script>', s, re.S)
Path('/tmp/carservice.js').write_text('\n'.join(scripts))
subprocess.run(['node', '--check', '/tmp/carservice.js'], check=True)
assert 'file:///android_asset/peugeot-508.jpg' in s
assert 'file:///android_asset/peugeot-2008.jpg' in s
print('absolute Android asset image URLs configured')
