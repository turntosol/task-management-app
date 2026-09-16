import React, { useState } from 'react';

import useTasks from '../../hooks/useTasks';
import useViewSetting from '../../hooks/useViewSetting';
import isDarkColor from '../../utils/IsDarkColor';

import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

import './week2.scss';
import New from '../NewModal/New';

const PRESET_BG_COLORS = [
  { hex: '#12544F' },
  { hex: '#FFCB56' },
  { hex: '#722F99' },
  { hex: '#3368A0' },
  { hex: '#8B2626' },
  { hex: '#F5788B' },
  { hex: '#EEEEEE' },
];

const CATEGORY_COLORS = {
  personal: '#1B2CC1',
  work: '#7692FF',
  order: '#ABD2FA',
};

const Week = ({ tags = [] }) => {
  const {
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
  } = useTasks("this_week");

  const { bgColor, changeBgColor } = useViewSetting('this_week', '#fcfcfc');

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

  const curr = new Date();

  const day = curr.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const firstDate = new Date(curr);
  firstDate.setDate(curr.getDate() + diffToMonday);

  const lastDate = new Date(firstDate);
  lastDate.setDate(firstDate.getDate() + 6);

  const firstday = formatLocalDate(firstDate);
  const lastday = formatLocalDate(lastDate);
  const todayStr = formatLocalDate(curr);

  const [openTask, setOpenTask] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showColorMenu, setShowColorMenu] = useState(false);

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingTask(null);
  };

  const handleOpenAddNew = () => {
    setEditingTask(null);
    setShowEditor(true);
  };

  const handleOpenEdit = (e, task) => {
    e.stopPropagation();
    setEditingTask(task);
    setShowEditor(true);
  };

  const handleSave = async (taskData) => {
      try {
          const savedTask = await handleSaveTask(
              taskData,
              editingTask
          );

          if (savedTask) {
              handleCloseEditor();
          }
      } catch (err) {
          console.error(
              'Failed to save task in Week.jsx:',
              err
          );

          handleCloseEditor();
      }
  };

  const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category?.name] || '#1B2CC1';
  };

  const toggleDetails = (id) => {
    setOpenTask(openTask === id ? null : id);
  };

  return (
    <div className="week" style={{ backgroundColor: bgColor }}>
      <div className="today-header">
        <div className="title-group">
          <p className="title">This Week</p>
        </div>

        <div className="actions-group">
          <div className="filter-pills">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              className={filter === 'active' ? 'active' : ''}
              onClick={() => handleFilterChange('active')}
            >
              Active
            </button>
            <button
              className={filter === 'completed' ? 'active' : ''}
              onClick={() => handleFilterChange('completed')}
            >
              Done
            </button>
          </div>

          <div className="color-picker-menu">
            <button
              className="color-picker-btn"
              onClick={() => setShowColorMenu(!showColorMenu)}
            >
              <PaletteOutlinedIcon className="icon" />
            </button>
            {showColorMenu && (
              <div className="palette-dropdown">
                {PRESET_BG_COLORS.map((c) => (
                  <span
                    key={c.hex}
                    className={`color-dot ${bgColor === c.hex ? 'selected' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => {
                      changeBgColor(c.hex); 
                      setShowColorMenu(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

        {loading && <p>Loading tasks...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && taskList.length === 0 && (
          <p>
            {filter === 'all'
              ? 'No tasks for this week.'
              : filter === 'active'
              ? 'No active tasks for this week.'
              : 'No completed tasks for this week.'}
          </p>
      )}

      <div className="task-scroll-container">
        <ul>
          <li className="add-task-item" onClick={handleOpenAddNew}>
            <AddIcon />
            <span style={{ marginLeft: '10px' }}>Add new task</span>
          </li>

          {!loading &&
            !error &&
            taskList.map((task) => {
              const totalSubCount = task.subtasks?.length || 0;
              const completedSubCount = task.subtasks?.filter((sub) => sub.is_completed).length || 0;
              const isOpen = openTask === task.id;
              const isDark = isDarkColor(task.background_color);
              const taskTextColor = isDark ? '#ffffff' : '#0f172a';
              const metaTextColor = isDark ? 'rgba(255, 255, 255, 0.75)' : '#64748b';
              const iconColor = isDark ? 'rgba(255, 255, 255, 0.85)' : '#94a3b8';
              const subtaskBg = isDark ? 'rgba(255, 255, 255, 0.12)' : '#f8fafc';

              return (
                <li
                  key={task.id}
                  className={`task-row ${task.is_completed ? 'is-completed' : ''}`}
                  style={{
                    backgroundColor: task.background_color || '#ffffff',
                    color: taskTextColor,
                    boxShadow: isDark
                      ? '0 2px 8px rgba(0,0,0,0.2)'
                      : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => handleToggleComplete(task)}
                    style={{ accentColor: isDark ? '#38bdf8' : '#3b82f6' }}
                  />

                  <div className="task-body">
                    <div
                      className="task-title-wrapper"
                      onClick={() => toggleDetails(task.id)}
                    >
                      <span
                        className="task-text"
                        style={{
                          color: taskTextColor,
                          textDecoration: task.is_completed ? 'line-through' : 'none',
                          opacity: task.is_completed ? 0.6 : 1,
                        }}
                      >
                        {task.is_calendar_event && (
                          <span className="calendar-event-emoji">
                            📌{" "}
                          </span>
                        )}
                        <span>{task.title}</span>
                      </span>
                    </div>

                    {isOpen && (
                      <div
                        className="details-expanded"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          borderTop: `1px solid ${
                            isDark ? 'rgba(255,255,255,0.2)' : '#f1f5f9'
                          }`,
                        }}
                      >
                        {task.description && (
                          <div
                            className="meta-des"
                            style={{ color: metaTextColor, marginBottom: '6px' }}
                          >
                            <p style={{ margin: 0 }}>{task.description}</p>
                          </div>
                        )}

                        <div className="meta-info" style={{ color: metaTextColor }}>
                          <div className="meta-item">
                            <TodayOutlinedIcon
                              className="icon"
                              style={{ color: iconColor }}
                            />
                            <p style={{ color: metaTextColor }}>{task.due_date}</p>
                          </div>

                          <div className="meta-item">
                            <TaskAltIcon className="icon" style={{ color: iconColor }} />
                            <span style={{ color: metaTextColor }}>
                              {completedSubCount}/{totalSubCount} Subtasks
                            </span>
                          </div>

                          {task.category && (
                            <div className="meta-item">
                              <span
                                className="category-dot"
                                style={{
                                  backgroundColor: getCategoryColor(task.category),
                                }}
                              />
                              <p style={{ color: metaTextColor }}>
                                {task.category?.name}
                              </p>
                            </div>
                          )}
                        </div>

                        {totalSubCount > 0 ? (
                          <div className="subtask-list-view">
                            {task.subtasks.map((sub) => (
                              <div
                                key={sub.id}
                                className={`subtask-item ${
                                  sub.is_completed ? 'sub-done' : ''
                                }`}
                                onClick={() => handleToggleSubtask(sub)}
                                style={{
                                  backgroundColor: subtaskBg,
                                  color: taskTextColor,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={sub.is_completed}
                                  onChange={() => handleToggleSubtask(sub)}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ accentColor: '#10b981' }}
                                />
                                <span
                                  style={{
                                    textDecoration: sub.is_completed
                                      ? 'line-through'
                                      : 'none',
                                  }}
                                >
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-subtasks" style={{ color: metaTextColor }}>
                            No subtasks created
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="row-actions">
                    <EditIcon
                      className="edit-icon"
                      onClick={(e) => handleOpenEdit(e, task)}
                      titleAccess="Edit task"
                      style={{ color: iconColor }}
                    />
                    <DeleteIcon
                      className="delete-icon"
                      onClick={(e) => handleDeleteTask(e, task.id)}
                      titleAccess="Delete task"
                    />
                    <NavigateNextIcon
                      className={`icon ${isOpen ? 'rotate' : ''}`}
                      onClick={() => toggleDetails(task.id)}
                      style={{ color: iconColor }}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      </div>

      {showEditor && (
        <New
          onClose={handleCloseEditor}
          tags={tags}
          taskToEdit={editingTask}
          onSave={handleSave}
          onDelete={handleDeleteTask}
          defaultDueDate={todayStr}
          dateLockMode="week"
          minDate={firstday}
          maxDate={lastday}
        />
      )}
    </div>
  );
};

export default Week;