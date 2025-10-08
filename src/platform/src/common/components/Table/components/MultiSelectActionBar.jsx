import React, { memo } from 'react';

/**
 * Multi-select action bar component
 */
const MultiSelectActionBar = ({
  selectedItems,
  actions,
  selectedAction,
  onActionChange,
  onActionSubmit,
}) => {
  const isAnySelected = selectedItems.length > 0;

  if (!isAnySelected) return null;

  return (
    <div className="px-6 py-3 bg-primary/10 dark:bg-primary/20 border-b border-primary/20 dark:border-primary/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-sm text-primary dark:text-primary">
        {selectedItems.length} item(s) selected
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <select
          value={selectedAction}
          onChange={onActionChange}
          className="border border-primary/30 dark:border-primary/40 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value="">Select Action</option>
          {actions.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
        <button
          onClick={onActionSubmit}
          disabled={!selectedAction}
          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
            selectedAction
              ? 'bg-primary text-white border-primary hover:bg-primary/90'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed'
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default memo(MultiSelectActionBar);
