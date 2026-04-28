const API_URL = 'http://localhost:5000/api/inference';

export interface MLPrediction {
    resnet_prob_normal: number;
    resnet_prob_tb: number;
    densenet_prob_normal: number;
    densenet_prob_tb: number;
    gan_prob_normal: number;
    gan_prob_tb: number;
}

export const analyzeXray = async (imageBase64: string): Promise<MLPrediction> => {
    const res = await fetch(`${API_URL}/analyze-base64`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to analyze image');
    }
    
    const jsonStr = await res.json();
    return jsonStr.data;
};
