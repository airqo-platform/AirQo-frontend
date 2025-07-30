import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for handling table multi-select functionality
 * @param {Array} data - The current page data
 * @param {Function} onSelectedItemsChange - Callback when selection changes
 * @returns {Object} Multi-select state and handlers
 */
export const useTableMultiSelect = (data, onSelectedItemsChange) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAction, setSelectedAction] = useState('');

  const handleSelectAll = useCallback(
    (isChecked) => {
      if (isChecked) {
        const currentPageIds = data.map((item) => item.id);
        setSelectedItems((prevSelected) => {
          const newItems = currentPageIds.filter(
            (id) => !prevSelected.includes(id),
          );
          const updatedSelected = [...prevSelected, ...newItems];
          onSelectedItemsChange?.(updatedSelected);
          return updatedSelected;
        });
      } else {
        const currentPageIds = data.map((item) => item.id);
        setSelectedItems((prevSelected) => {
          const updatedSelected = prevSelected.filter(
            (id) => !currentPageIds.includes(id),
          );
          onSelectedItemsChange?.(updatedSelected);
          return updatedSelected;
        });
      }
    },
    [data, onSelectedItemsChange],
  );

  const handleSelectItem = useCallback(
    (itemId, isChecked) => {
      if (isChecked) {
        setSelectedItems((prevSelected) => {
          const updatedSelected = [...prevSelected, itemId];
          onSelectedItemsChange?.(updatedSelected);
          return updatedSelected;
        });
      } else {
        setSelectedItems((prevSelected) => {
          const updatedSelected = prevSelected.filter((id) => id !== itemId);
          onSelectedItemsChange?.(updatedSelected);
          return updatedSelected;
        });
      }
    },
    [onSelectedItemsChange],
  );

  const isAllSelectedOnPage = useMemo(
    () =>
      data.length > 0 && data.every((item) => selectedItems.includes(item.id)),
    [data, selectedItems],
  );

  const isAnySelected = selectedItems.length > 0;

  const handleActionChange = useCallback((e) => {
    setSelectedAction(e.target.value);
  }, []);

  const handleActionSubmit = useCallback(
    (actions) => {
      if (selectedAction && actions.length > 0) {
        const action = actions.find((a) => a.value === selectedAction);
        if (action && typeof action.handler === 'function') {
          action.handler(selectedItems);
        }
      }
      setSelectedAction('');
    },
    [selectedAction, selectedItems],
  );

  return {
    selectedItems,
    selectedAction,
    isAllSelectedOnPage,
    isAnySelected,
    handleSelectAll,
    handleSelectItem,
    handleActionChange,
    handleActionSubmit,
  };
};
