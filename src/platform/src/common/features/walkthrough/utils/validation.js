export function validateSteps(steps) {
  const errors = [];
  if (!Array.isArray(steps)) {
    errors.push('Steps must be an array');
    return { isValid: false, errors };
  }
  if (steps.length === 0) {
    errors.push('At least one step is required');
    return { isValid: false, errors };
  }
  const seenIds = new Set();
  steps.forEach((step, index) => {
    const stepErrors = validateStep(step, index);
    errors.push(...stepErrors);
    if (step.id && seenIds.has(step.id)) {
      errors.push(`Duplicate step ID "${step.id}" at index ${index}`);
    } else if (step.id) {
      seenIds.add(step.id);
    }
  });
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateStep(step, index) {
  const errors = [];
  if (!step || typeof step !== 'object') {
    errors.push(`Step at index ${index} must be an object`);
    return errors;
  }
  const requiredFields = ['id', 'target', 'title', 'content'];
  requiredFields.forEach((field) => {
    if (!step[field]) {
      errors.push(`Step at index ${index} is missing required field: ${field}`);
    }
  });
  if (step.id && typeof step.id !== 'string') {
    errors.push(`Step ID at index ${index} must be a string`);
  }
  if (step.target && typeof step.target !== 'string') {
    errors.push(`Step target at index ${index} must be a CSS selector string`);
  }
  if (step.title && typeof step.title !== 'string') {
    errors.push(`Step title at index ${index} must be a string`);
  }
  if (
    step.content &&
    typeof step.content !== 'string' &&
    typeof step.content !== 'object'
  ) {
    errors.push(
      `Step content at index ${index} must be a string or React element`,
    );
  }
  if (
    step.placement &&
    !['top', 'bottom', 'left', 'right', 'auto'].includes(step.placement)
  ) {
    errors.push(`Invalid placement "${step.placement}" at step ${index}`);
  }
  return errors;
}

export function validateConfiguration(configuration) {
  const errors = [];
  if (
    configuration.maxWidth &&
    typeof configuration.maxWidth !== 'string' &&
    typeof configuration.maxWidth !== 'number'
  ) {
    errors.push('Configuration maxWidth must be a string or number');
  }
  if (
    configuration.spacing &&
    (typeof configuration.spacing !== 'number' || configuration.spacing < 0)
  ) {
    errors.push('Configuration spacing must be a positive number');
  }
  if (
    configuration.scrollOffset &&
    (typeof configuration.scrollOffset !== 'number' ||
      configuration.scrollOffset < 0)
  ) {
    errors.push('Configuration scrollOffset must be a positive number');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}
