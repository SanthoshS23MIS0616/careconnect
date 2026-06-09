# CareConnect Complete Project Plan

## Project Name

CareConnect - Jarurat Care Patient Support Portal

## Prepared By

Santhosh S

## Assignment Requirement

Task: Mini Healthcare Support Web App (Concept-Level)

Create a simple web app or prototype with:

- A basic form: patient support, volunteer registration, or contact form
- One AI or automation idea, such as chatbot concept for FAQs, auto-response, or data summary

Submit:

- GitHub or Drive link
- Live hosted link mandatory: Vercel, Netlify, Render, Firebase, etc.
- Short README explaining tech stack, AI idea, and NGO use-case

Evaluation note: clarity and effort matter more than perfection.

## Final Chosen Approach

Build a clean healthcare support portal using static frontend files and Vercel serverless functions. This is easier to deploy than a heavy full-stack setup and still gives a real AI integration through Groq.

## Why Groq Is Selected

Groq Free Tier is selected for this prototype because it gives fast LLM responses and can be used with an OpenAI-compatible API style. The model selected for the project is:

`llama-3.1-8b-instant`

The API key must never be placed inside frontend code. The project solves that by using `/api/chat.js` as a Vercel serverless proxy.

## User Problems Solved

Cancer patients and caregivers may not know where to ask for help, what details to share, or how urgent their request appears. Volunteers may also need a clear way to register their availability. CareConnect solves this by giving one neat portal for intake, support routing, and basic FAQ guidance.

## Main Features

1. Patient Support Form
   - Full name
   - Phone number
   - City or area
   - Patient age
   - Support needed
   - Urgency
   - Situation note

2. Volunteer Registration Form
   - Name
   - Email
   - Phone
   - City
   - Skill
   - Availability
   - Motivation note

3. Contact Form
   - Name
   - Email or phone
   - Subject
   - Message

4. CareBot AI FAQ Assistant
   - Uses Groq through serverless API
   - Helps with documents, support process, volunteer questions, and general NGO guidance
   - Gives safe emergency guidance without medical diagnosis

5. Smart Care Priority Summary
   - Converts each submission into a simple coordinator summary
   - Adds priority level
   - Gives next steps
   - Creates a warm acknowledgement for the user

## Novel and Useful Feature

The Smart Care Priority Summary is the strongest practical feature. It is not just a form submission. It helps the NGO understand what action may be needed next. It also makes the user feel heard immediately.

## Safety Scope

CareConnect is not a medical diagnosis tool. It does not prescribe medicine. It does not replace doctors. It only helps with support coordination, FAQ guidance, and intake organization.

## UI Plan

Color combination:

- White for clean readability
- Light violet as main brand color
- Light pink as emotional warmth color
- Light green as care/status accent, used lightly
- Very slight yellow for small highlight text only

Design style:

- Soft professional interface
- Not crowded
- Responsive on mobile and desktop
- Large readable headings
- Clean cards and smooth spacing
- Footer with Santhosh S

## Technical Strategy

Frontend:

- `index.html` for page structure
- `styles.css` for responsive design
- `app.js` for forms, chatbot UI, validation, and fallback behavior

Backend:

- `api/chat.js` for Groq AI proxy
- `api/submit.js` for form validation and automated summary

Deployment:

- Vercel is preferred because it supports static files and serverless functions in the same project.

AI key security:

- Store `GROQ_API_KEY` in Vercel Environment Variables
- Never write the real key in GitHub
- Keep `.env`, `.env.local`, and `.vercel` ignored

## API Flow

CareBot flow:

1. User asks a question in browser
2. Browser sends question to `/api/chat`
3. Serverless function reads `GROQ_API_KEY` from server environment
4. Function calls Groq Chat Completions endpoint
5. Response returns to browser
6. Key never reaches frontend

Form automation flow:

1. User submits patient, volunteer, or contact form
2. Browser sends data to `/api/submit`
3. Server validates fields
4. Server generates acknowledgement, priority, summary, and next steps
5. Browser displays a polished result card

## Free Deployment Roadmap

1. Create Groq account
2. Generate Groq API key
3. Push code to GitHub
4. Import GitHub repository in Vercel
5. Add environment variables in Vercel
6. Deploy
7. Test form and AI assistant
8. Add the live link to README

## Files to Submit

- GitHub repository link
- Vercel live hosted link
- README file

## Final Outcome

CareConnect becomes a complete concept-level healthcare support web app with clear forms, AI FAQ guidance, safe API-key handling, automation summary, professional design, and free deployment readiness.
