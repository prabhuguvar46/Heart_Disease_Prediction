import numpy as np
import cv2
from keras.models import load_model
from flask import Flask, request, jsonify
import os
from flask_cors import CORS

# Load the trained model
model = load_model('heart_disease_cnn_model.keras')

# Define the label dictionary
label_dict = {
    'Myocardial Infarction Patient': 0,
    'History of MI': 1,
    'Abnormal heartbeat': 2,
    'Normal Person': 3
}

# Create a reverse mapping from index to label
index_to_label = {v: k for k, v in label_dict.items()}

def preprocess_image(image_path):
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (224, 224))
    image = image.astype('float32') / 255.0
    image = np.expand_dims(image, axis=0)  # Expand dims to match the input shape of the model
    return image

# Create Flask app
app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Save the image to a temporary location
    temp_path = os.path.join('temp', file.filename)
    file.save(temp_path)
    
    # Preprocess the image
    preprocessed_image = preprocess_image(temp_path)
    
    # Predict the class
    predictions = model.predict(preprocessed_image)
    predicted_class = np.argmax(predictions, axis=1)[0]
    
    # Map the predicted class index to the corresponding label
    predicted_label = index_to_label[predicted_class]
    
    prediction_probability = predictions[0][predicted_class]
    print(prediction_probability)
    # Remove the temporary file
    os.remove(temp_path)
    
    return jsonify({"predicted_class_index": int(predicted_class), "predicted_label": predicted_label,"prediction_probaility":float(prediction_probability)})

if __name__ == '__main__':
    os.makedirs('temp', exist_ok=True)
    app.run(debug=True)
