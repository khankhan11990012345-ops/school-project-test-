import React, { useState } from 'react';
import { Check, X, Plus } from 'lucide-react';

export interface GradeSectionAssignment {
  grade: string;
  sections: string[];
}

export interface TeacherAssignment {
  teacherId: string;
  gradeSections: GradeSectionAssignment[];
}

interface TeacherGradeAssignmentProps {
  teachers: Array<{ value: string; label: string }>;
  allClasses: any[];
  value?: TeacherAssignment;
  onChange?: (assignment: TeacherAssignment | null) => void;
}

const TeacherGradeAssignment: React.FC<TeacherGradeAssignmentProps> = ({
  teachers,
  allClasses,
  value,
  onChange,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(value?.teacherId || '');
  const [gradeSections, setGradeSections] = useState<GradeSectionAssignment[]>(
    value?.gradeSections || []
  );

  // Extract grade from class name (e.g., "Grade 1 Section A" -> "Grade 1")
  const extractGradeFromName = (name: string): string | null => {
    if (!name) return null;
    const match = name.match(/^(Grade\s+\d+)/i);
    return match ? match[1] : null;
  };

  // Get available sections for a grade
  const getSectionsForGrade = (grade: string): Array<{ value: string; label: string }> => {
    if (!Array.isArray(allClasses) || !grade) {
      return [];
    }
    const normalizedGrade = grade.startsWith('Grade') ? grade : `Grade ${grade}`;
    
    const filteredClasses = allClasses.filter((c: any) => {
      if (c.status !== 'Active') return false;
      // Extract grade from name field
      const classGrade = extractGradeFromName(c.name || '');
      return classGrade === normalizedGrade;
    });
    
    // Get unique sections
    const sections = [...new Set(filteredClasses.map((c: any) => c.section).filter(Boolean))];
    
    return sections.map((section: string) => ({
      value: section,
      label: `Section ${section}`,
    }));
  };

  // Get available grades from classes
  const getAvailableGrades = (): Array<{ value: string; label: string }> => {
    if (!Array.isArray(allClasses)) {
      return [];
    }
    
    const gradeMap = new Map<string, string>();
    allClasses.forEach((c: any) => {
      if (c.status === 'Active' && c.name) {
        // Extract grade from name field (e.g., "Grade 1 Section A" -> "Grade 1")
        const gradeKey = extractGradeFromName(c.name);
        if (gradeKey && !gradeMap.has(gradeKey)) {
          gradeMap.set(gradeKey, gradeKey);
        }
      }
    });
    
    return Array.from(gradeMap.values())
      .sort((a, b) => {
        // Sort by grade number (Grade 1, Grade 2, etc.)
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      })
      .map(grade => ({ value: grade, label: grade }));
  };

  // Handle teacher selection
  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    if (teacherId) {
      // Keep existing grade sections when teacher changes
      const assignment: TeacherAssignment = {
        teacherId,
        gradeSections: gradeSections.length > 0 ? gradeSections : [],
      };
      onChange?.(assignment);
    } else {
      onChange?.(null);
    }
  };

  // Add a new grade
  const handleAddGrade = () => {
    const newGradeSections = [...gradeSections, { grade: '', sections: [] }];
    setGradeSections(newGradeSections);
    if (selectedTeacherId) {
      onChange?.({
        teacherId: selectedTeacherId,
        gradeSections: newGradeSections,
      });
    }
  };

  // Remove a grade
  const handleRemoveGrade = (index: number) => {
    const newGradeSections = gradeSections.filter((_, i) => i !== index);
    setGradeSections(newGradeSections);
    if (selectedTeacherId) {
      onChange?.({
        teacherId: selectedTeacherId,
        gradeSections: newGradeSections,
      });
    }
  };

  // Update grade selection
  const handleGradeChange = (index: number, grade: string) => {
    const newGradeSections = [...gradeSections];
    newGradeSections[index] = {
      grade,
      sections: [], // Reset sections when grade changes
    };
    setGradeSections(newGradeSections);
    if (selectedTeacherId) {
      onChange?.({
        teacherId: selectedTeacherId,
        gradeSections: newGradeSections,
      });
    }
  };

  // Toggle section selection
  const handleSectionToggle = (gradeIndex: number, section: string) => {
    const newGradeSections = [...gradeSections];
    const currentSections = newGradeSections[gradeIndex].sections || [];
    
    if (currentSections.includes(section)) {
      newGradeSections[gradeIndex].sections = currentSections.filter(s => s !== section);
    } else {
      newGradeSections[gradeIndex].sections = [...currentSections, section];
    }
    
    setGradeSections(newGradeSections);
    if (selectedTeacherId) {
      onChange?.({
        teacherId: selectedTeacherId,
        gradeSections: newGradeSections,
      });
    }
  };

  const availableGrades = getAvailableGrades();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* First Row: Teacher Selection, Select Grade Label, Add Grade Button, Grade Dropdown, Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr auto auto 0.5fr 2fr', gap: '1rem', alignItems: 'flex-end' }}>
        {/* Teacher Selection */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
            Select Teacher *
          </label>
          <select
            value={selectedTeacherId}
            onChange={(e) => handleTeacherChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              border: '2px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.value} value={teacher.value}>
                {teacher.label}
              </option>
            ))}
          </select>
        </div>

        {/* Select Grade Label */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingBottom: '0.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            Select Grade *
          </label>
        </div>

        {/* Add Grade Button */}
        <button
          type="button"
          onClick={handleAddGrade}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            height: 'fit-content',
          }}
        >
          <Plus size={16} />
          Add Grade
        </button>

        {/* Grade Dropdown - Only show if there are grade sections */}
        {selectedTeacherId && gradeSections.length > 0 && gradeSections[0] && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
              Grade
            </label>
            <select
              value={gradeSections[0].grade}
              onChange={(e) => handleGradeChange(0, e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              <option value="">Select Grade</option>
              {availableGrades.map((grade) => (
                <option key={grade.value} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sections - Only show if grade is selected and sections are available */}
        {selectedTeacherId && gradeSections.length > 0 && gradeSections[0]?.grade && (() => {
          const availableSections = getSectionsForGrade(gradeSections[0].grade);
          return availableSections.length > 0 ? (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                Sections
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {availableSections.map((section) => {
                  const isChecked = gradeSections[0].sections.includes(section.value);
                  return (
                    <label
                      key={section.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: isChecked ? '#667eea' : '#f7fafc',
                        color: isChecked ? 'white' : '#4a5568',
                        border: `2px solid ${isChecked ? '#667eea' : '#e2e8f0'}`,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: isChecked ? 600 : 400,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSectionToggle(0, section.value)}
                        style={{ display: 'none' }}
                      />
                      {isChecked && <Check size={14} />}
                      {section.label}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null;
        })()}
      </div>

      {/* Additional Grade Sections (if more than one) */}
      {selectedTeacherId && gradeSections.length > 1 && (
        <div>
          {gradeSections.slice(1).map((gradeSection, index) => {
            const actualIndex = index + 1;
            const availableSections = gradeSection.grade 
              ? getSectionsForGrade(gradeSection.grade)
              : [];

            return (
              <div
                key={actualIndex}
                style={{
                  padding: '1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  background: 'white',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Grade Selection */}
                  <div style={{ flex: 0.5 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                      Grade
                    </label>
                    <select
                      value={gradeSection.grade}
                      onChange={(e) => handleGradeChange(actualIndex, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="">Select Grade</option>
                      {availableGrades.map((grade) => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section Checkboxes */}
                  {gradeSection.grade && availableSections.length > 0 && (
                    <div style={{ flex: 2 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                        Sections
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {availableSections.map((section) => {
                          const isChecked = gradeSection.sections.includes(section.value);
                          return (
                            <label
                              key={section.value}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                background: isChecked ? '#667eea' : '#f7fafc',
                                color: isChecked ? 'white' : '#4a5568',
                                border: `2px solid ${isChecked ? '#667eea' : '#e2e8f0'}`,
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: isChecked ? 600 : 400,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleSectionToggle(actualIndex, section.value)}
                                style={{ display: 'none' }}
                              />
                              {isChecked && <Check size={14} />}
                              {section.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveGrade(actualIndex)}
                    style={{
                      padding: '0.5rem',
                      background: '#fed7d7',
                      color: '#c53030',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove this grade"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {selectedTeacherId && gradeSections.length === 0 && (
        <div style={{ 
          padding: '1rem', 
          background: '#f7fafc', 
          borderRadius: '0.5rem',
          textAlign: 'center',
          color: '#718096',
          fontSize: '0.9rem'
        }}>
          Click "Add Grade" to assign this teacher to specific grades and sections
        </div>
      )}
    </div>
  );
};

export default TeacherGradeAssignment;

