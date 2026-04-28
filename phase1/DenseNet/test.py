import sys
from pathlib import Path
import onnxruntime as ort
import os

# --- CONFIG ---
# Either build a path relative to your script or set an absolute path.
# Example: project root -> voyage-imaging\backend\src\ml_model\tuberModel.onnx
MODEL_REL_PATH = Path(__file__).parent / "tuberModel.onnx"


# If the ONNX is in a different folder, set MODEL_PATH = Path(r"C:\full\path\to\tuberModel.onnx")
MODEL_PATH = MODEL_REL_PATH.resolve()

USE_GPU = False  # set True only if you have onnxruntime with CUDA installed

# --- Helpers ---
def load_session(model_path: Path, use_gpu: bool = False) -> ort.InferenceSession:
    if not model_path.exists():
        raise FileNotFoundError(f"ONNX model file not found: {model_path}")
    # Print for debugging
    print("Loading ONNX model from:", model_path)
    providers = ["CPUExecutionProvider"]
    if use_gpu:
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
    sess = ort.InferenceSession(str(model_path), providers=providers)
    return sess

def show_model_io(sess: ort.InferenceSession):
    print("\nModel inputs:")
    for i in sess.get_inputs():
        print("  name:", i.name, "shape:", i.shape, "type:", i.type)
    print("\nModel outputs:")
    for o in sess.get_outputs():
        print("  name:", o.name, "shape:", o.shape, "type:", o.type)

# --- Main ---
# Initialize session at module level so it can be imported
try:
    sess = load_session(MODEL_PATH, use_gpu=USE_GPU)
    if __name__ == "__main__":
        show_model_io(sess)
        print("\nModel loaded successfully.")
except FileNotFoundError as e:
    print("FileNotFoundError:", e, file=sys.stderr)
    print("Please check the model path. If the file exists, try printing MODEL_PATH to confirm.")
    if __name__ == "__main__":
        sys.exit(1)
except Exception as e:
    # Catch ONNXRuntime errors and show a more helpful message
    print("Failed to load the ONNX model. Error:", repr(e), file=sys.stderr)
    print("Possible causes:\n"
          "- model path incorrect or string had escape sequences\n"
          "- model file corrupted or incomplete\n"
          "- onnxruntime not compatible with this model\n"
          "- missing permissions\n")
    if __name__ == "__main__":
        sys.exit(2)


import numpy as np
from PIL import Image
import onnxruntime as ort

# If you already have `sess` from before, you don't need this
# MODEL_PATH already defined above, just reuse it
# sess = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])

# ImageNet-style normalization (very common; change if needed)
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

def preprocess(image_path: str) -> np.ndarray:
    img = Image.open(image_path).convert("RGB")
    img = img.resize((224, 224))          # (W, H)

    arr = np.array(img).astype(np.float32) / 255.0   # [0,1], shape (H, W, 3)
    arr = (arr - MEAN) / STD                         # normalize
    # DenseNet model expects [batch, channels, height, width] (NCHW format)
    arr = np.transpose(arr, (2, 0, 1))               # (3, H, W)
    arr = np.expand_dims(arr, axis=0)                # (1, 3, 224, 224)
    return arr

def predict_densenet(image_path: str):
    x = preprocess(image_path)

    input_name = sess.get_inputs()[0].name   # "actual_input"
    output_name = sess.get_outputs()[0].name # "output"

    logits = sess.run([output_name], {input_name: x})[0]  # shape (1, 2)
    logits = logits[0]  # (2,)

    # softmax to get probabilities
    exp = np.exp(logits - np.max(logits))
    probs = exp / exp.sum()

    pred_class = int(np.argmax(probs))
    return pred_class, probs

if __name__ == "__main__":
    # Use a test image from the TB database
    img_dir = Path(__file__).parent.parent / "TB_Chest_Radiography_Database" / "Normal"
    # Get the first available image
    images = list(img_dir.glob("*.png")) + list(img_dir.glob("*.jpg"))
    if not images:
        print("No test images found in TB_Chest_Radiography_Database/Normal/")
        sys.exit(1)
    img_path = str(images[0])
    print(f"Testing with image: {img_path}")
    pred_dense, probs_dense = predict_densenet(img_path)
    print("Raw probs:", probs_dense)
    print("Predicted class index:", pred_dense)
    if pred_dense == 0:
        print("Predicted Class: Normal")
    else:
        print("Predicted Class: Tuberculosis")

