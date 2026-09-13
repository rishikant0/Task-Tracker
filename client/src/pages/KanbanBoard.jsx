import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useTaskStore from '../store/useTaskStore';
import useModalStore from '../store/useModalStore';
import TaskCard from '../components/TaskCard';

const COLUMNS = [
  { key: 'todo', label: 'To Do', icon: '📦', color: '#3B82F6' },
  { key: 'in-progress', label: 'In Progress', icon: '⚡', color: '#F59E0B' },
  { key: 'done', label: 'Done', icon: '✅', color: '#22C55E' },
];

const KanbanBoard = () => {
  const { tasks, fetchTasks, loading, moveTask } = useTaskStore();
  const { openModal } = useModalStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const filtered = search.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.description || '').toLowerCase().includes(search.toLowerCase())
      )
    : tasks;

  const onDragEnd = useCallback(
    async (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId) return;

      await moveTask(draggableId, destination.droppableId);
    },
    [moveTask]
  );

  return (
    <div className="flex flex-col h-full gap-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Board</h1>
          <p className="text-sm text-text-secondary mt-0.5">{tasks.length} total tasks</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field pl-8 w-48 sm:w-56"
            />
          </div>
          <button onClick={() => openModal()} className="btn-primary flex-shrink-0">
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban columns */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-secondary text-sm">
          Loading tasks...
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
            {COLUMNS.map(({ key, label, icon, color }) => {
              const colTasks = filtered.filter((t) => t.status === key);

              return (
                <div key={key} className="flex flex-col min-h-0">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-base">{icon}</span>
                    <span className="text-sm font-semibold text-text-primary">{label}</span>
                    <span
                      className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${color}20`, color }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 card p-3 space-y-3 overflow-y-auto transition-colors ${
                          snapshot.isDraggingOver ? 'drag-over' : ''
                        }`}
                        style={{ minHeight: '200px' }}
                      >
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-xs text-text-secondary">No tasks here</p>
                            <button
                              onClick={() => openModal()}
                              className="mt-2 text-xs text-primary hover:text-primary-hover transition-colors"
                            >
                              + Add one
                            </button>
                          </div>
                        )}

                        {colTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? 'opacity-80 rotate-1 shadow-modal' : ''}
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default KanbanBoard;
