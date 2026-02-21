"""Local dev server entry point.

On Windows, asyncpg requires SelectorEventLoop (not the default ProactorEventLoop).
This script sets the correct policy before uvicorn starts.
"""
import sys

if sys.platform == "win32":
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
