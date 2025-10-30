(function (global) {
  const LW = (global.LW = global.LW || {});

  function draftVision(categoryText) {
    const category = categoryText || 'your chosen area';
    return Promise.resolve({
      title: `Elevated ${category}`,
      narrative_md: `Imagine a future where ${category} feels aligned and energized. You have rhythms, rituals, and supportive people who keep you thriving.`,
      mantra: 'Small slices. Steady wins.'
    });
  }

  function smartGoalify(goalText) {
    const base = goalText || 'this goal';
    return Promise.resolve({
      measurable: `${base} is broken into weekly scorecards with metrics you can track in five minutes.`,
      milestones: ['Define success metrics', 'Schedule weekly review', 'Identify first collaborator'],
      firstWeekPlan: 'Block 90 minutes to map milestones, plan the first salami slice, and invite accountability.'
    });
  }

  function habitSuggestions(goal) {
    const name = goal?.title || 'the goal';
    return Promise.resolve([
      { name: 'Prime the day', cadence: 'daily', starterVariant: `Visualize ${name} for 2 minutes.` },
      { name: 'Celebrate slices', cadence: 'weekly', starterVariant: 'Friday reflection & highlight share.' },
      { name: 'Prep runway', cadence: 'weekly', starterVariant: 'Sunday evening check of blockers.' }
    ]);
  }

  function monthlySummary(responses) {
    const wins = responses.filter((r) => (r.rating || 0) >= 7).map((r) => `Holding steady in ${r.category_id}`);
    const stuck = responses.filter((r) => (r.rating || 0) < 6).map((r) => `Needs attention: ${r.category_id}`);
    const nextSteps = stuck.map((item) => `Choose one slice for ${item.split(': ')[1]}`);
    return Promise.resolve({
      wins: wins.length ? wins : ['Showing up consistently.'],
      stuck: stuck.length ? stuck : ['Everything is trending well.'],
      nextSteps: nextSteps.length ? nextSteps : ['Keep honoring your rhythms.']
    });
  }

  function slipDetect(habitLogs) {
    const missed = habitLogs.filter((log) => !log.value);
    return Promise.resolve({
      risks: missed.slice(0, 3).map((log) => `Watch ${log.habit_id} on ${log.date}`),
      lighterVariants: ['Shorten the routine to 5 minutes', 'Pair with an existing ritual']
    });
  }

  function weeklyPlan(tasks, habits) {
    const schedule = tasks.slice(0, 7).map((task, index) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7],
      focus: task.title
    }));
    if (schedule.length === 0) {
      schedule.push({ day: 'Mon', focus: 'Review goals' });
    }
    return Promise.resolve(schedule);
  }

  LW.ai = {
    draftVision,
    smartGoalify,
    habitSuggestions,
    monthlySummary,
    slipDetect,
    weeklyPlan
  };
})(window);
