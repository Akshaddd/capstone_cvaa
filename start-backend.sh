#!/bin/bash
cd ~/capstone_cvaa
source venv/bin/activate
cd backend
lsof -ti:8000 | xargs kill -9 2>/dev/null
uvicorn app.main:app --reload
