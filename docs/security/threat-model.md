# Threat Model — DSAPT Accessibility Scanner

**Date:** 2026-03-24  
**Author:** Rui  
**Status:** Accepted

## Assets to Protect
- Uploaded transport venue images
- YOLO model file (`best.pt`)
- Scan results and accessibility reports
- API endpoints

## Threat Identification

### 1. Malicious File Upload
- **Threat:** Attacker uploads malformed or malicious image files
- **Risk:** High
- **Mitigation:** Validate file type, size, and content before processing

### 2. API Abuse / DDoS
- **Threat:** Attacker floods `/inference/scan` with requests
- **Risk:** Medium
- **Mitigation:** Rate limiting on API endpoints

### 3. Sensitive Data Exposure
- **Threat:** Scan results or uploaded images leaked
- **Risk:** Medium
- **Mitigation:** No permanent image storage, results access controlled

### 4. Dependency Vulnerabilities
- **Threat:** Known CVEs in Python packages
- **Risk:** Medium
- **Mitigation:** Automated dependency scanning in CI/CD pipeline

### 5. Secret Credentials in Codebase
- **Threat:** API keys or passwords accidentally committed
- **Risk:** High
- **Mitigation:** Secrets detection in CI/CD, `.env` in `.gitignore`

### 6. Model Tampering
- **Threat:** Trained model file replaced with malicious version
- **Risk:** Low
- **Mitigation:** Model file integrity check before loading

## Risk Summary

| Threat | Risk | Mitigation Status |
|--------|------|------------------|
| Malicious file upload | High | Planned — Week 1 Fri |
| API abuse | Medium | Planned — Week 2 |
| Data exposure | Medium | Partially mitigated |
| Dependency vulnerabilities | Medium | CI/CD pipeline ✅ |
| Secrets in codebase | High | .gitignore ✅ |
| Model tampering | Low | Planned — Week 2 |