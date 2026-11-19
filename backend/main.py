
import json
import queue
import threading
import uuid

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.config import APP_NAME, CORS_ORIGINS, initialize_directories
from backend.schemas import CrisisRequest, ReviewRequest
from backend.database import (
    initialize_database,
    save_report,
    get_reports,
    get_report,
    save_review
)
from backend.agents.crew import run_supply_chain_crew


app = FastAPI(
    title=APP_NAME,
    description="Multi-agent supply chain crisis intelligence platform",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


WORKFLOW_STAGES = [
    {
        "id": "demand",
        "name": "Demand & Risk Analyst",
        "department": "Risk Intelligence"
    },
    {
        "id": "supplier",
        "name": "Supplier Intelligence Agent",
        "department": "Procurement"
    },
    {
        "id": "inventory",
        "name": "Inventory Planning Agent",
        "department": "Inventory"
    },
    {
        "id": "logistics",
        "name": "Logistics Optimization Agent",
        "department": "Logistics"
    },
    {
        "id": "recovery",
        "name": "Recovery Strategy Coordinator",
        "department": "Recovery"
    }
]

# In-memory workflow registry.
# Reports themselves continue to be stored in SQLite.
workflow_jobs: dict[str, dict[str, Any]] = {}
workflow_lock = threading.Lock()


def emit_event(job_id: str, event_type: str, data: dict):
    job = workflow_jobs.get(job_id)

    if not job:
        return

    event = {
        "type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **data
    }

    job["events"].put(event)


def execute_workflow(job_id: str, crisis: CrisisRequest):
    job = workflow_jobs[job_id]
    completed_count = 0

    def on_task_completed(task_output):
        nonlocal completed_count

        with workflow_lock:
            current_index = completed_count
            completed_count += 1

        if current_index >= len(WORKFLOW_STAGES):
            return

        completed_stage = WORKFLOW_STAGES[current_index]

        raw_output = getattr(task_output, "raw", None) or getattr(task_output, "output", None)
        output_preview = str(raw_output).strip()[:700] if raw_output is not None else "Task callback received; output preview unavailable."
        emit_event(
            job_id,
            "stage_completed",
            {
                "stage_id": completed_stage["id"],
                "stage_name": completed_stage["name"],
                "completed": completed_count,
                "total": len(WORKFLOW_STAGES),
                "output_preview": output_preview
            }
        )

        next_index = current_index + 1

        if next_index < len(WORKFLOW_STAGES):
            next_stage = WORKFLOW_STAGES[next_index]

            emit_event(
                job_id,
                "stage_started",
                {
                    "stage_id": next_stage["id"],
                    "stage_name": next_stage["name"],
                    "department": next_stage["department"],
                    "completed": completed_count,
                    "total": len(WORKFLOW_STAGES)
                }
            )

    try:
        result = run_supply_chain_crew(
            crisis,
            on_task_completed=on_task_completed
        )

        report = {
            "report_id": str(uuid.uuid4())[:8].upper(),
            "crisis_type": crisis.crisis_type,
            "description": crisis.description,
            "affected_product": crisis.affected_product,
            "affected_region": crisis.affected_region,
            "urgency": crisis.urgency,
            "status": "Pending Review",
            "analysis": result,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "human_review_required": True
        }

        save_report(report)

        job["result"] = report
        job["status"] = "completed"

        emit_event(
            job_id,
            "workflow_completed",
            {
                "report_id": report["report_id"],
                "message": "All CrewAI tasks completed successfully."
            }
        )

    except Exception as exc:
        job["status"] = "failed"
        job["error"] = str(exc)

        failed_stage = WORKFLOW_STAGES[min(completed_count, len(WORKFLOW_STAGES) - 1)]
        emit_event(
            job_id,
            "workflow_failed",
            {
                "failed_stage_id": failed_stage["id"],
                "failed_stage_name": failed_stage["name"],
                "completed": completed_count,
                "total": len(WORKFLOW_STAGES),
                "message": str(exc)
            }
        )

    finally:
        job["finished"] = True
        job["events"].put(None)


@app.on_event("startup")
def startup():
    initialize_directories()
    initialize_database()


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "application": APP_NAME,
        "framework": "CrewAI + FastAPI"
    }


@app.get("/api/dashboard")
def dashboard():
    reports = get_reports()

    return {
        "total_reports": len(reports),
        "critical_reports": sum(
            1 for report in reports
            if report.get("urgency") == "Critical"
        ),
        "pending_reviews": sum(
            1 for report in reports
            if report.get("status") == "Pending Review"
        ),
        "recent_reports": reports[:5]
    }


@app.get("/api/agents")
def agents():
    return {
        "agents": [
            {
                "name": stage["name"],
                "department": stage["department"]
            }
            for stage in WORKFLOW_STAGES
        ]
    }


@app.post("/api/analyze/start")
def start_analysis(crisis: CrisisRequest):
    job_id = str(uuid.uuid4())

    workflow_jobs[job_id] = {
        "status": "running",
        "result": None,
        "error": None,
        "finished": False,
        "events": queue.Queue()
    }

    first_stage = WORKFLOW_STAGES[0]

    emit_event(
        job_id,
        "stage_started",
        {
            "stage_id": first_stage["id"],
            "stage_name": first_stage["name"],
            "department": first_stage["department"],
            "completed": 0,
            "total": len(WORKFLOW_STAGES)
        }
    )

    worker = threading.Thread(
        target=execute_workflow,
        args=(job_id, crisis),
        daemon=True
    )
    worker.start()

    return {
        "job_id": job_id,
        "status": "running",
        "message": "Supply-chain analysis started."
    }


@app.get("/api/workflow/active")
def active_workflows():
    """Expose current in-memory jobs and their truthful execution status."""
    with workflow_lock:
        return {
            "jobs": [
                {
                    "job_id": job_id,
                    "status": job.get("status"),
                    "finished": job.get("finished", False),
                    "error": job.get("error"),
                    "result_report_id": (job.get("result") or {}).get("report_id"),
                }
                for job_id, job in workflow_jobs.items()
            ]
        }


@app.get("/api/workflow/{job_id}/events")
def workflow_events(job_id: str):
    job = workflow_jobs.get(job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Workflow job not found."
        )

    def event_stream():
        while True:
            try:
                event = job["events"].get(timeout=15)

                if event is None:
                    yield "event: stream_end\ndata: {}\n\n"
                    break

                yield (
                    f"event: {event['type']}\n"
                    f"data: {json.dumps(event)}\n\n"
                )

            except queue.Empty:
                yield ": keep-alive\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/api/workflow/{job_id}/result")
def workflow_result(job_id: str):
    job = workflow_jobs.get(job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Workflow job not found."
        )

    if job["status"] == "running":
        return {
            "status": "running",
            "result": None
        }

    if job["status"] == "failed":
        return {
            "status": "failed",
            "error": job["error"]
        }

    return {
        "status": "completed",
        "result": job["result"]
    }


# Backward-compatible synchronous endpoint.
@app.post("/api/analyze")
def analyze_crisis(crisis: CrisisRequest):
    report_id = str(uuid.uuid4())[:8].upper()

    try:
        ai_analysis = run_supply_chain_crew(crisis)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Agent analysis failed: {str(exc)}"
        )

    report = {
        "report_id": report_id,
        "crisis_type": crisis.crisis_type,
        "description": crisis.description,
        "affected_product": crisis.affected_product,
        "affected_region": crisis.affected_region,
        "urgency": crisis.urgency,
        "status": "Pending Review",
        "analysis": ai_analysis,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "human_review_required": True
    }

    save_report(report)
    return report


@app.get("/api/reports")
def reports():
    return {"reports": get_reports()}


@app.get("/api/reports/{report_id}")
def report_details(report_id: str):
    report = get_report(report_id)

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return report


@app.post("/api/review")
def review_report(review: ReviewRequest):
    report = get_report(review.report_id)

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    allowed_decisions = {
        "Approved",
        "Rejected",
        "Needs Changes"
    }

    if review.decision not in allowed_decisions:
        raise HTTPException(
            status_code=400,
            detail="Invalid review decision."
        )

    review_id = save_review(review.model_dump())

    return {
        "message": "Review saved",
        "review_id": review_id,
        "report_id": review.report_id,
        "decision": review.decision
    }
