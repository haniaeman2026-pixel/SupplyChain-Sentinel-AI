
from crewai import Crew, Process, LLM

from backend.config import GROQ_API_KEY, GROQ_MODEL
from backend.agents.definitions import create_agents
from backend.agents.tasks import create_tasks


def run_supply_chain_crew(crisis, on_task_completed=None):
    """
    Execute the supply-chain analysis sequentially.

    on_task_completed is called by CrewAI after each task finishes.
    """

    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Add it to your .env file."
        )

    llm = LLM(
        model=f"groq/{GROQ_MODEL}",
        api_key=GROQ_API_KEY,
        temperature=0.2
    )

    agents = create_agents(llm)
    tasks = create_tasks(agents, crisis)

    def task_callback(task_output):
        if on_task_completed:
            try:
                on_task_completed(task_output)
            except Exception as callback_error:
                # A UI/event callback must not interrupt the AI analysis.
                print(f"Workflow callback warning: {callback_error}")

    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
        task_callback=task_callback
    )

    result = crew.kickoff()
    return str(result)
