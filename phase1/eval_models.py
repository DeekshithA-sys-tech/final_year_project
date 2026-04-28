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

def evaluate():
    base_dir = Path(__file__).parent / "TB_Chest_Radiography_Database"
    normal_dir = base_dir / "Normal"
    tb_dir = base_dir / "Tuberculosis"

    normal_imgs = list(normal_dir.glob("*.png")) + list(normal_dir.glob("*.jpg"))
    tb_imgs = list(tb_dir.glob("*.png")) + list(tb_dir.glob("*.jpg"))

    random.seed(42)
    # Take up to 20 images from each class to evaluate quickly
    normal_subset = random.sample(normal_imgs, min(20, len(normal_imgs)))
    tb_subset = random.sample(tb_imgs, min(20, len(tb_imgs)))

    print(f"Evaluating {len(normal_subset)} Normal and {len(tb_subset)} TB images...")

    def eval_subset(subset, label_name, true_class):
        res_correct = 0
        dense_correct = 0
        gan_correct = 0
        
        for img in subset:
            img_path = str(img)
            try:
                p_res, _ = predict_resnet(img_path)
                if p_res == true_class: res_correct += 1
            except: pass
            
            try:
                p_dense, _ = predict_densenet(img_path)
                if p_dense == true_class: dense_correct += 1
            except: pass
            
            try:
                p_gan, _ = predict_densenet_gan(img_path)
                if p_gan == true_class: gan_correct += 1
            except: pass

        print(f"--- Results for {label_name} (Class {true_class}) ---")
        print(f"ResNet      : {res_correct}/{len(subset)} correct ({(res_correct/len(subset))*100:.1f}%)")
        print(f"DenseNet    : {dense_correct}/{len(subset)} correct ({(dense_correct/len(subset))*100:.1f}%)")
        print(f"DenseNet_GAN: {gan_correct}/{len(subset)} correct ({(gan_correct/len(subset))*100:.1f}%)")

    
    # Let's assume Normal is 0 and TB is 1 based on test.py files (Normal=0 in print statement)
    eval_subset(normal_subset, "Normal", 0)
    eval_subset(tb_subset, "Tuberculosis", 1)

if __name__ == "__main__":
    evaluate()
