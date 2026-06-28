import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ message = "No tasks found", actionText = "Create Task", actionLink = "/create" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center glass-card">
      <div className="w-24 h-24 mb-6 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Get started by creating a new task to keep track of your work and boost your productivity.
      </p>
      {actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
