import { useCallback, useEffect, useState } from "react";
import { 
    getTasks, 
    getTask,
    createTask, 
    updateTask, 
    deleteTask 
} from "../api/tasks";

import { 
    createSubTask, 
    updateSubTask, 
    deleteSubTask 
} from "../api/subTasks";

import { auth } from "../firebase/config"; 

const useTasks = (dateFilter, categoryFilter = "", status, query) => {

    console.log("dateFilter:", dateFilter);
    console.log("filter:", status);
    console.log("query:", query);

    const [taskList, setTaskList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");


    const buildQuery = useCallback(
        (
            status = "all",
            category = categoryFilter
        ) => {
            const params = new URLSearchParams();

            if (dateFilter) {
                params.append(
                    "date",
                    dateFilter
                );
            }

            if (status === "active") {
                params.append(
                    "status",
                    "active"
                );
            }

            if (status === "completed") {
                params.append(
                    "status",
                    "done"
                );
            }

            if (category) {
                params.append(
                    "category",
                    category
                );
            }

            return `?${params.toString()}`;
        },
        [
            dateFilter,
            categoryFilter
        ]
    );


    const loadTasks = useCallback(
        async (status = "all") => {
            try {
                setLoading(true);
                setError("");

                const query = buildQuery(status);

                const data = await getTasks(query);

                setTaskList(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {
                console.error(
                    "Failed to load tasks:",
                    err
                );

                if (
                    err.status === 401 ||
                    err.message ===
                        "User is not authenticated."
                ) {
                    setError(
                        "Please log in to view tasks."
                    );
                } else {
                    setError(
                        "Failed to load tasks."
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        [buildQuery]
    );


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setFilter("all");
                loadTasks("all");
            } else {
                setTaskList([]);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [dateFilter, loadTasks]);


    const handleFilterChange = async (value) => {
        try {
            setFilter(value);
            setError("");
            await loadTasks(value);
        } catch (err) {
            console.error("Failed to filter tasks:", err);
        }
    };


    const handleSaveTask = async (taskData, editingTask) => {
        try {
            setError("");

            const {
                subtasks = [],
                ...taskPayload
            } = taskData;

            let savedTask;

            if (!editingTask) {
                savedTask = await createTask(taskPayload);

                for (const subtask of subtasks) {
                    if (!subtask.title?.trim()) continue;

                    await createSubTask({
                        task: savedTask.id,
                        title: subtask.title.trim(),
                        is_completed:
                            subtask.is_completed ?? false,
                    });
                }
            }

            else {
                savedTask = await updateTask(
                    editingTask.id,
                    taskPayload
                );

                const oldSubtasks =
                    editingTask.subtasks || [];

                const existingSubtaskIds = subtasks
                    .filter(
                        (sub) =>
                            sub.id !== undefined &&
                            sub.id !== null
                    )
                    .map(
                        (sub) => String(sub.id)
                    );

                for (const oldSubtask of oldSubtasks) {
                    if (
                        !existingSubtaskIds.includes(
                            String(oldSubtask.id)
                        )
                    ) {
                        await deleteSubTask(
                            oldSubtask.id
                        );
                    }
                }

                for (const subtask of subtasks) {
                    if (!subtask.title?.trim()) continue;

                    if (
                        subtask.id === undefined ||
                        subtask.id === null
                    ) {
                        await createSubTask({
                            task: savedTask.id,
                            title: subtask.title.trim(),
                            is_completed:
                                subtask.is_completed ?? false,
                        });
                    } else {
                        await updateSubTask(
                            subtask.id,
                            {
                                title: subtask.title.trim(),
                                is_completed:
                                    subtask.is_completed ?? false,
                            }
                        );
                    }
                }
            }

            await loadTasks(filter);
            return savedTask;

        } catch (err) {
            console.error(
                "Save task error:",
                err
            );

            setError(
                err.data?.detail ||
                "Failed to save task."
            );
            throw err;
        }
    };


    const handleToggleComplete = async (task) => {
        try {
            const updatedTask = await updateTask(task.id, { is_completed: !task.is_completed });
            setTaskList((prev) =>
                prev.map((item) => (item.id === updatedTask.id ? { ...item, is_completed: updatedTask.is_completed } : item))
            );
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };


    const handleToggleSubtask = async (subtask) => {
        try {
            const updatedSubTask = await updateSubTask(subtask.id, { is_completed: !subtask.is_completed });
            setTaskList((prev) =>
                prev.map((task) => ({
                    ...task,
                    subtasks: task.subtasks?.map((sub) => (sub.id === updatedSubTask.id ? updatedSubTask : sub)),
                }))
            );
        } catch (err) {
            console.error("Failed to update subtask:", err);
        }
    };


    const handleDeleteTask = async (e, id) => {
        if (e && typeof e.stopPropagation === "function") e.stopPropagation();
        try {
            await deleteTask(id);
            setTaskList((prev) => prev.filter((task) => task.id !== id));
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };

    
    return {
        taskList,
        loading,
        error,
        filter,
        loadTasks,
        handleFilterChange,
        handleSaveTask,
        handleToggleComplete,
        handleToggleSubtask,
        handleDeleteTask,
    };
};

export default useTasks;