# CareConnect - Jarurat Care Patient Support Portal

CareConnect is a mini healthcare support web app prototype created for the internship assignment. It helps an NGO collect patient support requests, volunteer registrations, and general contact messages in one clean portal. It also includes a Groq-powered AI FAQ assistant through a Vercel serverless proxy, so the secret API key stays on the server and never appears in browser code.

Prepared by: **Santhosh S**

## Live Demo

[Add your deployed Vercel link here after deployment:](https://careconnect-91zs.onrender.com/)


## Assignment Fit

The assignment asks for a simple concept-level healthcare support web app with a basic form, one AI or automation idea, hosted live link, GitHub or Drive link, and a short README.

CareConnect satisfies that with:

- Patient support registration form
- Volunteer registration form
- General contact form
- Groq AI FAQ chatbot concept for common NGO and patient-support questions
- Smart Care Priority Summary automation after each form submission
- Vercel deployment-ready frontend and serverless API
- README explaining tech stack, AI idea, deployment, and NGO use-case

## Core Idea

Jarurat Care may receive support requests through phone calls, WhatsApp, social media, and direct contacts. CareConnect gives those requests one organized entry point. A patient or caregiver can submit a need, a volunteer can register availability, and the NGO team can receive a clean summary that is easier to act on.

The app focuses on clarity and effort, not a complex hospital system. It is intentionally small, human-friendly, and easy to deploy for free.

## Important Feature Added

### Smart Care Priority Summary

This automation is added to impress and help real users. After a form is submitted, the app prepares:

- A warm acknowledgement for the user
- Priority level: High, Medium, or Normal
- Coordinator-ready summary
- Practical next steps

For urgent health danger, the system clearly says to contact local emergency services or the nearest hospital first. This keeps the prototype responsible and safe.

## AI Feature

### CareBot - Groq AI FAQ Assistant

CareBot answers common questions such as:

- What documents should a patient keep ready?
- How can a volunteer help?
- How to request medicine, transport, or appointment support?
- What should be done in urgent situations?

The browser calls `/api/chat`. The Vercel serverless function then calls Groq using `GROQ_API_KEY` stored in Vercel Environment Variables. This means the key is never written in frontend JavaScript and is never visible to users.

If the API key is not configured, the app still runs with a local FAQ fallback so the demo does not break.

## Tech Stack

- HTML5 for structure
- CSS3 for responsive UI and aesthetic styling
- Vanilla JavaScript for form flow, chat UI, validation, and local demo behavior
- Node.js serverless functions in `/api`
- Groq OpenAI-compatible Chat Completions API
- Vercel for free hosting and serverless proxy deployment

No paid database is required. No paid AI plan is required for the prototype. The Groq key must be created in your Groq account and added only in Vercel settings.

## Design Direction

The interface uses:

- White base for readability
- Light violet and light pink as the main identity colors
- Light green as a small care/status accent
- Very slight yellow for small highlight text only
- Clean cards, soft shadows, visible font sizes, and mobile-friendly spacing
- Footer finishing with `Santhosh S`

## Folder Structure

```text
careconnet/
  api/
    chat.js          # Groq AI proxy route; key stays server-side
    submit.js        # Form validation and Smart Care Priority Summary automation
  assets/
    careconnect-mark.svg
  docs/
    PROJECT_PLAN.md
  app.js             # Frontend interactions, forms, chatbot, fallback behavior
  index.html         # Main app UI
  styles.css         # Responsive design and theme
  server.js          # Local preview server without extra dependencies
  package.json
  vercel.json
  .env.example
  .gitignore
  README.md
```

## Local Run

Requirements:

- Node.js 20 or newer

Commands:

```bash
cd "C:\Users\santhosh\OneDrive\Desktop\intern\careconnet"
npm run check
npm run dev
```

Open:

```text
http://localhost:5173
```

The local app works even without a Groq key because it has a safe local FAQ fallback.

## Groq Setup

1. Go to `https://console.groq.com/`.
2. Create a free account.
3. Create an API key.
4. Do not paste the key into GitHub.
5. Add it only in Vercel Environment Variables as:

```text
GROQ_API_KEY=your_real_groq_key
GROQ_MODEL=llama-3.1-8b-instant
```

## Vercel Deployment Steps

1. Push this project to GitHub.
2. Go to `https://vercel.com/new`.
3. Import the GitHub repository.
4. Framework preset: `Other`.
5. Build command: leave empty.
6. Output directory: leave empty.
7. Add Environment Variables:

```text
GROQ_API_KEY = paste your Groq key
GROQ_MODEL = llama-3.1-8b-instant
```

8. Click Deploy.
9. Open the Vercel live URL.
10. Test patient form and CareBot.

## Git Commands

```bash
cd "C:\Users\santhosh\OneDrive\Desktop\intern\careconnet"
git init
git add .
git commit -m "Build CareConnect healthcare support prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If the remote already exists:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## Safety Notes

- Real API keys are ignored by `.gitignore`.
- `.env.example` is safe to commit because it contains only placeholder text.
- The Groq request is handled in `/api/chat.js`, not in browser code.
- The AI assistant does not diagnose, prescribe, or replace medical professionals.
- For emergencies, the app advises contacting emergency services or the nearest hospital first.

## Future Improvements

- Add admin dashboard for coordinators
- Store submissions in Supabase or Firebase free tier
- Add email notifications for new requests
- Add language switcher for Tamil, Hindi, and English
- Add role-based login if the project grows beyond concept level

## Submission Checklist

- GitHub repository link added
- Vercel live link added
- README updated
- Groq key added in Vercel only
- Patient form tested
- Volunteer form tested
- Contact form tested
- CareBot tested
- Footer shows Santhosh S
