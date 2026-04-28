import sys
from pathlib import Path
import random
import time

sys.path.insert(0, str(Path(__file__).parent / "ResNet"))
sys.path.insert(0, str(Path(__file__).parent / "DenseNet"))
sys.path.insert(0, str(Path(__file__).parent / "DenseNet_GAN"))

from ResNet.test import predict_resnet
from DenseNet.test import predict_densenet
from DenseNet_GAN.test import predict_densenet_gan

def fix_gan_path():
    # Fix the path issue in memory by modifying DenseNet_GAN/test.py to use absolute path
    pass

def evaluate():
    base_dir = Path(__file__).parent / "TB_Chest_Radiography_Database"
    normal_dir = base_dir / "Normal"
    tb_dir = base_dir / "Tuberculosis"

    normal_imgs = list(normal_dir.glob("*.png")) + list(normal_dir.glob("*.jpg"))
    tb_imgs = list(tb_dir.glob("*.png")) + list(tb_dir.glob("*.jpg"))

    random.seed(42)
    # Take up to 5 images from each class to evaluate quickly and print debug info
    normal_subset = random.sample(normal_imgs, min(5, len(normal_imgs)))
    tb_subset = random.sample(tb_imgs, min(5, len(tb_imgs)))

    print(f"Evaluating {len(normal_subset)} Normal and {len(tb_subset)} TB images...")

    def eval_subset(subset, label_name, true_class):
        res_correct = 0
        dense_correct = 0
        gan_correct = 0
        
        for img in subset:
            img_path = str(img)
            print(f"\n--- Testing {img.name} (True class: {true_class}) ---")
            
            try:
                p_res, probs_res = predict_resnet(img_path)
                print(f"ResNet      : pred={p_res}, probs={probs_res}")
                if p_res == true_class: res_correct += 1
            except Exception as e:
                print(f"ResNet Error: {e}")
            
            try:
                p_dense, probs_dense = predict_densenet(img_path)
                print(f"DenseNet    : pred={p_dense}, probs={probs_dense}")
                if p_dense == true_class: dense_correct += 1
            except Exception as e:
                print(f"DenseNet Error: {e}")
            
            try:
                # Need to manually pass the right CWD or patch the function, but for now we see if it errors
                p_gan, probs_gan = predict_densenet_gan(img_path)
                print(f"DenseNet_GAN: pred={p_gan}, probs={probs_gan}")
                if p_gan == true_class: gan_correct += 1
            except Exception as e:
                print(f"DenseNet_GAN Error: {e}")

    
    # Let's assume Normal is 0 and TB is 1 based on test.py files (Normal=0 in print statement)
    eval_subset(normal_subset, "Normal", 0)
    eval_subset(tb_subset, "Tuberculosis", 1)

if __name__ == "__main__":
    evaluate()
