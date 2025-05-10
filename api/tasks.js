import express from "express";
const router = express.Router();
export default router;

import {
  createTask,
  deleteTask,
  getTaskByTaskId,
  getTasksByUserId,
  updateTask,
} from "#db/queries/tasks";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

router.use(requireUser);

router
  .route("/")
  .get(async (req, res) => {
    const tasks = await getTasksByUserId(req.user.id);
    const filteredTasks = tasks.map(({ title, done }) => ({ title, done }));
    res.send(filteredTasks);
  })
  .post(requireBody(["title", "done"]), async (req, res) => {
    const { title, done } = req.body;
    const task = await createTask({ title, done, userId: req.user.id });
    res.status(201).send(task);
  });

router.param("id", async (req, res, next, id) => {
  const task = await getTaskByTaskId(id);
  if (!task) return res.status(404).send("Task not found.");
  if (req.user.id !== task.user_id) {
    return res.status(403).send("You are not authorized to access this task.");
  }
  req.task = task;
  next();
});

router
  .route("/:id")
  .put(async (req, res) => {
    const { title, done } = req.body;
    if (title === undefined || done === undefined)
      return res.status(400).send("Request does not include title and done.");
    const task = await updateTask({
      id: req.task.id,
      title,
      done,
    });
    res.send(task);
  })
  .delete(async (req, res) => {
    await deleteTask(req.task.id);
    res.status(204).send();
  });
