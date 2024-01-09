import React, { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";

const VideoCanvas = () => {
  const [videoURL, setVideoURL] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const fabricCanvas = useRef(null);

  // Fixed dimensions for the canvas
  const canvasWidth = 800;
  const canvasHeight = 600;

  useEffect(() => {
    // Initialize the Fabric canvas with fixed dimensions
    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "blue",
      width: canvasWidth,
      height: canvasHeight,
    });
  }, []);

  useEffect(() => {
    if (videoURL && fabricCanvas.current && videoRef.current) {
      videoRef.current.src = videoURL;
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [videoURL]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("play", () => {
        function draw() {
          if (!videoRef.current.paused && !videoRef.current.ended) {
            fabricCanvas.current.clear();

            // Calculate the scale to fit the video within the canvas
            const scale = Math.min(
              canvasWidth / videoRef.current.videoWidth,
              canvasHeight / videoRef.current.videoHeight
            );

            fabricCanvas.current.add(
              new fabric.Image(videoRef.current, {
                scaleX: scale,
                scaleY: scale,
                left: (canvasWidth - videoRef.current.videoWidth * scale) / 2,
                top: (canvasHeight - videoRef.current.videoHeight * scale) / 2,
              })
            );

            requestAnimationFrame(draw);
          }
        }
        draw();
      });
    }
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <button onClick={() => fileInputRef.current.click()}>Upload Video</button>
      <canvas ref={canvasRef} />
      <video ref={videoRef} style={{ display: "block" }} controls />
    </div>
  );
};

export default VideoCanvas;
