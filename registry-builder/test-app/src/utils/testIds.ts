// Utility functions for generating test IDs
export const generateTestId = (component: string, action?: string, variant?: string): string => {
  const parts = [component];
  if (action) parts.push(action);
  if (variant) parts.push(variant);
  return parts.join('-');
};

export const createPageTestId = (page: string, element: string): string => {
  return `${page.toLowerCase()}-${element}`;
};

export const getModalTestId = (modalType: string, element?: string): string => {
  const base = `modal-${modalType}`;
  return element ? `${base}-${element}` : base;
};