# Gather

A modern church welcome experience — a high-fidelity prototype that takes someone from
"I'm thinking about visiting" to "I feel like I belong here."

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. No accounts, keys, or services needed. Everything is stored in your browser (localStorage).

## Try the full journey

1. **/new** — choose *I'm planning my first visit* or *I've already visited*
2. **/visit** — Sunday guide, campus map, and "Let us know you're coming"
3. **/connect** — personalized onboarding with conditional follow-up questions and recommendations
4. **/explore/[id]** — details, RSVP / join requests, and `.ics` calendar downloads
5. **/home** — your personal church home (update interests to see recommendations change)
6. **/admin** — the Welcome Team dashboard; your demo profile appears at the top of the visitor list

Use the small **Visitor view / Staff view** control (bottom-left) to jump between experiences or reset the demo.
Open the visitor site and the dashboard in two tabs — they stay in sync.

## Notes

- Built with Next.js (App Router), React, TypeScript, Tailwind CSS, Radix primitives, Motion, and Lucide.
- All dates are relative to today. Gather Church, its people, and events are fictional.
- Photography is loaded from Unsplash; if an image can't load, a designed fallback appears instead.
- Staff actions (contacting, assigning, notes, tasks) are simulated — nothing is ever sent.
