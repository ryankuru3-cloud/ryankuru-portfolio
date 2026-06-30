"""Import a GLB and save all its images to a folder. Usage:
Blender --background --python extract_tex.py -- <input.glb> <outdir>
"""
import bpy, sys, os

argv = sys.argv[sys.argv.index("--") + 1:]
path, outdir = argv[0], argv[1]
os.makedirs(outdir, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)

for i, img in enumerate(bpy.data.images):
    if img.size[0] == 0:
        continue
    safe = "".join(c for c in img.name if c.isalnum() or c in "._-")[:24]
    fp = os.path.join(outdir, f"img_{i}_{safe}.png")
    img.filepath_raw = fp
    img.file_format = "PNG"
    try:
        img.save()
        print("SAVED", fp, img.size[0], "x", img.size[1])
    except Exception as e:
        print("FAIL", img.name, e)
