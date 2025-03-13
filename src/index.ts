import { Hono } from 'hono';
import { parseISO, isToday } from 'date-fns';
import { serve } from "@hono/node-server";

// In-memory storage for reminders
const reminders: any[] = [];

const app = new Hono();

app.get('/', (c) => {
  return c.text('Welcome to the Reminder Management API!');
});

// POST /reminders - Create a new reminder
app.post('/reminders', async (c) => {
  const body: any = await c.req.json();
  const { id, title, description, dueDate, isCompleted } = body;

  if (!id || !title || !description || !dueDate || typeof isCompleted !== 'boolean') {
    return c.json({ error: 'Bad Request: Missing or invalid required fields.' }, 400);
  }

  // Check if reminder with the same ID already exists
  if (reminders.some((reminder) => reminder.id === id)) {
    return c.json({ error: 'Reminder with this ID already exists.' }, 400);
  }

  reminders.push({ id, title, description, dueDate, isCompleted });
  return c.json({ message: 'Reminder created successfully.' }, 201);
});

// GET /reminders/:id - Retrieve a reminder by its id
app.get('/reminders/:id', (c) => {
  const reminder = reminders.find((r) => r.id === c.req.param('id'));
  if (!reminder) {
    return c.json({ error: 'Not Found: Reminder not found.' }, 404);
  }
  return c.json(reminder, 200);
});

// GET /reminders - Retrieve all reminders
app.get('/reminders', (c) => {
  if (reminders.length === 0) {
    return c.json({ error: 'Not Found: No reminders available.' }, 404);
  }
  return c.json(reminders, 200);
});

// PATCH /reminders/:id - Update a reminder by id
app.patch('/reminders/:id', async (c) => {
  const id = c.req.param('id');
  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return c.json({ error: 'Not Found: Reminder not found.' }, 404);
  }

  const body: any = await c.req.json();
  const { title, description, dueDate, isCompleted } = body;

  if (title) reminder.title = title;
  if (description) reminder.description = description;
  if (dueDate) reminder.dueDate = dueDate;
  if (typeof isCompleted === 'boolean') reminder.isCompleted = isCompleted;

  return c.json({ message: 'Reminder updated successfully.' }, 200);
});

// DELETE /reminders/:id - Delete a reminder by id
app.delete('/reminders/:id', (c) => {
  const id = c.req.param('id');
  const reminderIndex = reminders.findIndex((r) => r.id === id);

  if (reminderIndex === -1) {
    return c.json({ error: 'Not Found: Reminder not found.' }, 404);
  }

  reminders.splice(reminderIndex, 1);
  return c.json({ message: 'Reminder deleted successfully.' }, 200);
});

// POST /reminders/:id/mark-completed - Mark a reminder as completed
app.post('/reminders/:id/mark-completed', (c) => {
  const id = c.req.param('id');
  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return c.json({ error: 'Not Found: Reminder not found.' }, 404);
  }

  reminder.isCompleted = true;
  return c.json({ message: 'Reminder marked as completed.' }, 200);
});

// POST /reminders/:id/unmark-completed - Unmark a reminder as completed
app.post('/reminders/:id/unmark-completed', (c) => {
  const id = c.req.param('id');
  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return c.json({ error: 'Not Found: Reminder not found.' }, 404);
  }

  reminder.isCompleted = false;
  return c.json({ message: 'Reminder unmarked as completed.' }, 200);
});

// GET /reminders/completed - Retrieve all completed reminders
app.get('/reminders/completed', (c) => {
  const completedReminders = reminders.filter((r) => r.isCompleted);
  if (completedReminders.length === 0) {
    return c.json({ error: 'Not Found: No completed reminders.' }, 404);
  }
  return c.json(completedReminders, 200);
});

// GET /reminders/not-completed - Retrieve all not completed reminders
app.get('/reminders/not-completed', (c) => {
  const notCompletedReminders = reminders.filter((r) => !r.isCompleted);
  if (notCompletedReminders.length === 0) {
    return c.json({ error: 'Not Found: No uncompleted reminders.' }, 404);
  }
  return c.json(notCompletedReminders, 200);
});

// GET /reminders/due-today - Retrieve all reminders due by today
app.get('/reminders/due-today', (c) => {
  const todayReminders = reminders.filter((r) => isToday(parseISO(r.dueDate)));
  if (todayReminders.length === 0) {
    return c.json({ error: 'Not Found: No reminders due today.' }, 404);
  }
  return c.json(todayReminders, 200);
});


// Start the server
serve(app);


console.log("Server is running on http://localhost:3000");