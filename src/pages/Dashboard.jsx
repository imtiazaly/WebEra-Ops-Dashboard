import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import SummaryCard from "../components/SummaryCard";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency, formatDate } from "../utils/formatters";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

export default function Dashboard() {
  const { leads, projects, invoices } = useApp();

  const stats = useMemo(() => {
    const activeProjects = projects.filter(
      (p) => p.status !== "Completed",
    ).length;
    const completedProjects = projects.filter(
      (p) => p.status === "Completed",
    ).length;
    const pendingAmount = invoices
      .filter((inv) => inv.status === "Pending")
      .reduce((sum, inv) => sum + inv.amount, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const convertedThisMonth = leads.filter(
      (l) => l.status === "Converted" && new Date(l.createdAt) >= startOfMonth,
    ).length;

    return {
      totalLeads: leads.length,
      activeProjects,
      completedProjects,
      pendingAmount,
      convertedThisMonth,
    };
  }, [leads, projects, invoices]);

  // Chart data — Leads by Status (Doughnut)
  const leadStatusCounts = useMemo(() => {
    const counts = { New: 0, Contacted: 0, Converted: 0, Lost: 0 };
    leads.forEach((l) => {
      if (counts[l.status] !== undefined) counts[l.status]++;
    });
    return counts;
  }, [leads]);

  const leadChartData = {
    labels: Object.keys(leadStatusCounts),
    datasets: [
      {
        data: Object.values(leadStatusCounts),
        backgroundColor: ["#0d6efd", "#0dcaf0", "#198754", "#dc3545"],
        borderWidth: 0,
      },
    ],
  };

  // Chart data — Projects by Status (Bar)
  const projectStatusCounts = useMemo(() => {
    const counts = {
      "Not Started": 0,
      "In Progress": 0,
      "In Review": 0,
      Completed: 0,
    };
    projects.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    return counts;
  }, [projects]);

  const projectChartData = {
    labels: Object.keys(projectStatusCounts),
    datasets: [
      {
        label: "Projects",
        data: Object.values(projectStatusCounts),
        backgroundColor: ["#6c757d", "#0d6efd", "#ffc107", "#198754"],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { padding: 16 } } },
  };

  // Recent activity — last 5 items combined
  const recentActivity = useMemo(() => {
    const items = [
      ...leads.map((l) => ({
        id: l.id,
        type: "Lead",
        name: l.clientName,
        status: l.status,
        date: l.createdAt,
        link: "/leads",
      })),
      ...projects.map((p) => ({
        id: p.id,
        type: "Project",
        name: p.projectName,
        status: p.status,
        date: p.createdAt,
        link: "/projects",
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    return items;
  }, [leads, projects]);

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0 small">Welcome back to WebEra Ops</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg">
          <SummaryCard
            title="Total Leads"
            value={stats.totalLeads}
            icon="bi-people-fill"
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-lg">
          <SummaryCard
            title="Active Projects"
            value={stats.activeProjects}
            icon="bi-kanban-fill"
            color="warning"
          />
        </div>
        <div className="col-sm-6 col-lg">
          <SummaryCard
            title="Completed"
            value={stats.completedProjects}
            icon="bi-check-circle-fill"
            color="success"
          />
        </div>
        <div className="col-sm-6 col-lg">
          <SummaryCard
            title="Pending Amount"
            value={formatCurrency(stats.pendingAmount)}
            icon="bi-cash-stack"
            color="danger"
          />
        </div>
        <div className="col-sm-6 col-lg">
          <SummaryCard
            title="Converted (Month)"
            value={stats.convertedThisMonth}
            icon="bi-graph-up-arrow"
            color="info"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="fw-bold text-muted text-uppercase mb-3">
                Leads by Status
              </h6>
              <div style={{ height: "260px" }}>
                <Doughnut data={leadChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="fw-bold text-muted text-uppercase mb-3">
                Projects by Status
              </h6>
              <div style={{ height: "260px" }}>
                <Bar
                  data={projectChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold text-muted text-uppercase mb-3">
            Recent Activity
          </h6>
          {recentActivity.length === 0 ? (
            <p className="text-muted text-center py-3 mb-0">No activity yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span
                          className={`badge bg-${item.type === "Lead" ? "info" : "primary"} bg-opacity-10 text-${item.type === "Lead" ? "info" : "primary"}`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="fw-medium">{item.name}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="text-muted small">
                        {formatDate(item.date)}
                      </td>
                      <td>
                        <Link
                          to={item.link}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          View <i className="bi bi-arrow-right"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
