"""Gift PRESENT — clean rebuild. ONE rounded box (no separate lid / no fussy parts) wrapped by a
simple cross ribbon and a small tidy bow. Flat matte Arizona colours. Geometry kept proud of the
box surface so nothing is coplanar (no z-fighting). Authored Z-up; exported yup → upright,
origin on the floor.

Run: /Applications/Blender.app/Contents/MacOS/Blender --background --python blender/build_present.py
"""
import bpy, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_GLB = os.path.normpath(os.path.join(HERE, "..", "public", "models", "present.glb"))
RENDER = os.path.join(HERE, "render_present.png")

NAVY = (0.006, 0.018, 0.075, 1)  # #0C234B (linear)
RED = (0.40, 0.004, 0.016, 1)    # #AB0520 (linear)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
objs = []


def mat(name, color, rough=0.9):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = 0.0
    return m


BOXM = mat("BoxNavy", NAVY)
RIBBONM = mat("RibbonRed", RED, 0.85)

# ── ONE box (rounded cube) — the whole gift, a single shape ──
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.25))
box = bpy.context.active_object
box.name = "GiftBox"
box.scale = (0.62, 0.62, 0.5)
bm = box.modifiers.new("Bevel", "BEVEL")
bm.width = 0.03
bm.segments = 3
box.data.materials.append(BOXM)
for p in box.data.polygons:
    p.use_smooth = True
objs.append(box)


def strap(name, size, ztop):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.25))
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    o.data.materials.append(RIBBONM)
    objs.append(o)
    return o


# ── ribbon: two crossing straps, each slightly PROUD of the box so they read as applied ribbon
# (and never coplanar). Tops at slightly different heights so they don't z-fight where they cross.
strap("StrapY", (0.1, 0.64, 0.515), 0)   # runs front-back, proud in Y
strap("StrapX", (0.64, 0.1, 0.52), 0)    # runs left-right, proud in X


def loop(name, x, tilt):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.075, minor_radius=0.02, location=(x, 0.015, 0.55))
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = (math.radians(90), 0, math.radians(tilt))
    o.scale = (1.0, 0.42, 1.0)
    for p in o.data.polygons:
        p.use_smooth = True
    o.data.materials.append(RIBBONM)
    objs.append(o)
    return o


# ── small tidy bow: two loops + a little centre knot ──
loop("LoopR", 0.07, 24)
loop("LoopL", -0.07, -24)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.015, 0.545))
knot = bpy.context.active_object
knot.name = "Knot"
knot.scale = (0.06, 0.06, 0.055)
kb = knot.modifiers.new("Bevel", "BEVEL")
kb.width = 0.012
kb.segments = 2
knot.data.materials.append(RIBBONM)
for p in knot.data.polygons:
    p.use_smooth = True
objs.append(knot)

# ---- render check ----
for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
    try:
        scene.render.engine = eng
        break
    except Exception:
        pass
scene.world = bpy.data.worlds.new("W")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.05, 0.06, 0.08, 1)
sd = bpy.data.lights.new("Sun", "SUN"); sd.energy = 4.0
sun = bpy.data.objects.new("Sun", sd); scene.collection.objects.link(sun)
sun.rotation_euler = (math.radians(54), math.radians(12), math.radians(28))
cd = bpy.data.cameras.new("Cam"); cam = bpy.data.objects.new("Cam", cd); scene.collection.objects.link(cam)
cam.location = (0.85, -1.05, 0.8); cam.rotation_euler = (math.radians(63), 0, math.radians(40))
scene.camera = cam
scene.render.resolution_x = 640; scene.render.resolution_y = 640
scene.render.filepath = RENDER
bpy.ops.render.render(write_still=True)

for o in bpy.data.objects:
    o.select_set(o in objs)
bpy.context.view_layer.objects.active = objs[0]
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format="GLB", use_selection=True, export_yup=True, export_apply=True)
print("WROTE", OUT_GLB)
