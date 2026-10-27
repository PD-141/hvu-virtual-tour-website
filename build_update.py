import re,json,os,shutil
p='/mnt/data/work/hvu-virtual-tour-website/app.js'
s=open(p,encoding='utf8').read(); m=re.search(r'const floorData = (\[.*?\]);\n  const state',s,re.S)
floors=json.loads(m.group(1))
# retain existing floors 8-13; sort image titles numerically within each floor based on timestamps, normalize display names
for f in floors:
 f['images'].sort(key=lambda x:x.get('timestamp',''))
 for i,img in enumerate(f['images'],1): img['display']=f'Ảnh {i}'
# build assets/data.json
os.makedirs('/mnt/data/work/hvu-virtual-tour-website/assets/music',exist_ok=True)
open('/mnt/data/work/hvu-virtual-tour-website/assets/floors.json','w',encoding='utf8').write(json.dumps(floors,ensure_ascii=False,indent=2))
