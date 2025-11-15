const views = [
  {
    name: "This Month",
    description:
      "See your focus areas, highlight key wins, and spot habits that need support.",
    render: () => `
      <div class="pulse-card">
        <article class="pulse">
          <span>Momentum</span>
          <strong>74%</strong>
          <small>Check-ins completed</small>
        </article>
        <article class="pulse">
          <span>Focus</span>
          <strong>3</strong>
          <small>Goals in sprint</small>
        </article>
        <article class="pulse">
          <span>Energy</span>
          <strong>Green</strong>
          <small>Weekly mood trend</small>
        </article>
      </div>
      <div class="routine-list">
        <article class="routine-item">
          <h3>Celebrate wins</h3>
          <p>List three moments from this month where you felt proud or grateful.</p>
        </article>
        <article class="routine-item">
          <h3>Adjust focus</h3>
          <p>Pick one goal that needs extra attention and block time for it now.</p>
        </article>
        <article class="routine-item">
          <h3>Declutter commitments</h3>
          <p>Archive one task or habit that no longer serves your bigger vision.</p>
        </article>
      </div>
    `,
  },
  {
    name: "Dashboard",
    description:
      "Quick glance at mood, progress, and streaks for your top priorities.",
    render: () => `
      <div class="pulse-card">
        <article class="routine-item">
          <h3>Weekly mood</h3>
          <p>✨ Energized • Monitored from daily reflections.</p>
        </article>
        <article class="routine-item">
          <h3>Goal traction</h3>
          <p>🏁 5 of 7 milestone check-ins logged.</p>
        </article>
        <article class="routine-item">
          <h3>Habit streaks</h3>
          <p>🔥 Morning routine on day 9, deep work on day 4.</p>
        </article>
      </div>
    `,
  },
  {
    name: "Check in",
    description:
      "Log how today felt and what nudges you forward tomorrow.",
    render: () => `
      <div class="section">
        <h2>Daily reflection</h2>
        <p>Choose your mood, highlight a win, and pick a micro-goal for tomorrow.</p>
      </div>
    `,
  },
  {
    name: "Set up Goals",
    description: "Define the outcomes you want and the feelings you’re chasing.",
    render: () => `
      <div class="section">
        <h2>Goal palette</h2>
        <p>Break goals into sprints, milestones, and weekly focus prompts.</p>
      </div>
    `,
  },
  {
    name: "Set up Habits and Routine",
    description: "Shape the habits that make your future self inevitable.",
    render: () => `
      <div class="section">
        <h2>Habit rituals</h2>
        <p>Design cue → routine → reward loops that reinforce momentum.</p>
      </div>
    `,
  },
  {
    name: "Rolling 12M",
    description: "Zoom out to spot trends, celebrate growth, and fine-tune plans.",
    render: () => `
      <div class="section">
        <h2>Year-in-view</h2>
        <p>Monthly snapshots highlight energy, achievements, and lesson logs.</p>
      </div>
    `,
  },
  {
    name: "Vision Board",
    description: "Collect images, words, and commitments that keep you inspired.",
    render: () => `
      <div class="section">
        <h2>Inspiration gallery</h2>
        <p>Pin mood images and anchors to stay connected to your why.</p>
      </div>
    `,
  },
  {
    name: "Settings",
    description: "Tune reminders, review exports, and personalize your dashboard.",
    render: () => `
      <div class="section">
        <h2>Personalize</h2>
        <p>Sync with Google Sheets, adjust notifications, and export rituals.</p>
      </div>
    `,
  },
];

const nav = document.getElementById("nav");
const title = document.getElementById("view-title");
const description = document.getElementById("view-description");
const content = document.getElementById("view-content");

function renderView(index) {
  const view = views[index];
  title.textContent = view.name;
  description.textContent = view.description;
  content.innerHTML = view.render();
  updateActive(index);
}

function updateActive(activeIndex) {
  Array.from(nav.children).forEach((button, index) => {
    button.classList.toggle("is-active", index === activeIndex);
  });
}

views.forEach((view, index) => {
  const button = document.createElement("button");
  button.innerHTML = `<span>${view.name}</span>`;
  button.addEventListener("click", () => renderView(index));
  nav.appendChild(button);
});

renderView(0);
