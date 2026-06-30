"""Build an ULTRA-REAL Arizona Wildcats jersey via Blender CLOTH simulation, headless.
Pipeline (see memory headless-blender-cloth-sim): tank-silhouette grid -> pin shoulders to a
hanger -> CLOTH modifier -> step-bake -> capture evaluated mesh -> solidify + smooth -> matte
double-sided fabric material with the ARIZONA/05/KURU graphic -> render front check -> export GLB.

Run: /Applications/Blender.app/Contents/MacOS/Blender --background --python blender/build_jersey.py
"""
import bpy, bmesh, math, os, random
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, "tex", "jersey_front.png")
OUT_GLB = os.path.normpath(os.path.join(HERE, "..", "public", "models", "jersey.glb"))
RENDER = os.path.join(HERE, "render_jersey.png")

W, H = 0.46, 0.64           # jersey width / height (Blender Z = up)
NX, NZ = 28, 40             # cloth grid resolution
random.seed(7)

# ---- fresh scene ----
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.gravity = (0, 0, -9.81)


# ---- tank silhouette ----
def outer(zn):
    if zn <= 0.5:
        return 1.0
    s = (zn - 0.5) / 0.5
    return max(0.22, (1.0 - 0.45 * math.sin(s * math.pi)) - 0.09 * s)


def neck(zn):
    return 0.0 if zn <= 0.70 else 0.36 * (zn - 0.70) / 0.30


def keep(x, z):
    xn = abs(x) / (W / 2)
    zn = z / H
    return (xn <= outer(zn) + 1e-6) and (xn >= neck(zn) - 1e-6)


verts, vidx, uvmap = [], {}, {}
for j in range(NZ + 1):
    for i in range(NX + 1):
        x = -W / 2 + W * i / NX
        z = H * j / NZ
        if keep(x, z):
            idx = len(verts)
            vidx[(i, j)] = idx
            y = (random.random() * 2 - 1) * 0.0028  # jitter so the sim folds
            verts.append((x, y, z))
            uvmap[idx] = (i / NX, j / NZ)

faces = []
for j in range(NZ):
    for i in range(NX):
        a = vidx.get((i, j)); b = vidx.get((i + 1, j))
        c = vidx.get((i + 1, j + 1)); d = vidx.get((i, j + 1))
        if None not in (a, b, c, d):
            faces.append((a, b, c, d))

mesh = bpy.data.meshes.new("JerseyMesh")
mesh.from_pydata(verts, [], faces)
mesh.update()
uvl = mesh.uv_layers.new(name="UV")
for poly in mesh.polygons:
    for li in poly.loop_indices:
        uvl.data[li].uv = uvmap[mesh.loops[li].vertex_index]

obj = bpy.data.objects.new("Jersey", mesh)
scene.collection.objects.link(obj)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# pin the very top strap row to the hanger
vg = obj.vertex_groups.new(name="pin")
for (i, j), idx in vidx.items():
    if j / NZ > 0.90:
        vg.add([idx], 1.0, "REPLACE")

# ---- cloth sim ----
mod = obj.modifiers.new("Cloth", "CLOTH")
cs = mod.settings
cs.mass = 0.30
cs.tension_stiffness = 20
cs.compression_stiffness = 20
cs.shear_stiffness = 20
cs.bending_stiffness = 10.0
cs.vertex_group_mass = "pin"
mod.collision_settings.use_self_collision = True
mod.collision_settings.self_distance_min = 0.002

scene.frame_start = 1
scene.frame_end = 85
for f in range(1, 86):
    scene.frame_set(f)
    bpy.context.view_layer.update()

# capture the settled drape into a static mesh
deps = bpy.context.evaluated_depsgraph_get()
draped = bpy.data.meshes.new_from_object(obj.evaluated_get(deps))
obj.modifiers.clear()
obj.data = draped

# give the cloth fabric body
sol = obj.modifiers.new("Solidify", "SOLIDIFY")
sol.thickness = 0.007
sol.offset = 0.0
bpy.ops.object.modifier_apply(modifier="Solidify")
for p in obj.data.polygons:
    p.use_smooth = True

# ---- fabric material ----
mat = bpy.data.materials.new("JerseyFabric")
mat.use_nodes = True
nt = mat.node_tree
bsdf = nt.nodes.get("Principled BSDF")
img = bpy.data.images.load(TEX)
img.colorspace_settings.name = "sRGB"
tx = nt.nodes.new("ShaderNodeTexImage")
tx.image = img
nt.links.new(tx.outputs["Color"], bsdf.inputs["Base Color"])
bsdf.inputs["Roughness"].default_value = 0.84
bsdf.inputs["Metallic"].default_value = 0.0
for sname in ("Sheen Weight", "Sheen"):
    if sname in bsdf.inputs:
        bsdf.inputs[sname].default_value = 0.30
        break
mat.use_backface_culling = False  # double-sided so folds/back read in three.js
obj.data.materials.append(mat)

# ---- hanger (rigid) ----
metal = bpy.data.materials.new("Hanger")
metal.use_nodes = True
mb = metal.node_tree.nodes.get("Principled BSDF")
mb.inputs["Base Color"].default_value = (0.62, 0.64, 0.67, 1)
mb.inputs["Metallic"].default_value = 0.9
mb.inputs["Roughness"].default_value = 0.35

bpy.ops.mesh.primitive_cylinder_add(radius=0.006, depth=0.40, location=(0, 0, H + 0.006))
bar = bpy.context.active_object
bar.rotation_euler = (0, math.radians(90), 0)
bar.data.materials.append(metal)

bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.0045, location=(0, 0, H + 0.05))
hook = bpy.context.active_object
hook.rotation_euler = (math.radians(90), 0, 0)
hook.data.materials.append(metal)

# ---- recenter so the hook top sits at the origin (jersey hangs below) ----
top_z = H + 0.05 + 0.026
for o in (obj, bar, hook):
    o.location.z -= top_z

# ---- render a front check ----
def set_engine():
    for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            scene.render.engine = eng
            return
        except Exception:
            pass


set_engine()
world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.05, 0.06, 0.08, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0

sun_d = bpy.data.lights.new("Sun", "SUN")
sun_d.energy = 4.0
sun = bpy.data.objects.new("Sun", sun_d)
scene.collection.objects.link(sun)
sun.rotation_euler = (math.radians(58), math.radians(8), math.radians(22))

cam_d = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_d)
scene.collection.objects.link(cam)
cam.location = (0, -1.25, -0.34)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam

scene.render.resolution_x = 560
scene.render.resolution_y = 800
scene.render.filepath = RENDER
bpy.ops.render.render(write_still=True)

# ---- export GLB ----
for o in bpy.data.objects:
    o.select_set(o in (obj, bar, hook))
bpy.context.view_layer.objects.active = obj
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB,
    export_format="GLB",
    use_selection=True,
    export_yup=True,
    export_apply=True,
)

# bbox report (in three.js axes: y up after yup export)
mn = Vector((1e9, 1e9, 1e9)); mx = Vector((-1e9, -1e9, -1e9))
for o in (obj, bar, hook):
    for c in o.bound_box:
        wc = o.matrix_world @ Vector(c)
        mn = Vector(map(min, mn, wc)); mx = Vector(map(max, mx, wc))
print("JERSEY_BBOX_min", tuple(round(v, 3) for v in mn))
print("JERSEY_BBOX_max", tuple(round(v, 3) for v in mx))
print("WROTE", OUT_GLB)
