import React, { useState, useEffect } from "react";
import axios from "axios";

// Interface for Task object
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// Union Type: A task can either have a due date or priority
type TaskDetails = { dueDate: string } | { priority: "low" | "medium" | "high" };

// Intersection Type: Enhanced task with additional details
type EnhancedTask = Task & TaskDetails;

// Type Guard to check if task has a due date
const hasDueDate = (task: EnhancedTask): task is Task & { dueDate: string } => {
  return "dueDate" in task;
};

// Generic function to filter tasks
const filterTasks = <T extends Task>(tasks: T[], filterFn: (task: T) => boolean): T[] => {
  return tasks.filter(filterFn);
};

// Alias for input change handler
type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

const App: React.FC = () => {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [additionalDetail, setAdditionalDetail] = useState("dueDate");
  const [detailValue, setDetailValue] = useState("");

  useEffect(() => {
    axios
      .get<Task[]>("http://localhost:3000/tasks")
      .then((response) => {
        const fetchedTasks: EnhancedTask[] = response.data.map((task) => ({ ...task, priority: "medium" }));
        setTasks(fetchedTasks);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: EnhancedTask = {
      id: tasks.length + 1,
      title: newTaskTitle,
      completed: false,
      ...(additionalDetail === "dueDate" ? { dueDate: detailValue } : { priority: detailValue as "low" | "medium" | "high" }),
    };

    axios
      .post<EnhancedTask>("http://localhost:3000/tasks", newTask)
      .then((response) => {
        setTasks((prevTasks) => [...prevTasks, response.data]);
        setNewTaskTitle("");
        setDetailValue("");
      })
      .catch((error) => console.error("Error adding task:", error));
  };

  const toggleComplete = (taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    axios
      .patch(`http://localhost:3000/tasks/${taskId}`, { completed: !tasks.find((task) => task.id === taskId)?.completed })
      .catch((error) => console.error("Error toggling task complete:", error));
  };

  const handleInputChange: InputChangeHandler = (e) => setNewTaskTitle(e.target.value);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Task Manager</h1>

      {/* Input for new task */}
      <div>
        <input
          type="text"
          placeholder="Enter task title"
          value={newTaskTitle}
          onChange={handleInputChange}
        />

        <select value={additionalDetail} onChange={(e) => setAdditionalDetail(e.target.value)}>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>

        <input
          type="text"
          placeholder={additionalDetail === "dueDate" ? "Enter due date" : "Enter priority (low, medium, high)"}
          value={detailValue}
          onChange={(e) => setDetailValue(e.target.value)}
        />

        <button onClick={addTask}>Add Task</button>
      </div>

      {/* Task list */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Title</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Details</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Completed</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{task.title}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {hasDueDate(task) ? `Due: ${task.dueDate}` : `Priority: ${task.priority}`}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Example of using the generic function */}
      <div>
        <h2>Incomplete Tasks:</h2>
        <ul>
          {filterTasks(tasks, (task) => !task.completed).map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;