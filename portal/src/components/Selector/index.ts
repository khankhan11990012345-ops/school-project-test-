// Universal reusable Selector component
// Use this component for all dropdown/select needs
// If you need to change the design, edit only Selector.tsx file

export { Selector, type SelectorProps, type SelectorOption } from './Selector';
export { default } from './Selector';

// Helper functions for loading options
export {
  loadGradeOptions,
  loadSubjectOptions,
  loadTeacherOptions,
  loadStudentOptions,
} from './selectorHelpers';

