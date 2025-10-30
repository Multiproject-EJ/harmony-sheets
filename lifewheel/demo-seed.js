(function (global) {
  const LW = (global.LW = global.LW || {});

  const demoUserId = '00000000-0000-0000-0000-000000000001';

  const categoryData = [
    ['Physical Health', '#ef4444'],
    ['Mental Health', '#8b5cf6'],
    ['Relationships', '#f97316'],
    ['Career', '#3b82f6'],
    ['Finance', '#10b981'],
    ['Growth', '#6366f1'],
    ['Fun & Play', '#ec4899'],
    ['Environment', '#14b8a6']
  ].map((item, index) => ({
    id: `cat-${index + 1}`,
    user_id: demoUserId,
    name: item[0],
    color: item[1],
    order: index,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const visions = [
    {
      id: 'vision-1',
      category_id: 'cat-1',
      title: 'Strong & Energized',
      narrative_md: 'Run 5k weekly, strength train thrice a week.',
      last_reviewed_at: new Date().toISOString()
    },
    {
      id: 'vision-2',
      category_id: 'cat-4',
      title: 'Inspired Leadership',
      narrative_md: 'Lead compassionate projects that elevate the team.',
      last_reviewed_at: new Date().toISOString()
    },
    {
      id: 'vision-3',
      category_id: 'cat-3',
      title: 'Connected Family',
      narrative_md: 'Weekly date night, monthly family adventure.',
      last_reviewed_at: new Date().toISOString()
    },
    {
      id: 'vision-4',
      category_id: 'cat-6',
      title: 'Curious Mindset',
      narrative_md: 'Build learning rituals for creativity and growth.',
      last_reviewed_at: new Date().toISOString()
    }
  ].map((vision) => ({
    ...vision,
    user_id: demoUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const goals = [
    {
      id: 'goal-1',
      category_id: 'cat-1',
      vision_id: 'vision-1',
      title: 'Complete a sprint triathlon',
      desc_md: 'Train consistently for the local sprint triathlon in August.',
      image_url: LW.assets.hero,
      status: 'in_progress',
      priority: 1,
      due_date: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString()
    },
    {
      id: 'goal-2',
      category_id: 'cat-3',
      vision_id: 'vision-3',
      title: 'Strengthen our relationship',
      desc_md: 'Create intentional moments each week.',
      image_url: LW.assets.hero,
      status: 'in_progress',
      priority: 2,
      due_date: new Date(new Date().getFullYear(), new Date().getMonth(), 30).toISOString()
    }
  ].map((goal) => ({
    ...goal,
    user_id: demoUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const steps = [
    {
      id: 'step-1',
      goal_id: 'goal-1',
      title: 'Build cardio base',
      desc_md: 'Run + cycle intervals 4x/week for endurance.',
      status: 'in_progress',
      due_date: new Date().toISOString()
    },
    {
      id: 'step-2',
      goal_id: 'goal-1',
      title: 'Dial in nutrition',
      desc_md: 'Meal prep and hydration plan.',
      status: 'planned',
      due_date: new Date().toISOString()
    },
    {
      id: 'step-3',
      goal_id: 'goal-1',
      title: 'Book race entry',
      desc_md: 'Register for the sprint triathlon.',
      status: 'done',
      due_date: new Date().toISOString()
    },
    {
      id: 'step-4',
      goal_id: 'goal-2',
      title: 'Weekly date nights',
      desc_md: 'Schedule meaningful time together.',
      status: 'in_progress',
      due_date: new Date().toISOString()
    },
    {
      id: 'step-5',
      goal_id: 'goal-2',
      title: 'Monthly adventure planning',
      desc_md: 'Plan a new shared experience monthly.',
      status: 'planned',
      due_date: new Date().toISOString()
    }
  ].map((step) => ({
    ...step,
    user_id: demoUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const tasks = [
    { id: 'task-1', goal_id: 'goal-1', step_id: 'step-1', title: 'Swim training plan', status: 'in_progress', due_date: LW.utils.startOfDay(new Date()), estimate_mins: 45 },
    { id: 'task-2', goal_id: 'goal-1', step_id: 'step-1', title: 'Long bike ride', status: 'planned', due_date: LW.utils.startOfDay(LW.utils.daysAgo(-3)), estimate_mins: 120 },
    { id: 'task-3', goal_id: 'goal-1', step_id: 'step-2', title: 'Meal prep Sunday', status: 'done', due_date: LW.utils.startOfDay(LW.utils.daysAgo(2)), estimate_mins: 90 },
    { id: 'task-4', goal_id: 'goal-1', step_id: 'step-3', title: 'Submit registration', status: 'done', due_date: LW.utils.startOfDay(LW.utils.daysAgo(7)), estimate_mins: 20 },
    { id: 'task-5', goal_id: 'goal-2', step_id: 'step-4', title: 'Book babysitter', status: 'in_progress', due_date: LW.utils.startOfDay(LW.utils.daysAgo(-1)), estimate_mins: 15 },
    { id: 'task-6', goal_id: 'goal-2', step_id: 'step-5', title: 'Plan hiking day', status: 'planned', due_date: LW.utils.startOfDay(LW.utils.daysAgo(-5)), estimate_mins: 60 },
    { id: 'task-7', goal_id: 'goal-2', step_id: 'step-4', title: 'Write love letter', status: 'planned', due_date: LW.utils.startOfDay(LW.utils.daysAgo(-2)), estimate_mins: 20 },
    { id: 'task-8', goal_id: 'goal-2', step_id: 'step-5', title: 'Book cabin getaway', status: 'done', due_date: LW.utils.startOfDay(LW.utils.daysAgo(10)), estimate_mins: 30 }
  ].map((task) => ({
    ...task,
    user_id: demoUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const habits = [
    { id: 'habit-1', category_id: 'cat-1', goal_id: 'goal-1', name: 'Morning mobility', cadence: 'daily', target_per_week: 7, reminder_time: '07:30', active: true },
    { id: 'habit-2', category_id: 'cat-3', goal_id: 'goal-2', name: 'Check-in question', cadence: 'weekly', target_per_week: 3, reminder_time: '20:00', active: true },
    { id: 'habit-3', category_id: 'cat-6', goal_id: null, name: 'Read 20 minutes', cadence: 'weekly', target_per_week: 5, reminder_time: '21:00', active: true }
  ].map((habit) => ({
    ...habit,
    user_id: demoUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const habitLogs = [];
  const today = new Date();
  habits.forEach((habit) => {
    for (let day = 0; day < 10; day += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - day);
      habitLogs.push({
        id: `${habit.id}-log-${day}`,
        habit_id: habit.id,
        user_id: demoUserId,
        date: date.toISOString().slice(0, 10),
        value: day % 2 === 0 ? 1 : 0,
        note: day % 3 === 0 ? 'Great session' : '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  });

  const questionnaireId = 'questionnaire-1';
  const questionnaire = {
    id: questionnaireId,
    user_id: demoUserId,
    period: 'monthly',
    window_start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10),
    window_end: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10),
    submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const questions = categoryData.map((category) => ({
    id: `question-${category.id}`,
    user_id: demoUserId,
    category_id: category.id,
    text: `How satisfied are you with ${category.name}?`,
    type: 'rating',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  questions.push(
    {
      id: 'question-reflection-wins',
      user_id: demoUserId,
      category_id: null,
      text: 'What were your biggest wins this period?',
      type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'question-reflection-focus',
      user_id: demoUserId,
      category_id: null,
      text: 'Where will you focus next?',
      type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  );

  const responses = questions.map((question, index) => ({
    id: `response-${question.id}`,
    user_id: demoUserId,
    questionnaire_id: questionnaireId,
    question_id: question.id,
    category_id: question.category_id,
    rating: question.type === 'rating' ? 5 + (index % 4) : null,
    text:
      question.type === 'text'
        ? index % 2 === 0
          ? 'Celebrated a personal record and deepened connection.'
          : 'Doubling down on sustainable routines.'
        : index % 2 === 0
          ? 'Feeling steady progress.'
          : 'Need a focus boost.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const reminders = [
    {
      id: 'reminder-1',
      user_id: demoUserId,
      entity: 'habit',
      entity_id: 'habit-1',
      channel: 'push',
      rrule: 'FREQ=DAILY;BYHOUR=7;BYMINUTE=30',
      time_of_day: '07:30',
      enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const media = [
    {
      id: 'media-1',
      user_id: demoUserId,
      file_path: 'demo/goal-1-photo-1.jpg',
      linked_entity: 'goal',
      linked_id: 'goal-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      demo_url: LW.assets.hero
    },
    {
      id: 'media-2',
      user_id: demoUserId,
      file_path: 'demo/goal-2-photo-1.jpg',
      linked_entity: 'goal',
      linked_id: 'goal-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      demo_url: LW.assets.hero
    }
  ];

  const demoSeed = {
    profiles: [
      {
        id: demoUserId,
        email: 'demo@example.com',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme: 'light',
        ai_tone: 'Encouraging',
        user_id: demoUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    categories: categoryData,
    visions,
    goals,
    steps,
    tasks,
    habits,
    habit_logs: habitLogs,
    questionnaires: [questionnaire],
    questions,
    responses,
    reminders,
    media
  };

  LW.demoSeed = {
    userId: demoUserId,
    data: demoSeed
  };
})(window);
