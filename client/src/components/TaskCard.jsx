import React from 'react';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import useModalStore from '../store/useModalStore';
import useDeleteStore from '../store/useDeleteStore';

const PRIORITY_CLASSES = {
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const PRIORITY_DOTS = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-green-400',
};

const TaskCard = ({ task, dragHandleProps = {} }) => {
  const { openModal } = useModalStore();
  const { openDelete } = useDeleteStore();

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate));

  const dueDateDisplay = task.dueDate
    ? format(new Date(task.dueDate), 'MMM d, yyyy')
    : null;

  return (
    <div
      className="card card-hover p-4 cursor-default group"
      {...dragHandleProps}
    >
      {/* Priority dot + title row */}
      <div className="flex items-start gap-2.5 mb-2">
        <div
          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_DOTS[task.priority] || PRIORITY_DOTS.medium}`}
        />
        <h4 className="text-sm font-semibold text-text-primary leading-snug flex-1 break-words">
          {task.title}
        </h4>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-text-secondary leading-relaxed mb-3 pl-4.5 line-clamp-2 break-words" style={{ paddingLeft: '18px' }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-3 pl-[18px]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority badge */}
          <span className={PRIORITY_CLASSES[task.priority] || PRIORITY_CLASSES.medium}>
            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
          </span>

          {/* Due date */}
          {dueDateDisplay && (
            <span
              className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-400 font-medium' : 'text-text-secondary'
              }`}
            >
              <Calendar size={11} />
              {isOverdue && <span className="font-semibold">Overdue · </span>}
              {dueDateDisplay}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            id={`edit-task-${task._id}`}
            onClick={() => openModal(task)}
            className="btn-icon"
            aria-label="Edit task"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            id={`delete-task-${task._id}`}
            onClick={() => openDelete(task._id, task.title)}
            className="btn-icon hover:text-red-400"
            aria-label="Delete task"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
