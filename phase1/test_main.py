import sys
from pathlib import Path
import numpy as np
import json
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent / "ResNet"))
sys.path.insert(0, str(Path(__file__).parent / "DenseNet"))
sys.path.insert(0, str(Path(__file__).parent / "DenseNet_GAN"))

# Import prediction functions from both models
from ResNet.test import predict_resnet
from DenseNet.test import predict_densenet
from DenseNet_GAN.test import predict_densenet_gan

def run_trivial_prediction(image_path: str):
    # Validate image exists
    img_path = Path(image_path)
    if not img_path.exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    print(f"\n{'='*60}")
    print(f"Testing image: {image_path}")
    print(f"{'='*60}\n")
    
    # Get ResNet predictions
    print("--- ResNet Predictions ---")
    pred_res, probs_res = predict_resnet(image_path)
    print(f"Predicted class index: {pred_res}")
    print(f"Probabilities: {probs_res}")
    print(f"Predicted Class: {'Normal' if pred_res == 0 else 'Tuberculosis'}\n")
    
    # Get DenseNet predictions
    print("--- DenseNet Predictions ---")
    pred_dense, probs_dense = predict_densenet(image_path)
    print(f"Predicted class index: {pred_dense}")
    print(f"Probabilities: {probs_dense}")
    print(f"Predicted Class: {'Normal' if pred_dense == 0 else 'Tuberculosis'}\n")

    #Get DenseNet_GAN predictions
    print("--- DenseNet_GAN Predictions ---")
    try:
        pred_gan, probs_gan = predict_densenet_gan(image_path)
        print(f"Predicted class index: {pred_gan}")
        print(f"Probabilities: {probs_gan}")
        print(f"Predicted Class: {'Normal' if pred_gan == 0 else 'Tuberculosis'}\n")
    except Exception as e:
        print(f"Warning: DenseNet GAN failed ({e})")
        pred_gan = 0
        probs_gan = [1.0, 0.0]

    
    # Summary
    print(f"{'='*60}")
    print("RESULTS SUMMARY")
    print(f"{'='*60}")
    print(f"ResNet  - Class: {pred_res} (Probs: Normal={probs_res[0]:.4f}, TB={probs_res[1]:.4f})")
    print(f"DenseNet- Class: {pred_dense} (Probs: Normal={probs_dense[0]:.4f}, TB={probs_dense[1]:.4f})")
    print(f"DenseNet_GAN- Class: {pred_gan} (Probs: Normal={probs_gan[0]:.4f}, TB={probs_gan[1]:.4f})")
    print(f"{'='*60}\n")
    
    result_dict = {
        "resnet_prob_normal": float(probs_res[0]),
        "resnet_prob_tb": float(probs_res[1]),
        "densenet_prob_normal": float(probs_dense[0]),
        "densenet_prob_tb": float(probs_dense[1]),
        "gan_prob_normal": float(probs_gan[0]),
        "gan_prob_tb": float(probs_gan[1])
    }
    
    print("\n---JSON_OUTPUT_START---")
    print(json.dumps(result_dict))
    print("---JSON_OUTPUT_END---\n")
    
    return {
        "pred_res": pred_res,
        "probs_res": probs_res,
        "pred_dense": pred_dense,
        "probs_dense": probs_dense
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        # Default: use first available image from Normal dataset
        img_dir = Path(__file__).parent / "TB_Chest_Radiography_Database" / "Normal"
        images = list(img_dir.glob("*.png")) + list(img_dir.glob("*.jpg"))
        
        if not images:
            print("No test images found in TB_Chest_Radiography_Database/Normal/")
            sys.exit(1)
        
        image_path = str(images[0])
        print(f"Using default image: {image_path}")

    try:
        results = run_trivial_prediction(image_path)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


