import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/UploadTranscript.css";
import { UploadCloud, CheckCircle, X } from "lucide-react";
import StepIndicator from "../components/StepIndicator";

export default function UploadTranscript() {
  // State variables to manage file selection and upload status
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Allowed file types for upload
  const SUPPORTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];

  // File type labels for preview display
  const readableTypeMap = {
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "image/jpeg": "JPEG",
    "image/png": "PNG",
  };

  // Handles selection via file picker
  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      const isSupported = SUPPORTED_TYPES.includes(file.type);
      if (isSupported) {
        setSelectedFiles(files);
        setUploaded(false);
        setError("");
      } else {
        setSelectedFiles(null);
        setUploaded(false);
        setError("Unsupported file type. Please upload a PDF, DOCX, JPEG, or PNG.");
      }
    }
  };

  // Handles dropped file input
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const isSupported = SUPPORTED_TYPES.includes(file.type);
      if (isSupported) {
        setSelectedFiles(files);
        setUploaded(false);
        setError("");
      } else {
        setSelectedFiles(null);
        setUploaded(false);
        setError("Unsupported file type. Please upload a PDF, DOCX, JPEG, or PNG.");
      }
    }
  };

  // Drag state UI feedback handlers
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const navigate = useNavigate();

  // Handles upload logic and mock API response
  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFiles[0]);

    try {
      const res = await fetch("/upload/transcript", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Server error during upload.");

      const { parsedData } = await res.json();
      console.log("RECEIVED PARSED DATA", parsedData);
      setUploaded(true);
      setIsUploading(false);

      setTimeout(() => {
        navigate("/edit-upload", { state: { parsedData } });;
      }, 1500);

    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload transcript. Please try again.");
      setIsUploading(false);
    }
  };

  // Resets file input and state
  const handleRemove = () => {
    setSelectedFiles(null);
    setUploaded(false);
    setError("");
  };

  return (
    <div className="upload-wrapper">
      {/* Left Section: File uploader */}
      <div className="upload-left">
        <StepIndicator activeStep={0} />
        <h1>Upload Transcript</h1>
        <p className="description">
          Upload your transcript or previous study plan to start mapping your courses
        </p>

        {/* Drop zone area */}
        <label
          htmlFor="file-upload"
          className={`drop-zone ${isDragging ? "drag-over" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <UploadCloud size={80} color="#fb923c" strokeWidth={1.5} />
          <p>
            <strong>Drag & drop files</strong> or <span className="browse-link">Browse</span>
          </p>
          <p className="formats">Supported formats: PDF, DOCX, JPEG, PNG</p>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </label>

        {/* Validation message */}
        {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}

        {/* File preview before upload */}
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="file-preview-horizontal">
            <div className="file-details">
              <p className="file-name">{selectedFiles[0].name}</p>
              <p className="file-meta">
                {(selectedFiles[0].size / 1024).toFixed(2)} KB • {readableTypeMap[selectedFiles[0].type] || "UNKNOWN FILE TYPE"}
              </p>
            </div>
            {!uploaded && (
              <button className="remove-btn" onClick={handleRemove}>
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Success message after upload */}
        {uploaded && (
          <div className="success-message">
            <CheckCircle size={18} /> File successfully uploaded!
          </div>
        )}

        {/* Upload button */}
        <button
          className={`upload-btn ${isUploading ? "uploading-btn" : ""}`}
          disabled={!selectedFiles || uploaded || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? "Uploading..." : selectedFiles ? `Upload ${selectedFiles[0].name}` : "Upload File"}
        </button>
      </div>

      {/* Right Section: Instructions panel */}
      <div className="upload-right">
        <h2>How it works</h2>
        <ol className="steps-list">
          <li><strong>Upload Transcript</strong>: We’ll parse your past courses.</li>
          <li><strong>Select Preferences</strong>: Choose your degree stream and pace.</li>
          <li><strong>Auto Generate Plan</strong>: See your course roadmap instantly.</li>
          <li><strong>Customise</strong>: Drag and drop courses. Edit freely.</li>
        </ol>
        <p className="tip-text">🚀 Your data stays local — fast and secure.</p>
      </div>
    </div>
  );
}
