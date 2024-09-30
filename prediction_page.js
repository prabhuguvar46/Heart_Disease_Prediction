document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagePreview = document.getElementById('imagePreview');
            const image = document.getElementById('image');
            image.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('predictButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert("Please select an image.");
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('image', file);

    fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const predictionResult = document.getElementById('predictionResult');
        const reportDiv = document.getElementById('report');

        if (data.prediction_probaility > 0.95) {
            predictionResult.innerHTML = `<p>Predicted Class: ${data.predicted_label}</p>`;
            const report = generateReport(data.predicted_label);
            reportDiv.innerHTML = `<p>${report}</p>`;
        } else {
            alert("Invalid input. Please try again with a different image.");
            predictionResult.innerHTML = '';
            reportDiv.innerHTML = ''; 
        }

        if (data.error) {
            predictionResult.textContent = `Error: ${data.error}`;
            reportDiv.innerHTML = '';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById('reportButton').addEventListener('click', function(event) {
    event.preventDefault();

    const reportContent = document.getElementById('report').innerHTML;
    if (!reportContent) {
        alert("No report available. Please run the prediction first.");
        return;
    }

    const reportModal = document.getElementById('reportModal');
    reportModal.style.display = 'block';
});

const modal = document.getElementById('reportModal');
const span = document.getElementsByClassName('close')[0];

span.onclick = function() {
    modal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

function generateReport(predictedLabel) {
    let report, riskLevel, recommendation;
    const normalizedLabel = predictedLabel.trim().toLowerCase();

    switch (normalizedLabel) {
        case 'myocardial infarction patient':
            report = "Myocardial Infarction (MI), commonly known as a heart attack, occurs when blood flow to the heart is blocked. This is a medical emergency.";
            riskLevel = "High Risk";
            recommendation = "Please visit a hospital immediately and consult a cardiologist for further treatment. Time is critical in minimizing damage to the heart.";
            break;

        case 'abnormal heartbeat':
            report = "An abnormal heartbeat, also known as arrhythmia, occurs when the heart beats irregularly, too fast, or too slow. It can be caused by various heart conditions.";
            riskLevel = "Moderate to High Risk";
            recommendation = "Consult a doctor for an in-depth evaluation. You may need further diagnostic tests such as an ECG and possibly treatment.";
            break;

        case 'history of mi':
            report = "A history of myocardial infarction means the patient has experienced a previous heart attack. This increases the risk of further cardiac events.";
            riskLevel = "Moderate to High Risk";
            recommendation = "Ongoing medical care and regular check-ups are necessary to monitor heart function and reduce risk factors. Meet a cardiologist to create a tailored care plan.";
            break;

        case 'normal person':
            report = "The heart appears to be functioning normally with no immediate signs of heart disease. Maintaining good health is still important.";
            riskLevel = "Low Risk";
            recommendation = "Continue with regular medical check-ups and a heart-healthy lifestyle, including exercise, a balanced diet, and managing stress.";
            break;

        default:
            report = "No specific information available for the entered condition.";
            console.warn("No matching label found for:", predictedLabel);
            riskLevel = "Unknown";
            recommendation = "Please consult a doctor for a more accurate diagnosis.";
            break;
    }

    return `
        <h2>Disease Information</h2>
        <p><strong>Condition:</strong> ${report}</p>
        <p><strong>Risk Level:</strong> ${riskLevel}</p>
        <p><strong>Recommendation:</strong> ${recommendation}</p>
    `;
}
