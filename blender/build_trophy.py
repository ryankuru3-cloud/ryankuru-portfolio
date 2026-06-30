"""DECA "Arizona" trophy — CLEAN flat rebuild. (Ryan's Meshy shape can't be color-textured cleanly: the
flag is ENGRAVED and the DECA diamond is a deep 3D feature that won't flatten — laying a flat color flag
on it double-images + the diamond distorts.) So the design is carried ENTIRELY by a crisp flat texture on
a SMOOTH Arizona panel. Panel = opaque flag print; panel edges + base = clear acrylic. Premium, solid
colors, no cracks. Authored Z-up, exported yup; origin at base-bottom-center.

Run: /Applications/Blender.app/Contents/MacOS/Blender --background --python blender/build_trophy.py
"""
import bpy, bmesh, os

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.normpath(os.path.join(HERE, "..", "public", "textures", "trophy_flag.png"))
OUT_GLB = os.path.normpath(os.path.join(HERE, "..", "public", "models", "trophy.glb"))

# Arizona silhouette (nx right 0..1, nz up 0..1), CW from NW — straight N (Utah) + E (NM) edges,
# straight S (Gadsden) border with the small Sonora step, the SW Colorado-River diagonal, and a
# slightly-leaning W edge. Traced to read as a faithful Arizona, not a plain rectangle+cut.
NAZ = [
    (0.03, 1.00),   # NW
    (1.00, 1.00),   # NE
    (1.00, 0.00),   # SE
    (0.46, 0.00),   # S border (straight)
    (0.43, 0.075),  # small step up (Sonora jog)
    (0.22, 0.075),  # continue W along the step
    (0.105, 0.20),  # SW diagonal lower (Colorado bend)
    (0.00, 0.36),   # SW diagonal upper -> W edge
]
Wm, Hm, Tp = 0.46, 0.42, 0.05
BASE_W, BASE_D, BASE_H = 0.34, 0.13, 0.05
PZ0 = BASE_H - 0.02

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def principled(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    return m, m.node_tree.nodes.get("Principled BSDF")

flag_mat, fb = principled("FlagPrint")
img = bpy.data.images.load(TEX)
tx = flag_mat.node_tree.nodes.new("ShaderNodeTexImage"); tx.image = img
flag_mat.node_tree.links.new(fb.inputs["Base Color"], tx.outputs["Color"])
fb.inputs["Roughness"].default_value = 0.25
fb.inputs["Metallic"].default_value = 0.0

acr_mat, ab = principled("Acrylic")
ab.inputs["Base Color"].default_value = (0.9, 0.94, 0.98, 1)
ab.inputs["Roughness"].default_value = 0.04
ab.inputs["IOR"].default_value = 1.49
for k in ("Transmission Weight", "Transmission"):
    if k in ab.inputs:
        ab.inputs[k].default_value = 1.0
        break

# ── flat Arizona panel ──
bm = bmesh.new()
vs = [bm.verts.new((-Wm / 2 + nx * Wm, 0.0, PZ0 + nz * Hm)) for (nx, nz) in NAZ]
face = bm.faces.new(vs)
bm.normal_update()
if face.normal.y > 0:
    face.normal_flip()
pmesh = bpy.data.meshes.new("PanelMesh"); bm.to_mesh(pmesh); bm.free()
panel = bpy.data.objects.new("Panel", pmesh); scene.collection.objects.link(panel)
bpy.context.view_layer.objects.active = panel; panel.select_set(True)
sol = panel.modifiers.new("Solidify", "SOLIDIFY"); sol.thickness = Tp; sol.offset = 1.0
bev = panel.modifiers.new("Bevel", "BEVEL"); bev.width = 0.006; bev.segments = 2
bpy.ops.object.modifier_apply(modifier="Solidify")
bpy.ops.object.modifier_apply(modifier="Bevel")

pmesh.materials.append(flag_mat)   # 0
pmesh.materials.append(acr_mat)    # 1
uv = pmesh.uv_layers.new(name="UVMap")
for p in pmesh.polygons:
    if p.normal.y < -0.85:
        p.material_index = 0
        for li in p.loop_indices:
            co = pmesh.vertices[pmesh.loops[li].vertex_index].co
            uv.data[li].uv = ((co.x + Wm / 2) / Wm, (co.z - PZ0) / Hm)
    else:
        p.material_index = 1
bpy.ops.object.shade_smooth()

# ── clear-acrylic base ──
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, BASE_H / 2))
base = bpy.context.active_object; base.name = "Base"
base.scale = (BASE_W, BASE_D, BASE_H)
bb = base.modifiers.new("Bevel", "BEVEL"); bb.width = 0.004; bb.segments = 2
bpy.context.view_layer.objects.active = base
bpy.ops.object.modifier_apply(modifier="Bevel")
base.data.materials.append(acr_mat)
for p in base.data.polygons:
    p.use_smooth = False

for o in (panel, base):
    o.select_set(True)
bpy.context.view_layer.objects.active = panel
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format="GLB", use_selection=True,
                          export_yup=True, export_apply=True)
print("WROTE", OUT_GLB)
