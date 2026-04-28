import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import torch.nn.functional as F
import sys
import os

# ==========================
# Device Configuration
# ==========================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ==========================
# Load Model
# ==========================
def load_model(model_path):
    model = models.densenet121(weights=None) 
    model.classifier = nn.Linear(model.classifier.in_features, 2)
    
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()
    
    return model


# ==========================
# Image Transform (MUST match training)
# ==========================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])


# ==========================
# Predict Function
# ==========================
def predict_densenet_gan(image_path):
    image = Image.open(image_path).convert("L")
    image = transform(image).unsqueeze(0).to(device)

    model_path = "DenseNet_GAN\\best_densenet_tb.pth"
    model = load_model(model_path)


    with torch.no_grad():
        output = model(image)
        probabilities = F.softmax(output, dim=1)
        confidence, predicted = torch.max(probabilities, 1)
    
    return predicted.item(), [confidence.item(), 1 - confidence.item()]


# ==========================
# Main
# ==========================
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print("Image file not found!")
        sys.exit(1)

    print("Classifying image...")
    label, confidence = predict_densenet_gan(image_path)

    print("\n===== RESULT =====")
    print("Prediction:", label)
    print(f"Confidence: {confidence[0]:.2f}%")