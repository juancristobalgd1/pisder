# Calcula los vectores de texto por tramos y guarda cada tramo (se puede reanudar)
import json, os, sys, time, numpy as np, torch
from sentence_transformers import SentenceTransformer
torch.set_num_threads(os.cpu_count())
R = "/workspace/pisoya/ingest/ia"; DIM = 256; T = 64
an = json.load(open(f"{R}/anuncios.json"))
dt = torch.float32 if os.environ.get("FP32") else torch.bfloat16
m = SentenceTransformer("google/embeddinggemma-2", config_kwargs={"audio_config": None, "vision_config": None},
                        model_kwargs={"torch_dtype": dt, "low_cpu_mem_usage": True})
def doc(a):
    ex = ", ".join(a["extras"])
    return f"title: {a['titulo']} | text: {a['descripcion']}" + (f" Extras: {ex}" if ex else "")
os.makedirs(f"{R}/tv_parts", exist_ok=True)
lim = int(os.environ.get("LIMITE", len(an)))
for i in range(0, min(lim, len(an)), T):
    f = f"{R}/tv_parts/{i:05d}.npy"
    if os.path.exists(f): continue
    t = time.time()
    with torch.inference_mode():
        v = m.encode([doc(a) for a in an[i:i+T]], batch_size=8, truncate_dim=DIM,
                     convert_to_tensor=True, show_progress_bar=False).float().cpu().numpy()
    np.save(f, v); print(i, len(v), round(time.time()-t, 1), "s", flush=True)
print("FIN", flush=True)
