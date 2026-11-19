
const API_BASE = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || `Request failed: ${response.status}`);
  }

  return data;
}

export const api = {
  health: () => request("/health"),

  dashboard: () => request("/dashboard"),

  agents: () => request("/agents"),

  reports: () => request("/reports"),

  analyze: (payload) =>
    request("/analyze", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  startAnalysis: (payload) =>
    request("/analyze/start", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  workflowResult: (jobId) => request(`/workflow/${encodeURIComponent(jobId)}/result`),

  activeWorkflows: () => request("/workflow/active"),

  workflowEventsUrl: (jobId) => `${API_BASE}/workflow/${encodeURIComponent(jobId)}/events`,

  review: (payload) =>
    request("/review", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
