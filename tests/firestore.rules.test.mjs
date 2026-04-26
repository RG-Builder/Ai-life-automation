import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const projectId = `ai-life-automation-${Date.now()}`;
const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
const host = process.env.FIRESTORE_EMULATOR_HOST;

let deps;
let testEnv;

test.before(async () => {
  try {
    const rulesTesting = await import('@firebase/rules-unit-testing');
    const firestore = await import('firebase/firestore');
    deps = { ...rulesTesting, ...firestore };
  } catch {
    return;
  }

  if (!host) return;

  testEnv = await deps.initializeTestEnvironment({
    projectId,
    firestore: { rules },
  });

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await deps.setDoc(deps.doc(db, 'users', 'user_1'), {
      email: 'user@example.com',
      subscription_plan: 'free',
      role: 'user',
      created_at: '2026-04-26T00:00:00.000Z',
      onboardingComplete: false,
      wakeTime: '07:00',
      directive: 'Balance & Growth',
      lifeScore: 0,
      streak: 0,
    });

    await deps.setDoc(deps.doc(db, 'users', 'user_1', 'tasks', 'task_1'), {
      title: 'My task',
      status: 'pending',
      priority: 'medium',
      duration: 30,
      category: 'general',
      impact: 'moderate',
      urgency: 5,
      urgency_score: 5,
      importance: 5,
      estimated_effort: 3,
      impact_level: 5,
      is_habit: false,
      streak: 0,
      created_at: '2026-04-26T00:00:00.000Z',
    });

    await deps.setDoc(deps.doc(db, 'users', 'user_1', 'habits', 'habit_1'), {
      title: 'Hydration',
      description: '',
      frequency: 'daily',
      goal_count: 1,
      current_count: 0,
      streak: 0,
      category: 'health',
      created_at: '2026-04-26T00:00:00.000Z',
    });

    await deps.setDoc(deps.doc(db, 'users', 'user_1', 'payments', 'pay_1'), {
      amount: 499,
      currency: 'INR',
      status: 'created',
      created_at: '2026-04-26T00:00:00.000Z',
    });
  });
});

test.after(async () => {
  if (testEnv) await testEnv.cleanup();
});

const runOrSkip = (name, fn) => {
  test(name, async (t) => {
    if (!deps) return t.skip('Install @firebase/rules-unit-testing to run rule tests.');
    if (!host) return t.skip('Set FIRESTORE_EMULATOR_HOST to run emulator rule tests.');
    await fn();
  });
};

runOrSkip('users: create allowed with canonical schema', async () => {
  const db = testEnv.authenticatedContext('user_2').firestore();
  await deps.assertSucceeds(deps.setDoc(deps.doc(db, 'users', 'user_2'), {
    email: 'another@example.com',
    subscription_plan: 'free',
    role: 'user',
    created_at: '2026-04-26T00:00:00.000Z',
    onboardingComplete: false,
    wakeTime: '07:00',
    directive: 'Balance & Growth',
    lifeScore: 0,
    streak: 0,
  }));
});

runOrSkip('users: self-upgrade subscription plan is denied', async () => {
  const db = testEnv.authenticatedContext('user_1').firestore();
  await deps.assertFails(deps.updateDoc(deps.doc(db, 'users', 'user_1'), {
    subscription_plan: 'premium',
  }));
});

runOrSkip('tasks: create/update/delete lifecycle', async () => {
  const db = testEnv.authenticatedContext('user_1').firestore();
  const taskRef = deps.doc(db, 'users', 'user_1', 'tasks', 'task_2');

  await deps.assertSucceeds(deps.setDoc(taskRef, {
    title: 'Task 2',
    status: 'pending',
    priority: 'low',
    deadline: null,
    duration: 15,
    category: 'general',
    impact: 'low',
    urgency: 2,
    urgency_score: 2,
    importance: 2,
    estimated_effort: 1,
    impact_level: 2,
    is_habit: false,
    streak: 0,
    created_at: '2026-04-26T00:00:00.000Z',
  }));

  await deps.assertSucceeds(deps.updateDoc(taskRef, {
    status: 'completed',
    completed_at: '2026-04-26T00:10:00.000Z',
  }));

  await deps.assertSucceeds(deps.deleteDoc(taskRef));
});

runOrSkip('habits: create/update/delete lifecycle', async () => {
  const db = testEnv.authenticatedContext('user_1').firestore();
  const habitRef = deps.doc(db, 'users', 'user_1', 'habits', 'habit_2');

  await deps.assertSucceeds(deps.setDoc(habitRef, {
    title: 'Walk',
    description: 'Morning walk',
    frequency: 'daily',
    goal_count: 1,
    current_count: 0,
    streak: 0,
    category: 'health',
    created_at: '2026-04-26T00:00:00.000Z',
  }));

  await deps.assertSucceeds(deps.updateDoc(habitRef, {
    current_count: 1,
    streak: 1,
    last_completed_at: '2026-04-26T07:00:00.000Z',
  }));

  await deps.assertSucceeds(deps.deleteDoc(habitRef));
});

runOrSkip('payments: client create/update/delete denied, read allowed', async () => {
  const db = testEnv.authenticatedContext('user_1').firestore();
  const paymentRef = deps.doc(db, 'users', 'user_1', 'payments', 'pay_2');

  await deps.assertFails(deps.setDoc(paymentRef, {
    amount: 999,
    currency: 'INR',
    status: 'created',
    created_at: '2026-04-26T00:00:00.000Z',
  }));

  await deps.assertSucceeds(deps.getDoc(deps.doc(db, 'users', 'user_1', 'payments', 'pay_1')));
  await deps.assertFails(deps.updateDoc(deps.doc(db, 'users', 'user_1', 'payments', 'pay_1'), { status: 'captured' }));
  await deps.assertFails(deps.deleteDoc(deps.doc(db, 'users', 'user_1', 'payments', 'pay_1')));
});
