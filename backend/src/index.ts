import express, { Request, Response } from "express";

const app = express();
import cors from "cors";

app.use(express.json());
app.use(cors());

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const tasks: Task[] = [];

const hasCompleted = (task: unknown): boolean => {
  return (
    typeof task === "object" &&
    task !== null &&
    "completed" in task &&
    typeof (task as any).completed === "boolean"
  );
};

app.get("/tasks", (req: Request, res: Response) => {
  res.json(tasks);
});

app.post("/tasks", (req: Request, res: Response) => {
  const newTask: Task = req.body;
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.patch("/tasks/:taskId", (req: Request, res: Response) => {
	const taskId: number = Number(req.params.taskId);
	const targetTask: Task | undefined = tasks.find(t => t.id === taskId);
	const inputTask = req.body;
	if (targetTask && hasCompleted(inputTask)) {
		targetTask.completed = inputTask.completed;
		res.status(201).json(targetTask);
	} else {
		console.log('Task not found or missing "completed" info.')
		res.status(201).json({});
	}
});

app.listen(3000, () => console.log("Server running on port 3000"));