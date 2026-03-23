# ADR-002: YOLO Model and Dataset Selection

**Date:** 2026-03-24  
**Status:** Accepted  
**Deciders:** Nadil, Pasan

## Context
We needed to select a YOLO model version and training dataset 
for detecting accessibility features in public transport venues.

## Decision
- **Model:** YOLOv8n (nano) — lightweight, fast, suitable for PoC
- **Dataset:** Custom annotated dataset based on DSAPT accessibility 
  features (ramps, tactile indicators, handrails, signage)
- **Framework:** Ultralytics YOLOv8

## Rationale
- YOLOv8n is the fastest variant, ideal for proof-of-concept
- Runs on CPU without requiring expensive GPU hardware
- Ultralytics provides simple Python API for training and inference
- Custom dataset ensures classes match DSAPT requirements

## Consequences
- Model file will be saved as `backend/models/best.pt`
- Training data lives in `backend/datasets/`
- Demo class list must be frozen before Thursday tradeshow