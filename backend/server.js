const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Signup endpoint
server.post('/signup', (req, res) => {
  const users = router.db.get('users'); // Access the users collection
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (users.find({ email }).value()) {
    return res.status(400).json({ message: 'User already exists' });
  }

  users.push({ email, password }).write(); // Add the new user
  res.status(201).json({ message: 'Signup successful' });
});

// Login endpoint
server.post('/login', (req, res) => {
  const users = router.db.get('users'); // Access the users collection
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find({ email, password }).value();

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  res.status(200).json({ message: 'Login successful', user });
});

// Use the default router (for other endpoints like todos)
server.use(router);

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
