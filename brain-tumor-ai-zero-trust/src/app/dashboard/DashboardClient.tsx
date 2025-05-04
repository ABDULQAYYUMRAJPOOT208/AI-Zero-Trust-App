// app/dashboard/DashboardClient.tsx
"use client";

import { useState } from "react";
// import FileUpload from "@/components/FileUpload";
import HeroSection from "@/components/HeroSection";
import Dropzone from "@/components/DropZone";
import Footer from "@/components/Footer";

// interface PredictionResult {
//   prediction: string;
//   probability: number;
//   image: string;
// }

export default function DashboardClient() {
  // const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // const handlePrediction = (predictionData: PredictionResult) => {
  //   setPrediction(predictionData);
  // };

  return (
    <div className="flex flex-col items-center h-full">
      <HeroSection />
      <Dropzone />
      {/* <FileUpload onPrediction={handlePrediction} />
      {prediction && (
        <div>
          <h3>Prediction: {prediction.prediction}</h3>
          <p>Probability: {(prediction.probability * 100).toFixed(2)}%</p>
        </div>
      )} */}
      <Footer />
    </div>
  );
}
