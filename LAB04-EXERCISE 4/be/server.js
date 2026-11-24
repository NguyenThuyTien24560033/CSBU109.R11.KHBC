// server.js - Task Manager REST API (in-memory storage)
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5002;

// Allow the Web UI to call this API from another origin
// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST']
// }));

//FIX 1:
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  // methods: ['GET', 'POST']
  //FIX 2:
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

//FIX 3: 
app.use(express.json()); 
// ---------- In-memory "database" ----------
let tasks = [
  { id: 1, title: 'Read the Express routing docs', done: true, createdAt: '2026-09-20T08:00:00.000Z' },
  { id: 2, title: 'Install Postman', done: false, createdAt: '2026-09-21T09:30:00.000Z' },
  { id: 3, title: 'Finish Lab 4 exercise 3', done: false, createdAt: '2026-09-22T14:15:00.000Z' },
  { id: 4, title: 'Review HTTP status codes', done: false, createdAt: '2026-09-23T10:45:00.000Z' }
];
let nextId = 5;

// Shape a task for the API response
//FIX 4:
const toDto = (task) => ({
  id: task.id,
  // name: task.title,
  title: task.title,
  done: task.done,
  createdAt: task.createdAt
});

// ---------- Routes ----------

// GET /api/tasks?status=all|active|done
app.get('/api/tasks', (req, res) => {
  const { status } = req.query;

  if (status === 'active') {
    return res.json({ success: true, data: tasks.filter((t) => !t.done).map(toDto) });
  }
//FIX 5:
  if (status === 'done') {
    // const doneTasks = tasks.filter((t) => t.done);
    // console.log(`Found ${doneTasks.length} completed task(s)`);
    return res.json({ success: true, data: tasks.filter((t) => t.done).map(toDto) });
  }

  if (!status || status === 'all') {
    return res.json({ success: true, data: tasks.map(toDto) });
  }
});

//FIX 6:
// GET /api/tasks/stats
app.get('/api/tasks/stats', (req, res) => {
  const total = tasks.length;
  // const done = tasks.filter((t) => !t.done).length;
  const done = tasks.filter((t) => t.done).length;
  // const active = tasks.filter((t) => t.done).length;
  const active = tasks.filter((t) => !t.done).length;
  res.json({ success: true, data: { total, active, done } });
});

// POST /api/tasks  body: { title }
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;

  //FIX 7:
  if (!title || !title.trim()) {
    // res.status(400).json({ success: false, message: 'Title is required' });
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json({ success: true, data: toDto(task) });
});

// PUT /api/tasks/:id  body: { title?, done? }
//FIX 8:
app.put('/api/tasks/:id', (req, res) => {
  // const task = tasks.find((t) => t.id === req.params.id);
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }


//FIX 9:
  // task.title = req.body.title || task.title;
  // task.done = req.body.done || task.done;
  // res.json({ success: true, data: toDto(task) });
  const { title, done } = req.body;
  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;
  res.json({ success: true, data: toDto(task) });
});

// DELETE /api/tasks/:id
//FIX 10:
app.delete('/api/tasks/:id', (req, res) => {
  // const id = parseInt(req.params.id);
  // const task = tasks.find((t) => t.id === id);
  // if (!task) {
  //   return res.status(404).json({ success: false, message: 'Task not found' });
  // }

  // tasks.splice(id, 1);
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.json({ success: true, message: 'Task deleted' });
});

app.listen(PORT, () => {
  console.log(`Task API running at http://localhost:${PORT}`);
});
