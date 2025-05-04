"use client";

import React, { useCallback, useState, FormEvent } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";

interface PredictionResult {
  prediction: string;
  probability: number;
  image: string;
}
function convertPemToBinary(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----.*-----|\n/g, '');
  const binary = atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}


const ImageDropzone: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImage(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    multiple: false,
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!image) return setError("Please select an image");
  
    setLoading(true);
    setError(null);
  
    try {
      // 1. Generate AES key
      const aesKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
  
      // 2. Convert image to ArrayBuffer
      const imageBuffer = await image.arrayBuffer();
  
      // 3. Create random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
  
      // 4. Encrypt the image
      const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        imageBuffer
      );
  
      // 5. Load RSA Public Key
      const publicKeyPem = `-----BEGIN PUBLIC KEY-----
      YOUR_RSA_PUBLIC_KEY_HERE
      -----END PUBLIC KEY-----`;
  
      const importedPublicKey = await crypto.subtle.importKey(
        "spki",
        convertPemToBinary(publicKeyPem),
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
      );
  
      // 6. Export and encrypt AES key
      const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
      const encryptedKey = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        importedPublicKey,
        rawAesKey
      );
  
      // 7. Send all to backend
      const payload = {
        iv: Array.from(iv),
        encryptedKey: Array.from(new Uint8Array(encryptedKey)),
        encryptedData: Array.from(new Uint8Array(encryptedData)),
        filename: image.name,
      };
  
      const response = await axios.post("http://127.0.0.1:5000/api/predict", payload);
      setPrediction(response.data);
    } catch (err) {
      console.error(err);
      setError("Encryption or upload failed");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center">
      <form
        {...getRootProps()}
        className={`border-4 border-gray-600 rounded-lg p-12 text-center cursor-pointer w-[90%] my-5 ${
          isDragActive ? "bg-blue-100" : "bg-black"
        }`}
      >
        <input {...getInputProps()} />
        <p>{isDragActive ? "Drop the file here..." : "Drag & drop an image here, or click to select."}</p>

        {image && (
          <div className="mt-5">
            <Image src={URL.createObjectURL(image)} alt="Preview" width={200} height={200} />
          </div>
        )}
      </form>

      <button onClick={handleSubmit} className="my-4 bg-gray-500 text-white p-2 rounded">
        Upload Image
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {prediction && (
        <div className="text-center mt-4">
          <h2>Prediction: {prediction.prediction}</h2>
          <p>Probability: {(prediction.probability * 100).toFixed(2)}%</p>
          {prediction.image && (
            <div className="mt-4">
              <img
                src={`data:image/png;base64,${prediction.image}`}
                alt="Predicted"
                style={{ width: "200px", borderRadius: "8px" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
