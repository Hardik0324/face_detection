import React, { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import * as faceapi from "face-api.js";
import "./VideoCanvas.css";

const VideoCanvas = () => {
  const [videoURL, setVideoURL] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const fabricCanvas = useRef(null);

  useEffect(() => {
    // Initialize the Fabric canvas
    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "black",
      width: 800,
      height: 500,
    });

    // Load face-api.js models
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      setModelsLoaded(true);
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (videoURL && fabricCanvas.current && videoRef.current && modelsLoaded) {
      videoRef.current.src = videoURL;
      videoRef.current.addEventListener("loadeddata", () => {
        videoRef.current.play();
        startFaceDetection();
      });
    }
  }, [videoURL, modelsLoaded]);

  const startFaceDetection = () => {
    const videoEl = videoRef.current;
    const canvas = fabricCanvas.current;
    videoEl.addEventListener("play", () => {
      const displaySize = {
        width: 800, // Use videoWidth
        height: 500, // Use videoHeight
      };
      console.log(displaySize)
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        canvas.clear();
        resizedDetections.forEach((detection) => {
          const box = detection.detection.box;
          const rect = new fabric.Rect({
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            stroke: "red",
            strokeWidth: 2,
            fill: "transparent",
          });
          canvas.add(rect);
        });
      }, 100);
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} className="canvas" />
      {videoURL ? (
        <video
          ref={videoRef}
          width={800}
          height={500}
          style={{ display: "block" }}
          controls
        />
      ) : (
        <video ref={videoRef} width={800} height={500} />
      )}
      <button onClick={() => fileInputRef.current.click()} className="btnUp m-2 border border-black p-3 rounded-lg">Upload Video</button>
    </div>
  );
};

export default VideoCanvas;
