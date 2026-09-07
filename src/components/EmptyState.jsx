import React from "react";

export default function EmptyState({
  icon = "bi-inbox",
  title,
  description,
  actionText,
  onAction,
}) {
  return (
    <div className="text-center py-5 px-3 card bg-light border-dashed">
      <div className="mb-3 text-muted">
        <i className={`bi ${icon} display-4`}></i>
      </div>
      <h5 className="fw-bold">{title}</h5>
      <p className="text-muted max-w-md mx-auto small mb-3">{description}</p>
      {actionText && onAction && (
        <div>
          <button className="btn btn-primary btn-sm px-3" onClick={onAction}>
            <i className="bi bi-plus-lg me-1"></i> {actionText}
          </button>
        </div>
      )}
    </div>
  );
}
