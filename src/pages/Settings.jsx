import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { callAIModel } from "../utils/aiClient";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Settings() {
  const { aiSettings, updateAiSettings, resetToSeedData } = useApp();

  const [apiKey, setApiKey] = useState(aiSettings.apiKey || "");
  const [model, setModel] = useState(aiSettings.model || "gemini-1.5-flash");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test AI connection state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    updateAiSettings({ apiKey: apiKey.trim(), model });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Temporarily save to test with entered key
      localStorage.setItem(
        "webera_ai_settings",
        JSON.stringify({ apiKey: apiKey.trim(), model }),
      );
      const res = await callAIModel('Say "Connection Successful" in 2 words');
      setTestResult({
        success: true,
        message: `Connected! Response: "${res}"`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || "Connection failed. Please check your API key.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4 max-w-4xl">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Settings & Configurations</h2>
        <p className="text-muted mb-0 small">
          Manage AI model keys and application local data
        </p>
      </div>

      {saveSuccess && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          Settings saved successfully to Local Storage!
        </div>
      )}

      {/* AI Settings Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="fw-bold mb-0 text-primary">
            <i className="bi bi-robot me-2"></i> AI Integration (Google Gemini)
          </h5>
        </div>
        <div className="card-body pt-0">
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Gemini API Key</label>
              <div className="input-group">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setApiKey("")}
                >
                  Clear
                </button>
              </div>
              <small className="text-muted">
                Key is stored only in your browser Local Storage and never sent
                to any server.
              </small>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">AI Model</label>
              <select
                className="form-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gemini-3.6-flash">
                  Gemini 3.6 Flash (Recommended)
                </option>
                <option value="gemini-flash-latest">Gemini Flash Latest</option>
                <option value="gemini-3.1-flash-lite">
                  Gemini 3.1 Flash Lite
                </option>
              </select>
            </div>

            {testResult && (
              <div
                className={`alert ${
                  testResult.success ? "alert-success" : "alert-danger"
                } mb-3`}
              >
                <i
                  className={`bi ${
                    testResult.success
                      ? "bi-check-circle"
                      : "bi-exclamation-triangle"
                  } me-2`}
                ></i>
                {testResult.message}
              </div>
            )}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-save me-1"></i> Save Settings
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleTestConnection}
                disabled={testing}
              >
                <i className="bi bi-lightning-charge me-1"></i>
                {testing ? "Testing..." : "Test AI Connection"}
              </button>
            </div>

            {testing && (
              <LoadingSpinner text="Testing connection with Gemini API..." />
            )}
          </form>
        </div>
      </div>

      {/* Seed Data Reset Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="fw-bold mb-0 text-danger">
            <i className="bi bi-arrow-counterclockwise me-2"></i> Reset
            Application Data
          </h5>
        </div>
        <div className="card-body pt-0">
          <p className="text-muted small">
            Reset all leads, projects, and invoices back to original sample demo
            data.
          </p>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              if (
                window.confirm(
                  "Reset all leads, projects & invoices to sample data?",
                )
              ) {
                resetToSeedData();
                alert("Data reset to demo state!");
              }
            }}
          >
            Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  );
}
