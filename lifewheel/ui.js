(function (global) {
  const LW = (global.LW = global.LW || {});
  const lwRoot = document.querySelector('[data-lwapp]');
  const toastContainer = document.querySelector('.lwapp-toast-container');
  const demoBanner = document.querySelector('[data-lw-demo-banner]');
  const radarCanvas = document.querySelector('.lwapp-header__radar');

  const pageRenderers = {
    dashboard: renderDashboard,
    checkin: renderCheckin,
    goals: renderGoals,
    habits: renderHabits,
    gallery: renderGallery,
    settings: renderSettings
  };

  let currentState = null;

  LW.state.subscribe((state) => {
    currentState = state;
    lwRoot.setAttribute('data-theme', state.preferences.theme);
    updateDemoBanner(state.demoMode);
    drawHeaderRadar(LW.state.getRadarData());
  });

  global.addEventListener('lw:page-loaded', (event) => {
    const { route } = event.detail;
    if (pageRenderers[route]) {
      pageRenderers[route](LW.state);
    }
  });

  global.addEventListener('lw:process-op', (event) => {
    const op = event.detail;
    showToast(`Synced ${op.table}`);
    LWDB.markOpSynced(op.id);
  });

  function updateDemoBanner(isDemo) {
    if (!demoBanner) return;
    demoBanner.hidden = !isDemo;
  }

  function showToast(message) {
    const el = document.createElement('div');
    el.className = 'lwapp-toast';
    el.textContent = message;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 4000);
  }

  function renderDashboard(stateApi) {
    const state = getSnapshot();
    const radarTarget = document.querySelector('[data-lw-radar-chart]');
    if (radarTarget) {
      renderDashboardRadar(radarTarget, stateApi.getRadarData());
    }
    const streakList = document.querySelector('[data-lw-streaks]');
    if (streakList) {
      streakList.innerHTML = state.habits
        .map((habit) => {
          const streak = stateApi.getHabitStreak(habit.id);
          return `<li><span>${habit.name}</span><span class="lwapp-badge">${streak} day streak</span></li>`;
        })
        .join('');
    }
    const focusList = document.querySelector('[data-lw-week-focus]');
    if (focusList) {
      focusList.innerHTML = state.tasks
        .filter((task) => task.status !== 'done')
        .slice(0, 3)
        .map((task) => `<li>${task.title} <span class="lwapp-badge">Due ${LW.utils.formatDate(task.due_date)}</span></li>`) 
        .join('');
    }
    const reminderList = document.querySelector('[data-lw-upcoming-reminders]');
    if (reminderList) {
      reminderList.innerHTML = state.reminders
        .slice(0, 5)
        .map((reminder) => `<li>${reminder.entity} → ${reminder.channel} (${reminder.enabled ? 'On' : 'Off'})</li>`) 
        .join('');
    }
    bindDashboardCtas();
  }

  function bindDashboardCtas() {
    document.querySelector('[data-lw-cta-checkin]')?.addEventListener('click', () => {
      global.location.hash = '#/checkin';
    });
    document.querySelector('[data-lw-cta-habits]')?.addEventListener('click', () => {
      global.location.hash = '#/habits';
    });
    document.querySelector('[data-lw-cta-goal]')?.addEventListener('click', () => {
      global.location.hash = '#/goals';
    });
  }

  function renderDashboardRadar(container, data) {
    container.innerHTML = '';
    data.forEach((item) => {
      const chip = document.createElement('div');
      chip.className = 'lwapp-chip';
      chip.style.setProperty('--chip-color', item.color);
      chip.textContent = `${item.label}: ${item.value}`;
      container.appendChild(chip);
    });
  }

  function renderCheckin(stateApi) {
    const state = getSnapshot();
    const questionnaire = stateApi.getCurrentQuestionnaire('monthly');
    const form = document.querySelector('[data-lw-checkin-form]');
    if (!form || !questionnaire) return;
    form.dataset.questionnaireId = questionnaire.id;
    const sliderList = form.querySelector('[data-lw-checkin-sliders]');
    sliderList.innerHTML = state.questions
      .filter((question) => question.type === 'rating')
      .map((question) => {
        const response = state.responses.find((item) => item.question_id === question.id) || {};
        return `
          <div class="lwapp-checkin-row" data-question-id="${question.id}">
            <label for="${question.id}">${question.text}</label>
            <input type="range" class="lwapp-slider" min="0" max="10" value="${response.rating ?? 5}" aria-label="${question.text}" />
            <div class="lwapp-chip" style="--chip-color:${stateApi.getCategoryColor(question.category_id)}">Score: <span data-value>${response.rating ?? 5}</span></div>
          </div>
        `;
      })
      .join('');
    sliderList.querySelectorAll('input[type="range"]').forEach((slider) => {
      slider.addEventListener('input', (event) => {
        const value = Number(event.target.value);
        slider.parentElement.querySelector('[data-value]').textContent = value;
      });
      slider.addEventListener('change', async (event) => {
        const value = Number(event.target.value);
        const row = event.target.closest('[data-question-id]');
        await stateApi.saveResponse(row.dataset.questionId, form.dataset.questionnaireId, {
          rating: value,
          category_id: state.questions.find((q) => q.id === row.dataset.questionId)?.category_id
        });
        showToast('Response saved');
      });
    });
    const textList = form.querySelector('[data-lw-checkin-texts]');
    textList.innerHTML = state.questions
      .filter((question) => question.type === 'text')
      .map((question) => {
        const response = state.responses.find((item) => item.question_id === question.id) || {};
        return `
          <label class="lwapp-checkin-row">
            <span>${question.text}</span>
            <textarea class="lwapp-textarea" rows="4" data-question-id="${question.id}">${response.text || ''}</textarea>
          </label>
        `;
      })
      .join('');
    textList.querySelectorAll('textarea').forEach((textarea) => {
      let timeout;
      textarea.addEventListener('input', (event) => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          const questionId = event.target.dataset.questionId;
          await stateApi.saveResponse(questionId, form.dataset.questionnaireId, {
            text: event.target.value,
            category_id: state.questions.find((q) => q.id === questionId)?.category_id || null
          });
        }, 400);
      });
    });
    const summaryButton = form.querySelector('[data-lw-ai-summary]');
    summaryButton?.addEventListener('click', async () => {
      const responses = state.responses.filter((response) => response.questionnaire_id === questionnaire.id);
      const summary = await LW.ai.monthlySummary(responses);
      const output = form.querySelector('[data-lw-summary-output]');
      if (output) {
        output.innerHTML = `
          <h3>Wins</h3>
          <ul>${summary.wins.map((item) => `<li>${item}</li>`).join('')}</ul>
          <h3>Stuck</h3>
          <ul>${summary.stuck.map((item) => `<li>${item}</li>`).join('')}</ul>
          <h3>Next Steps</h3>
          <ul>${summary.nextSteps.map((item) => `<li>${item}</li>`).join('')}</ul>
        `;
      }
    });
  }

  function renderGoals(stateApi) {
    const state = getSnapshot();
    const container = document.querySelector('[data-lw-goal-tree]');
    if (!container) return;
    container.innerHTML = state.goals
      .map((goal) => {
        const goalSteps = state.steps.filter((step) => step.goal_id === goal.id);
        return `
          <article class="lwapp-card lwapp-goal" data-goal-id="${goal.id}">
            <header class="lwapp-section-title">
              <div>
                <h3>${goal.title}</h3>
                <p>${goal.desc_md || ''}</p>
              </div>
              <span class="lwapp-badge">${goal.status.replace('_', ' ')}</span>
            </header>
            <p>Due ${LW.utils.formatDate(goal.due_date)}</p>
            <div class="lwapp-goal-steps">
              ${goalSteps
                .map((step) => {
                  const tasks = state.tasks.filter((task) => task.step_id === step.id);
                  return `
                    <section class="lwapp-step" data-step-id="${step.id}">
                      <header class="lwapp-section-title">
                        <h4>${step.title}</h4>
                        <span class="lwapp-badge">${step.status}</span>
                      </header>
                      <p>${step.desc_md || ''}</p>
                      <ul class="lwapp-list">
                        ${tasks
                          .map(
                            (task) => `
                              <li class="lwapp-task" data-task-id="${task.id}">
                                <div>
                                  <strong>${task.title}</strong>
                                  <p>Due ${LW.utils.formatDate(task.due_date)}</p>
                                </div>
                                <span class="lwapp-badge">${task.status}</span>
                              </li>
                            `
                          )
                          .join('')}
                      </ul>
                    </section>
                  `;
                })
                .join('')}
            </div>
          </article>
        `;
      })
      .join('');
    bindGoalAi();
  }

  function bindGoalAi() {
    document.querySelector('[data-lw-ai-vision]')?.addEventListener('click', async () => {
      const categoryText = document.querySelector('[data-lw-vision-input]')?.value || '';
      const draft = await LW.ai.draftVision(categoryText);
      const output = document.querySelector('[data-lw-vision-output]');
      if (output) {
        output.innerHTML = `<h3>${draft.title}</h3><p>${draft.narrative_md}</p><p><em>${draft.mantra}</em></p>`;
      }
    });
    document.querySelector('[data-lw-ai-goal]')?.addEventListener('click', async () => {
      const goalText = document.querySelector('[data-lw-goal-input]')?.value || '';
      const smart = await LW.ai.smartGoalify(goalText);
      const output = document.querySelector('[data-lw-goal-output]');
      if (output) {
        output.innerHTML = `
          <h3>SMART Breakdown</h3>
          <p>${smart.measurable}</p>
          <h4>Milestones</h4>
          <ul>${smart.milestones.map((item) => `<li>${item}</li>`).join('')}</ul>
          <h4>First Week Plan</h4>
          <p>${smart.firstWeekPlan}</p>
        `;
      }
    });
  }

  function renderHabits(stateApi) {
    const state = getSnapshot();
    const list = document.querySelector('[data-lw-habit-list]');
    if (!list) return;
    list.innerHTML = state.habits
      .map((habit) => {
        const streak = stateApi.getHabitStreak(habit.id);
        return `
          <article class="lwapp-card lwapp-habit-card" data-habit-id="${habit.id}">
            <div>
              <h3>${habit.name}</h3>
              <p>${LW.utils.humanizeCadence(habit.cadence)} · target ${habit.target_per_week}/week</p>
              <p class="lwapp-badge">Reminder ${habit.reminder_time || '—'}</p>
            </div>
            <button class="lwapp-button" data-action="log-habit">Log</button>
            <div class="lwapp-heatmap" data-habit-heatmap>
              ${renderHabitHeatmap(stateApi, habit.id)}
            </div>
            <p class="lwapp-badge">${streak} day streak</p>
          </article>
        `;
      })
      .join('');
    list.querySelectorAll('[data-action="log-habit"]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const habitId = event.target.closest('[data-habit-id]').dataset.habitId;
        await stateApi.logHabit(habitId, 1);
        showToast('Habit logged');
        renderHabits(stateApi);
      });
    });
  }

  function renderHabitHeatmap(stateApi, habitId) {
    const state = getSnapshot();
    const logs = state.habit_logs.filter((log) => log.habit_id === habitId);
    const days = 14;
    let html = '';
    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const label = date.toISOString().slice(5, 10);
      const key = date.toISOString().slice(0, 10);
      const value = logs.find((log) => log.date === key)?.value ? 1 : 0;
      html += `<span data-label="${label}" data-value="${value}"></span>`;
    }
    return html;
  }

  function renderGallery() {
    const state = getSnapshot();
    const grid = document.querySelector('[data-lw-gallery-grid]');
    if (!grid) return;
    grid.innerHTML = state.media
      .map(
        (item) => `
          <figure class="lwapp-gallery-item">
            <img src="${item.demo_url || item.file_path}" alt="Goal media" />
            <figcaption>${item.linked_entity} – ${item.linked_id}</figcaption>
          </figure>
        `
      )
      .join('');
  }

  function renderSettings(stateApi) {
    const state = getSnapshot();
    const themeCards = document.querySelectorAll('[data-lw-theme-option]');
    themeCards.forEach((card) => {
      const theme = card.getAttribute('data-lw-theme-option');
      card.dataset.active = theme === state.preferences.theme ? 'true' : 'false';
      card.addEventListener('click', () => {
        stateApi.setTheme(theme);
        showToast(`Theme set to ${theme}`);
      });
    });
    const timezoneInput = document.querySelector('[data-lw-timezone]');
    if (timezoneInput) {
      timezoneInput.value = state.preferences.timezone;
      timezoneInput.addEventListener('change', (event) => {
        stateApi.setTimezone(event.target.value);
        showToast('Timezone updated');
      });
    }
    const exportResponses = document.querySelector('[data-lw-export-responses]');
    exportResponses?.addEventListener('click', () => {
      const headers = ['Question', 'Category', 'Rating', 'Text'];
      const rows = state.responses.map((response) => {
        const question = state.questions.find((q) => q.id === response.question_id);
        const category = state.categories.find((cat) => cat.id === response.category_id);
        return [question?.text || '', category?.name || '', response.rating ?? '', response.text ?? ''];
      });
      LW.utils.exportCsv('lifewheel-responses.csv', headers, rows);
    });
    const exportHabits = document.querySelector('[data-lw-export-habits]');
    exportHabits?.addEventListener('click', () => {
      const headers = ['Habit', 'Date', 'Value'];
      const rows = state.habit_logs.map((log) => {
        const habit = state.habits.find((item) => item.id === log.habit_id);
        return [habit?.name || '', log.date, log.value];
      });
      LW.utils.exportCsv('lifewheel-habit-logs.csv', headers, rows);
    });
    const exportIcsButton = document.querySelector('[data-lw-export-ics]');
    exportIcsButton?.addEventListener('click', () => {
      const events = state.tasks
        .filter((task) => task.due_date)
        .map((task) => ({
          summary: task.title,
          start: task.due_date,
          end: task.due_date,
          description: `Task status: ${task.status}`
        }));
      LW.utils.exportIcs('lifewheel-deadlines.ics', events);
    });
    const emailToggle = document.querySelector('[data-lw-reminder-email]');
    const pushToggle = document.querySelector('[data-lw-reminder-push]');
    if (emailToggle) {
      emailToggle.disabled = state.demoMode;
    }
    if (pushToggle) {
      pushToggle.disabled = state.demoMode;
    }
    const demoBanner = document.querySelector('[data-lw-demo-banner-settings]');
    if (demoBanner) {
      demoBanner.hidden = !state.demoMode;
    }
  }

  function drawHeaderRadar(data) {
    if (!radarCanvas) return;
    const ctx = radarCanvas.getContext('2d');
    const size = radarCanvas.width;
    ctx.clearRect(0, 0, size, size);
    const center = size / 2;
    const maxRadius = center - 10;
    const count = data.length;
    ctx.save();
    ctx.translate(center, center);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    for (let ring = 1; ring <= 5; ring += 1) {
      const radius = (maxRadius * ring) / 5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    data.forEach((item, index) => {
      const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
      const radius = (maxRadius * (item.value || 0)) / 10;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.stroke();
    ctx.restore();
  }

  function getSnapshot() {
    return currentState ? JSON.parse(JSON.stringify(currentState)) : {};
  }

  LW.ui = {
    showToast
  };
})(window);
