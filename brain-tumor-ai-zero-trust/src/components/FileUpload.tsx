"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface PredictionResult {
  prediction: string;
  probability: number;
  image: string;
}

interface Props {
  onPrediction?: (data: PredictionResult) => void;
}

export default function FileUpload({ onPrediction }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post<PredictionResult>("http://127.0.0.1:5000/api/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPrediction(response.data);
      onPrediction?.(response.data);
    } catch (err) {
      setError("Error during prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col text-center py-6">
      <h1 className="text-4xl py-10">Brain Tumor Detection</h1>

      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Upload Image</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {prediction && (
        <div>
          <h2>Prediction: {prediction.prediction}</h2>
          <p>Probability: {(prediction.probability * 100).toFixed(2)}%</p>
          <div>
            <h3>Uploaded Image:</h3>
            <img src={`data:image/png;base64,${prediction.image}`} alt="Predicted" />
          </div>
        </div>
      )}
    </div>
  );
}
