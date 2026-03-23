# ADR-001: Technology Stack Selection

**Date:** 2026-03-24  
**Status:** Accepted  
**Deciders:** Pasan, Pragna, Rui, Nadil, Akshad

## Context
We needed a backend framework, CV model, and frontend stack 
for the DSAPT accessibility scanner proof of concept.

## Decisions
- **Backend:** FastAPI (Python)
- **CV Model:** YOLOv8
- **Frontend:** Next.js / React
- **Database:** TBD (finalised Sprint 1)
- **CI/CD:** GitHub Actions
- **Containerisation:** Docker / Docker Compose

## Rationale
- FastAPI gives us async support, automatic Swagger docs, 
  and easy integration with Python ML libraries
- YOLOv8 is lightweight, fast, and well suited for 
  real-time object detection on transport venue images
- Next.js provides a modern frontend with easy API integration
- Docker ensures consistent environments across the team

## Consequences
- All backend code will be Python
- Frontend communicates with backend via REST API
- Model inference runs server-side
- Team must have Docker installed locally