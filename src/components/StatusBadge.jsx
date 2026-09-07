import React from "react";

export default function StatusBadge({ status }) {
  const getBadgeClass = (status) => {
    switch (status) {
      // Leads
      case "New":
        return "bg-primary";
      case "Contacted":
        return "bg-info text-dark";
      case "Converted":
        return "bg-success";
      case "Lost":
        return "bg-danger";

      // Projects
      case "Not Started":
        return "bg-secondary";
      case "In Progress":
        return "bg-primary";
      case "In Review":
        return "bg-warning text-dark";
      case "Completed":
        return "bg-success";

      // Invoices
      case "Paid":
        return "bg-success";
      case "Pending":
        return "bg-warning text-dark";

      default:
        return "bg-secondary";
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)} rounded-pill`}>
      {status}
    </span>
  );
}
