import React from "react";

export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="d-flex align-items-center justify-content-center py-4">
      <div
        className="spinner-border text-primary spinner-border-sm me-2"
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="text-muted small fw-medium">{text}</span>
    </div>
  );
}
