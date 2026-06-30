"""Import a GLB and render a 3/4 front view to inspect it. Usage:
Blender --background --python peek_glb.py -- <input.glb> <output.png>
"""
import bpy, sys, math
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
path, out = argv[0], argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)
scene = bpy.context.scene

mn = Vector((1e9, 1e9, 1e9)); mx = Vector((-1e9, -1e9, -1e9))
for o in bpy.data.objects:
    if o.type == "MESH":
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
center = (mn + mx) / 2
size = mx - mn
maxd = max(size)
print("BBOX size", tuple(round(v, 3) for v in size))

for e in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
    try:
        scene.render.engine = e
        break
    except Exception:
        pass
scene.world = bpy.data.worlds.new("W")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.05, 0.06, 0.08, 1)
scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.2

sd = bpy.data.lights.new("S", "SUN"); sd.energy = 4.0
su = bpy.data.objects.new("S", sd); scene.collection.objects.link(su)
su.rotation_euler = (math.radians(55), math.radians(10), math.radians(30))

cd = bpy.data.cameras.new("C"); cam = bpy.data.objects.new("C", cd)
scene.collection.objects.link(cam); scene.camera = cam
d = maxd * 1.9
cam.location = center + Vector((d * 0.7, -d * 0.8, d * 0.22))
cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()

scene.render.resolution_x = 600
scene.render.resolution_y = 760
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("OK")
