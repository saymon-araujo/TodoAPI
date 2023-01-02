const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  } else {
    request.user = user;
    return next();
  }
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const userAldearyExists = users.some((user) => user.username === username);

  if (!username) {
    return response.status(400).json({ error: "Username is required" });
  }

  if (!name) {
    return response.status(400).json({ error: "Name is required" });
  }

  if (userAldearyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const userInfo = {
    username,
    name,
    id: uuidv4(),
    todos: [],
  };

  users.push(userInfo);

  return response.status(201).send(userInfo);
});

app.get("/users", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  if (!title) {
    return response.status(400).json({ error: "Title is required" });
  }

  if (!deadline) {
    return response.status(400).json({ error: "Deadline is required" });
  }

  const todoToCreate = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  };

  user.todos.push(todoToCreate);

  return response.status(201).send(todoToCreate);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoToUpdate = user.todos.find((todo) => todo.id === id);

  if (!title) {
    return response.status(400).json({ error: "Title is required" });
  }
  if (!deadline) {
    return response.status(400).json({ error: "Deadline is required" });
  }
  if (!todoToUpdate) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todoToUpdate.title = title;
  todoToUpdate.deadline = deadline;
  return response.status(201).json(todoToUpdate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoToPatch = user.todos.find((todo) => todo.id === id);

  if (!todoToPatch) {
    return response.status(404).json({ error: "Todo not found" });
  }

  if (todoToPatch.done) {
    return response.status(400).json({ error: "Todo already done" });
  }

  todoToPatch.done = true;
  return response.status(201).json(todoToPatch);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoToDelete = user.todos.find((todo) => todo.id === id);

  if (!todoToDelete) {
    return response.status(404).json({ error: "Todo not found" });
  } else {
    user.todos.splice(todoToDelete, 1);

    return response.status(204).send();
  }
});

module.exports = app;
