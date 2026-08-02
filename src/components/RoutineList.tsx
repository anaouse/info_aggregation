import { useEffect, useState } from "react";

interface RoutineItem {
  id: string;
  name: string;
  completed: boolean;
}

interface RoutineStorage {
  date: string;
  items: RoutineItem[];
}

const STORAGE_KEY = "routine_list";

function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadRoutines(): RoutineItem[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    const storage = JSON.parse(saved) as RoutineStorage;
    if (storage.date !== getTodayKey()) {
      return storage.items.map((item) => ({ ...item, completed: false }));
    }
    return storage.items;
  } catch {
    return [];
  }
}

function saveRoutines(items: RoutineItem[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: getTodayKey(), items } satisfies RoutineStorage),
  );
}

export default function RoutineList() {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [newRoutine, setNewRoutine] = useState("");

  useEffect(() => {
    const items = loadRoutines();
    setRoutines(items);
    saveRoutines(items);

    const interval = window.setInterval(() => {
      const current = localStorage.getItem(STORAGE_KEY);
      if (!current) return;

      try {
        const storage = JSON.parse(current) as RoutineStorage;
        if (storage.date !== getTodayKey()) {
          const resetItems = storage.items.map((item) => ({ ...item, completed: false }));
          setRoutines(resetItems);
          saveRoutines(resetItems);
        }
      } catch {
        // Ignore malformed local storage data.
      }
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  function handleAdd() {
    const name = newRoutine.trim();
    if (!name) return;

    const items = [
      ...routines,
      { id: `${Date.now()}-${Math.random()}`, name, completed: false },
    ];
    setRoutines(items);
    saveRoutines(items);
    setNewRoutine("");
  }

  function handleToggle(id: string) {
    const items = routines.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setRoutines(items);
    saveRoutines(items);
  }

  function handleDelete(id: string) {
    const items = routines.filter((item) => item.id !== id);
    setRoutines(items);
    saveRoutines(items);
  }

  return (
    <div className="routine-list">
      <h2 className="routine-list-title">✓ Routine</h2>

      <div className="routine-list-body">
        <div className="routine-list-add-row">
          <input
            className="routine-list-input"
            type="text"
            placeholder="添加 routine"
            value={newRoutine}
            onChange={(e) => setNewRoutine(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <button className="routine-list-add-button" onClick={handleAdd}>
            添加
          </button>
        </div>

        {routines.length > 0 && (
          <ul className="routine-list-items">
            {routines.map((routine) => (
              <li className="routine-list-item" key={routine.id}>
                <label className={routine.completed ? "routine-list-item-completed" : ""}>
                  <input
                    type="checkbox"
                    checked={routine.completed}
                    onChange={() => handleToggle(routine.id)}
                  />
                  <span>{routine.name}</span>
                </label>
                <button
                  className="routine-list-delete-button"
                  onClick={() => handleDelete(routine.id)}
                  aria-label={`删除 ${routine.name}`}
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
