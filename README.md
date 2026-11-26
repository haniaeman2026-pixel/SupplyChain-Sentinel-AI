 <div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=240&color=0:080B19,35:211B55,70:5140A8,100:29B6D1&text=SUPPLYCHAIN%20SENTINEL%20AI&fontSize=37&fontColor=FFFFFF&fontAlignY=40&animation=fadeIn&desc=AI-POWERED%20SUPPLY%20CHAIN%20INTELLIGENCE&descSize=13&descAlignY=60&descColor=C9D4FF" />

<img src="https://readme-typing-svg.demolab.com?font=Manrope&weight=600&size=19&duration=2800&pause=900&color=9B8AFF&center=true&vCenter=true&width=750&lines=Intelligent+Supply+Chain+Risk+Detection;Multi-Agent+AI+Orchestration;Smarter+Decisions.+Stronger+Supply+Chains." />

<br/>

**An Enterprise-Style Multi-Agent AI Platform for Supply Chain Crisis Intelligence**

<br/>

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![CrewAI](https://img.shields.io/badge/CrewAI-6D5AE6?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Groq](https://img.shields.io/badge/Groq-111827?style=for-the-badge)

<br/>

### 🌐 Live Demo

**[🚀 Visit SupplyChain Sentinel AI](https://supplychain-sentinel-ai.vercel.app/)**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://supplychain-sentinel-ai.vercel.app/)

</div>

---

## ✨ Overview

**SupplyChain Sentinel AI** is an AI-powered supply chain intelligence platform designed to analyze operational disruptions, identify potential risks, evaluate supplier and inventory information, and generate structured recovery recommendations.

Powered by a multi-agent architecture, the platform coordinates specialized AI agents to investigate supply chain crises and support informed decision-making through a human-review workflow.

## 🚀 Key Features

- **AI Crisis Analysis** — Analyze supply chain disruptions and operational risks.
- **Multi-Agent Intelligence** — Coordinate specialized agents for risk, suppliers, inventory, logistics, and recovery.
- **Supplier Intelligence** — Evaluate supplier reliability, capacity, and lead times using available dataset records.
- **Inventory Planning** — Review stock levels, minimum stock, and daily demand.
- **Logistics Optimization** — Assess shipment delays and route conditions.
- **Recovery Strategy** — Generate prioritized recovery recommendations.
- **Human-in-the-Loop Review** — Review and record decisions on AI-generated reports.
- **Analytics Dashboard** — Monitor reports, pending reviews, and agent information.

## 🧠 Multi-Agent Architecture

| AI Agent | Responsibility |
|---|---|
| Demand & Risk Analyst | Identifies supply chain risks |
| Supplier Intelligence Agent | Evaluates supplier options |
| Inventory Planning Agent | Assesses stock and replenishment priorities |
| Logistics Optimization Agent | Reviews shipment and route conditions |
| Recovery Strategy Coordinator | Creates the consolidated recovery plan |

## ⚙️ Workflow

```text
Crisis Input
     |
     v
Demand & Risk Analysis
     |
     v
Supplier Intelligence
     |
     v
Inventory Planning
     |
     v
Logistics Optimization
     |
     v
Recovery Strategy
     |
     v
Human Review & Decision
     |
     v
Final Intelligence Report
```

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Backend | Python, FastAPI |
| AI Orchestration | CrewAI |
| LLM Provider | Groq |
| Frontend | React, Vite |
| Database | SQLite |
| Data Processing | CSV datasets |
| API Communication | REST API |

## 📁 Project Structure

```text
SupplyChain-Sentinel-AI/
│
├── backend/
│   ├── agents/
│   │   ├── crew.py
│   │   ├── definitions.py
│   │   └── tasks.py
│   │
│   ├── tools/
│   │   └── supply_chain_tools.py
│   │
│   ├── data/
│   │   ├── inventory.csv
│   │   ├── routes.csv
│   │   ├── shipments.csv
│   │   └── suppliers.csv
│   │
│   ├── config.py
│   ├── database.py
│   ├── schemas.py
│   └── main.py
│
├── frontend/
│   └── src/
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── main.jsx
│       └── style.css
│
├── .gitignore
├── requirements.txt
└── README.md
```

## 💻 Installation & Setup

**1. Clone the repository**

```bash
git clone https://github.com/haniaeman2026-pixel/SupplyChain-Sentinel-AI.git
cd SupplyChain-Sentinel-AI
```

**2. Create a virtual environment**

```bash
python -m venv .venv
```

**3. Activate the environment**

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

**4. Install backend dependencies**

```bash
pip install -r requirements.txt
```

**5. Configure environment variables**

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

Keep your API key private. Never commit `.env` to GitHub.

**6. Start the backend**

```bash
python -m uvicorn backend.main:app --reload
```

Backend API:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

**7. Start the frontend**

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🔐 Data & Intelligence Disclaimer

The platform uses its configured CSV datasets to support supply chain analysis. Its recommendations are based on available records and AI-generated reasoning. It does not independently verify live supplier availability, real-time shipment positions, or actual warehouse conditions.

## 🔮 Future Enhancements

- Real-time supply chain data integrations
- Advanced predictive risk analytics
- Interactive shipment visualization
- Agent execution monitoring
- Advanced reporting and export capabilities

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=rect&height=2&color=0:5140A8,50:8B6CFF,100:29B6D1" />

<img src="https://readme-typing-svg.demolab.com?font=Manrope&weight=700&size=24&duration=3000&pause=1000&color=A78BFA&center=true&vCenter=true&width=550&lines=Developed+by+Hania+Eman" />

**Building intelligent solutions for real-world challenges.**

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&height=110&section=footer&color=0:080B19,50:30266D,100:29B6D1" />

</div>
