/**
 * Helper functions for using the universal Selector component
 * These functions return async option loaders that can be used with the Selector component
 */

import { SelectorOption } from './Selector';
import api from '../../services/api';

/**
 * Load grade options for Selector component
 * @param showSection - If true, includes section in label (e.g., "Grade 1 - Section A")
 * @param filterActiveOnly - If true, only shows active grades (default: true)
 */
export const loadGradeOptions = async (
  showSection: boolean = false,
  filterActiveOnly: boolean = true
): Promise<SelectorOption[]> => {
  const response = await api.grades.getAll() as any;
  if (response.data?.classes) {
    const gradeMap = new Map<string, any>();
    response.data.classes.forEach((c: any) => {
      const gradeKey = c.grade || 'Unknown';
      if (!gradeMap.has(gradeKey)) {
        const gradeClasses = response.data.classes.filter((cls: any) => (cls.grade || 'Unknown') === gradeKey);
        gradeMap.set(gradeKey, {
          id: gradeKey,
          name: gradeKey,
          section: gradeClasses[0]?.section || '',
          status: gradeClasses[0]?.status || 'Active',
        });
      }
    });
    const grades = Array.from(gradeMap.values());
  const filteredGrades = filterActiveOnly 
      ? grades.filter((g: any) => g.status === 'Active')
    : grades;
  
    return filteredGrades.map((grade: any) => {
    let label = grade.name;
    if (showSection && grade.section) {
      label = `${grade.name} - Section ${grade.section}`;
    }
    return {
      value: grade.id,
      label: label,
    };
  });
  }
  return [];
};

/**
 * Load subject options for Selector component
 * @param filterActiveOnly - If true, only shows active subjects (default: true)
 */
export const loadSubjectOptions = async (
  filterActiveOnly: boolean = true
): Promise<SelectorOption[]> => {
  const response = await api.subjects.getAll() as any;
  if (response.data?.subjects) {
  const filteredSubjects = filterActiveOnly 
      ? response.data.subjects.filter((s: any) => s.status === 'Active')
      : response.data.subjects;
  
    return filteredSubjects.map((subject: any) => ({
      value: String(subject._id || subject.code || subject.id),
    label: `${subject.name} (${subject.code})`,
  }));
  }
  return [];
};

/**
 * Load teacher options for Selector component
 */
export const loadTeacherOptions = async (): Promise<SelectorOption[]> => {
  const response = await api.teachers.getAll() as any;
  if (response.data?.teachers) {
    return response.data.teachers.map((teacher: any) => ({
      value: String(teacher._id || teacher.teacherId || teacher.id),
      label: `${teacher.name}${teacher.teacherId ? ` (${teacher.teacherId})` : ''}`,
  }));
  }
  return [];
};

/**
 * Load student options for Selector component
 */
export const loadStudentOptions = async (): Promise<SelectorOption[]> => {
  const response = await api.students.getAll() as any;
  if (response.data?.students) {
    return response.data.students.map((student: any) => ({
      value: String(student._id || student.studentId || student.id),
      label: `${student.name}${student.studentId ? ` (${student.studentId})` : ''}`,
  }));
  }
  return [];
};

/**
 * Example usage:
 * 
 * import { Selector } from '../../../components/Selector';
 * import { loadGradeOptions } from '../../../components/Selector/selectorHelpers';
 * 
 * <Selector
 *   value={selectedGrade}
 *   onChange={(val) => setSelectedGrade(String(val))}
 *   options={loadGradeOptions}
 *   placeholder="Select Grade"
 *   required
 * />
 */

