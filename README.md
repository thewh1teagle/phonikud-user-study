# Phonikud User Study

This is a user study for the Phonikud project.

## Database

The database is hosted on [Firebase](https://console.firebase.google.com/u/0/project/phonikud-user-study)

## Analysis

`scripts/analyze.py` fetches submissions from Firestore, filters to participants who completed all 20 sentences, and computes CMOS scores (normalized so positive = styletts2 better) with 95% CIs.

1. Get service account key: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
2. Save as `service-account.json` in the repo root
3. Run: `uv run scripts/analyze.py`