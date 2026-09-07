import React from "react";

export default function SummaryCard({
  title,
  value,
  icon,
  color = "primary",
  subtitle,
}) {
  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body d-flex align-items-center">
        <div
          className={`rounded-circle bg-${color} bg-opacity-10 p-3 text-${color} me-3`}
        >
          <i className={`bi ${icon} fs-3`}></i>
        </div>
        <div>
          <h6 className="text-muted mb-1 text-uppercase fw-semibold fs-7">
            {title}
          </h6>
          <h3 className="fw-bold mb-0">{value}</h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
      </div>
    </div>
  );
}
