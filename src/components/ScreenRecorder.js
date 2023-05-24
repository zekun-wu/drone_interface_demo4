import React, { useEffect, useRef, useState } from "react";

const ScreenRecorder = ({ currentIndex }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  useEffect(() => {
    // Access the video element
    const videoElement = videoRef.current;

    // Request permission to record the screen
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        // Set the stream as the source of the video element
        videoElement.srcObject = stream;

        // Create a MediaRecorder instance to record the stream
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        // Event handler for dataavailable event
        const handleDataAvailable = (event) => {
          if (event.data && event.data.size > 0) {
            setRecordedChunks((prevRecordedChunks) => [
              ...prevRecordedChunks,
              event.data,
            ]);
          }
        };

        // Add event listener for dataavailable event
        mediaRecorder.addEventListener("dataavailable", handleDataAvailable);

        // Start recording
        mediaRecorder.start();

        // Clean up on unmount
        return () => {
          mediaRecorder.removeEventListener(
            "dataavailable",
            handleDataAvailable
          );

          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }

          stream.getTracks().forEach((track) => track.stop());
        };
      })
      .catch((error) => {
        console.error("Error accessing screen media:", error);
      });
  }, []);

  useEffect(() => {
    if (currentIndex!==0 && currentIndex % 360 === 0 && recordedChunks.length > 0) {
      // Create a Blob from the recorded chunks
      const blob = new Blob(recordedChunks, { type: "video/mp4" });

      // Create a download link
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "screen-recording.mp4";

      // Programmatically click the download link to trigger the download
      downloadLink.click();

      // Reset the recorded chunks
      setRecordedChunks([]);
    }
  }, [currentIndex, recordedChunks]);

  return <video ref={videoRef} style={{ display: "none" }} />;
};

export default ScreenRecorder;
