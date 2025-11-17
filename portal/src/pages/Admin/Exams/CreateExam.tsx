import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, X, BookOpen, Users, FileText, Check } from 'lucide-react';
import { BackButton } from '../../../components/Button/iconbuttons';
import api from '../../../services/api';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { ExamSection } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';

const CreateExam = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { colors } = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    date: '',
    time: '',
    startTime: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<ExamSection[]>([
    { id: 1, name: 'Section A', description: '', marks: 0 },
  ]);
  // Teacher assignments - using inline cards similar to subject assignment with grade sections
  const [teacherAssignments, setTeacherAssignments] = useState<Array<{ teacherId: string; gradeSections: Array<{ grade: string; sections: string[] }> }>>([
    { teacherId: '', gradeSections: [] }
  ]);
  
  // Selection state - using grade sections format similar to subject assignment
  const [gradeSections, setGradeSections] = useState<Array<{ grade: string; sections: string[] }>>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<Record<string, string[]>>({});
  const [allClassesData, setAllClassesData] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<Partial<ExamSection>>({});

  // Store exam data temporarily until classes are loaded
  const [examDataToRestore, setExamDataToRestore] = useState<any>(null);

  // Helper function to normalize teacherId (handles objects, strings, numbers)
  // Backend populates teacherId as { _id: ObjectId, name: string, teacherId: string }
  // We need to extract the _id from the populated object
  const normalizeTeacherId = (teacherId: any): string | number | undefined => {
    if (!teacherId) return undefined;
    
    if (typeof teacherId === 'object') {
      // Backend populates teacherId, so it comes as { _id: ..., name: ..., teacherId: ... }
      // We need to extract the _id (MongoDB ObjectId)
      if (teacherId._id) {
        const id = teacherId._id;
        // If _id is an ObjectId object, convert to string
        if (typeof id === 'object' && id.toString && typeof id.toString === 'function') {
          return id.toString();
        }
        return String(id);
      }
      // Handle MongoDB ObjectId directly (if not populated)
      if (teacherId.toString && typeof teacherId.toString === 'function') {
        return teacherId.toString();
      }
      // Fallback: try to get id property
      if (teacherId.id) {
        const id = teacherId.id;
        return typeof id === 'object' && id.toString
          ? id.toString()
          : String(id);
      }
      // Last resort: convert to string
      return String(teacherId);
    } else if (typeof teacherId === 'number') {
      return teacherId;
    } else {
      // It's a string (ObjectId as string)
      return teacherId;
    }
  };

  // Load exam data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadExam = async () => {
        try {
          const response = await api.exams.getById(id) as any;
          const exam = response.data?.exam || response.exam;
          
          if (exam) {
            // Format date
            let formattedDate = exam.date;
            if (exam.date && typeof exam.date === 'string' && exam.date.includes('T')) {
              formattedDate = exam.date.split('T')[0];
            }
            
            // Format time
            let formattedTime = exam.time;
            if (exam.time && typeof exam.time === 'string' && exam.time.includes('T')) {
              const timeMatch = exam.time.match(/T(\d{2}):(\d{2})/);
              if (timeMatch) {
                formattedTime = `${timeMatch[1]}:${timeMatch[2]}`;
              }
            }
            
            let formattedStartTime = exam.startTime || exam.time || '';
            if (formattedStartTime && typeof formattedStartTime === 'string' && formattedStartTime.includes('T')) {
              const timeMatch = formattedStartTime.match(/T(\d{2}):(\d{2})/);
              if (timeMatch) {
                formattedStartTime = `${timeMatch[1]}:${timeMatch[2]}`;
              }
            }
            
            setFormData({
              name: exam.name || '',
              subject: exam.subject || '',
              date: formattedDate || '',
              time: formattedTime || '',
              startTime: formattedStartTime,
              duration: exam.duration || '',
              totalMarks: exam.totalMarks ? exam.totalMarks.toString() : '',
              passingMarks: exam.passingMarks ? exam.passingMarks.toString() : '',
              description: exam.description || '',
            });
            
            // Store exam data for class restoration (will be processed when uniqueClasses is ready)
            setExamDataToRestore(exam);
            
            if (exam.sections && Array.isArray(exam.sections) && exam.sections.length > 0) {
              setSections(exam.sections);
            }
            
            if (exam.gradeAssignments && Array.isArray(exam.gradeAssignments) && exam.gradeAssignments.length > 0) {
              // Convert to teacherAssignments format with grade sections
              // Group assignments by teacherId
              const teacherMap = new Map<string, Array<{ grade: string; sections: string[] }>>();
              
              exam.gradeAssignments.forEach((assignment: any) => {
                const teacherId = String(normalizeTeacherId(assignment.teacherId) || '');
                if (!teacherId) return;
                
                if (!teacherMap.has(teacherId)) {
                  teacherMap.set(teacherId, []);
                }
                
                // Parse grade and section from assignment.grade
                // Could be: "Grade 1", "1A", "Grade 1A", etc.
                let gradeKey = '';
                let section: string | null = null;
                
                // Check if it's a compact format like "1A", "2B"
                const compactMatch = assignment.grade?.match(/^(\d+)([A-Z])$/i);
                if (compactMatch) {
                  gradeKey = `Grade ${compactMatch[1]}`;
                  section = compactMatch[2].toUpperCase();
                } else {
                  // Check if it's "Grade 1A" format
                  const gradeSectionMatch = assignment.grade?.match(/Grade\s*(\d+)([A-Z])/i);
                  if (gradeSectionMatch) {
                    gradeKey = `Grade ${gradeSectionMatch[1]}`;
                    section = gradeSectionMatch[2].toUpperCase();
                  } else {
                    // Just "Grade 1" format
                    const gradeMatch = assignment.grade?.match(/Grade\s*(\d+)/i);
                    if (gradeMatch) {
                      gradeKey = `Grade ${gradeMatch[1]}`;
                      section = null;
                    } else {
                      // Fallback: try to extract any number
                      const numMatch = assignment.grade?.match(/(\d+)/);
                      if (numMatch) {
                        gradeKey = `Grade ${numMatch[1]}`;
                      }
                    }
                  }
                }
                
                if (gradeKey) {
                  const existingGradeSection = teacherMap.get(teacherId)!.find(gs => gs.grade === gradeKey);
                  if (existingGradeSection) {
                    if (section && !existingGradeSection.sections.includes(section)) {
                      existingGradeSection.sections.push(section);
                    }
                  } else {
                    teacherMap.get(teacherId)!.push({
                      grade: gradeKey,
                      sections: section ? [section] : []
                    });
                  }
                }
              });
              
              const normalizedAssignments = Array.from(teacherMap.entries()).map(([teacherId, gradeSections]) => ({
                teacherId,
                gradeSections: gradeSections.map(gs => ({ ...gs, sections: gs.sections.sort() }))
              }));
              
              setTeacherAssignments(normalizedAssignments.length > 0 ? normalizedAssignments : [{ teacherId: '', gradeSections: [] }]);
            } else {
              setTeacherAssignments([{ teacherId: '', gradeSections: [] }]);
            }
          }
        } catch (error) {
          console.error('Error loading exam:', error);
          alert('Failed to load exam data. Please try again.');
        }
      };
      loadExam();
    } else {
      setExamDataToRestore(null);
    }
  }, [id, isEditMode]);

  // Restore classes and sections when both exam data and uniqueClasses are available
  useEffect(() => {
    if (isEditMode && examDataToRestore && allClassesData.length > 0) {
      const classesData = examDataToRestore.classes || examDataToRestore.grades || [];
      
      if (Array.isArray(classesData) && classesData.length > 0) {
        // Group classes by grade and collect sections
        const gradeSectionsMap = new Map<string, string[]>();
        
        classesData.forEach((savedClass: string) => {
          // Check if it's a compact format like "1A", "2B" (grade + section)
          const compactMatch = savedClass.match(/^(\d+)([A-Z])$/i);
          if (compactMatch) {
            const gradeNum = compactMatch[1];
            const section = compactMatch[2].toUpperCase();
            const gradeKey = `Grade ${gradeNum}`;
            
            if (!gradeSectionsMap.has(gradeKey)) {
              gradeSectionsMap.set(gradeKey, []);
            }
            if (!gradeSectionsMap.get(gradeKey)!.includes(section)) {
              gradeSectionsMap.get(gradeKey)!.push(section);
            }
          } else {
            // It's a full class name like "Grade 1A" or "Grade 1"
            const gradeMatch = savedClass.match(/Grade\s*(\d+)([A-Z])?/i);
            if (gradeMatch) {
              const gradeNum = gradeMatch[1];
              const section = gradeMatch[2];
              const gradeKey = `Grade ${gradeNum}`;
              
              if (section) {
                if (!gradeSectionsMap.has(gradeKey)) {
                  gradeSectionsMap.set(gradeKey, []);
                }
                if (!gradeSectionsMap.get(gradeKey)!.includes(section.toUpperCase())) {
                  gradeSectionsMap.get(gradeKey)!.push(section.toUpperCase());
                }
              } else {
                // Just the grade, no section
                if (!gradeSectionsMap.has(gradeKey)) {
                  gradeSectionsMap.set(gradeKey, []);
                }
              }
            }
          }
        });
        
        // Convert map to gradeSections array format
        const restoredGradeSections = Array.from(gradeSectionsMap.entries()).map(([grade, sections]) => ({
          grade,
          sections: sections.sort(),
        }));
        
        setGradeSections(restoredGradeSections.length > 0 ? restoredGradeSections : []);
        updateSelectedClassesFromGradeSections(restoredGradeSections);
      } else {
        setGradeSections([]);
        setSelectedClasses([]);
        setSelectedSections({});
      }
    }
  }, [isEditMode, examDataToRestore, allClassesData]);

  // Load classes
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.classes.getAll() as any;
        if (response.data?.classes) {
          setAllClassesData(response.data.classes.filter((c: any) => c.status === 'Active'));
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };
    loadData();
  }, []);

  // Load subjects
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await api.subjects.getAll() as any;
        if (response.data?.subjects) {
          setSubjects(response.data.subjects);
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };
    loadSubjects();
  }, []);

  // Load teachers
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await api.teachers.getAll() as any;
        if (response.data?.teachers) {
          setTeachers(response.data.teachers);
        } else if (Array.isArray(response)) {
          setTeachers(response);
        } else if (response.teachers) {
          setTeachers(response.teachers);
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
    };
    loadTeachers();
  }, []);

  // Helper functions
  const getCompactGradeLabel = (className: string): string => {
    const sectionMatch = className.match(/(\d+)\s+Section\s+([A-Z])/i);
    if (sectionMatch) {
      return `${sectionMatch[1]}${sectionMatch[2].toUpperCase()}`;
    }
    
    const gradeMatch = className.match(/Grade\s+(\d+)([A-Z])/i);
    if (gradeMatch) {
      return `${gradeMatch[1]}${gradeMatch[2].toUpperCase()}`;
    }
    
    const compactMatch = className.match(/(\d+)([A-Z])/i);
    if (compactMatch) {
      return `${compactMatch[1]}${compactMatch[2].toUpperCase()}`;
    }
    
    return className;
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };


  // Section handlers
  const handleAddSection = () => {
    setCurrentSection({ name: '', description: '', marks: 0 });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = () => {
    if (currentSection.name && currentSection.marks) {
      const newSection: ExamSection = {
        id: sections.length + 1,
        name: currentSection.name,
        description: currentSection.description || '',
        marks: typeof currentSection.marks === 'number' ? currentSection.marks : parseInt(String(currentSection.marks)) || 0,
      };
      setSections([...sections, newSection]);
      setIsSectionModalOpen(false);
      setCurrentSection({});
    }
  };

  const handleRemoveSection = (sectionId: number) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  // Teacher assignment handlers - inline style like subject assignment with grade sections
  const handleTeacherChange = (index: number, teacherId: string) => {
    const newAssignments = [...teacherAssignments];
    newAssignments[index] = {
      teacherId,
      gradeSections: newAssignments[index].gradeSections.length > 0 
        ? newAssignments[index].gradeSections 
        : []
    };
    setTeacherAssignments(newAssignments);
  };

  const handleAddGradeForTeacher = (teacherIndex: number) => {
    const newAssignments = [...teacherAssignments];
    newAssignments[teacherIndex] = {
      ...newAssignments[teacherIndex],
      gradeSections: [...newAssignments[teacherIndex].gradeSections, { grade: '', sections: [] }]
    };
    setTeacherAssignments(newAssignments);
  };

  const handleRemoveGradeForTeacher = (teacherIndex: number, gradeIndex: number) => {
    const newAssignments = [...teacherAssignments];
    newAssignments[teacherIndex] = {
      ...newAssignments[teacherIndex],
      gradeSections: newAssignments[teacherIndex].gradeSections.filter((_, i) => i !== gradeIndex)
    };
    setTeacherAssignments(newAssignments);
  };

  const handleGradeChangeForTeacher = (teacherIndex: number, gradeIndex: number, grade: string) => {
    const newAssignments = [...teacherAssignments];
    newAssignments[teacherIndex].gradeSections[gradeIndex] = {
      grade,
      sections: [] // Reset sections when grade changes
    };
    setTeacherAssignments(newAssignments);
  };

  const handleSectionToggleForTeacher = (teacherIndex: number, gradeIndex: number, section: string) => {
    const newAssignments = [...teacherAssignments];
    const currentSections = newAssignments[teacherIndex].gradeSections[gradeIndex].sections || [];
    
    if (currentSections.includes(section)) {
      newAssignments[teacherIndex].gradeSections[gradeIndex].sections = currentSections.filter(s => s !== section);
    } else {
      newAssignments[teacherIndex].gradeSections[gradeIndex].sections = [...currentSections, section];
    }
    
    setTeacherAssignments(newAssignments);
  };

  const handleRemoveTeacherAssignment = (index: number) => {
    const newAssignments = teacherAssignments.filter((_, i) => i !== index);
    // Ensure at least one slot remains
    if (newAssignments.length === 0) {
      setTeacherAssignments([{ teacherId: '', gradeSections: [] }]);
    } else {
      setTeacherAssignments(newAssignments);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Exam name is required';
    }
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.date) {
      newErrors.date = 'Exam date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Exam time is required';
    }
    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    }
    if (!formData.totalMarks) {
      newErrors.totalMarks = 'Total marks is required';
    }
    if (selectedClasses.length === 0) {
      newErrors.classes = 'Please select at least one class';
    }
    if (sections.length === 0) {
      newErrors.sections = 'Please add at least one exam section';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const sectionsTotal = sections.reduce((sum, s) => sum + s.marks, 0);
    const totalMarks = parseInt(formData.totalMarks) || 0;
    if (sectionsTotal !== totalMarks) {
      if (!confirm(`Section marks total (${sectionsTotal}) doesn't match total marks (${totalMarks}). Continue anyway?`)) {
        return;
      }
    }

    // Build final classes list with selected sections
    const finalClasses: string[] = [];
    selectedClasses.forEach((classValue) => {
      const selectedSectionsForClass = selectedSections[classValue] || [];
      if (selectedSectionsForClass.length > 0) {
        selectedSectionsForClass.forEach((section) => {
          const compactLabel = getCompactGradeLabel(classValue);
          const gradeNum = compactLabel.match(/(\d+)/)?.[1] || '';
          finalClasses.push(`${gradeNum}${section}`);
        });
      } else {
        finalClasses.push(classValue);
      }
    });

    const selectedGrades = Array.from(new Set(
      selectedClasses.map((className: string) => {
        const match = className.match(/Grade\s+(\d+)/i);
        return match ? `Grade ${match[1]}` : '';
      }).filter(Boolean)
    ));

    // Convert teacherAssignments to gradeAssignments format for API
    // Each teacher can have multiple grade sections, we need to create one assignment per grade-section combination
    const normalizedGradeAssignments: Array<{ grade: string; teacherId: string | number }> = [];
    
    teacherAssignments
      .filter(assignment => assignment.teacherId && assignment.teacherId.trim() !== '')
      .forEach((assignment) => {
        const teacherId = normalizeTeacherId(assignment.teacherId);
        if (!teacherId) return;
        
        assignment.gradeSections
          .filter(gs => gs.grade && gs.grade.trim() !== '')
          .forEach((gs) => {
            if (gs.sections.length > 0) {
              // Create one assignment per section (e.g., "1A", "1B")
              gs.sections.forEach((section) => {
                const gradeNum = gs.grade.match(/\d+/)?.[0] || '';
                const classValue = `${gradeNum}${section}`;
                normalizedGradeAssignments.push({
                  grade: classValue,
                  teacherId: teacherId
                });
              });
            } else {
              // Just the grade without sections
              normalizedGradeAssignments.push({
                grade: gs.grade,
                teacherId: teacherId
              });
            }
          });
      });

    // Clean sections - remove id field (MongoDB will auto-generate _id for subdocuments)
    const cleanedSections = sections.map((section) => ({
      name: section.name,
      description: section.description || '',
      marks: section.marks || 0,
    }));

    // Find subjectId from selected subject
    const selectedSubject = subjects.find(s => s.name === formData.subject || s.code === formData.subject);
    const subjectId = selectedSubject?._id || selectedSubject?.id;

    const examData = {
      name: formData.name,
      subject: formData.subject,
      subjectId: subjectId,
      grades: selectedGrades,
      classes: finalClasses.length > 0 ? finalClasses : selectedClasses,
      date: formData.date,
      time: formData.time,
      startTime: formData.startTime || formData.time,
      duration: formData.duration,
      totalMarks: totalMarks,
      passingMarks: formData.passingMarks ? parseInt(formData.passingMarks) : undefined,
      description: formData.description || '',
      sections: cleanedSections,
      gradeAssignments: normalizedGradeAssignments,
    };

    try {
      if (isEditMode && id) {
        const updated = await api.exams.update(id, examData);
        if (updated) {
          const examName = (updated as any)?.data?.exam?.name || (updated as any)?.name || 'Exam';
          alert(`Exam "${examName}" updated successfully!`);
          navigate('/dashboard/admin/exams');
        }
      } else {
        const response = await api.exams.create({
          ...examData,
          status: 'Scheduled',
        });
        const examName = (response as any)?.data?.exam?.name || (response as any)?.name || 'Exam';
        alert(`Exam "${examName}" created successfully!`);
        navigate('/dashboard/admin/exams');
      }
    } catch (error: any) {
      console.error('Error saving exam:', error);
      const errorMessage = error?.message || error?.errorData?.message || error?.errorData?.error || 'Failed to save exam. Please try again.';
      alert(errorMessage);
    }
  };

  // Get available grades from classes
  const getAvailableGrades = (): Array<{ value: string; label: string }> => {
    if (!Array.isArray(allClassesData)) {
      return [];
    }
    
    const gradeMap = new Map<string, string>();
    allClassesData.forEach((c: any) => {
      if (c.status === 'Active' && c.name) {
        const gradeMatch = c.name.match(/^(Grade\s+\d+)/i);
        if (gradeMatch) {
          const gradeKey = gradeMatch[1];
          if (!gradeMap.has(gradeKey)) {
            gradeMap.set(gradeKey, gradeKey);
          }
        }
      }
    });
    
    return Array.from(gradeMap.values())
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      })
      .map(grade => ({ value: grade, label: grade }));
  };

  // Get sections for a grade (returns array of section objects)
  const getSectionsForGrade = (grade: string): Array<{ value: string; label: string }> => {
    if (!Array.isArray(allClassesData) || !grade) {
      return [];
    }
    const normalizedGrade = grade.startsWith('Grade') ? grade : `Grade ${grade}`;
    
    const filteredClasses = allClassesData.filter((c: any) => {
      if (c.status !== 'Active') return false;
      const gradeMatch = c.name?.match(/^(Grade\s+\d+)/i);
      return gradeMatch && gradeMatch[1] === normalizedGrade;
    });
    
    const sections = [...new Set(filteredClasses.map((c: any) => c.section).filter(Boolean))];
    
    return sections.map((section: string) => ({
      value: section,
      label: `Section ${section}`,
    }));
  };

  // Handle grade section changes
  const handleGradeSectionChange = (index: number, grade: string) => {
    const newGradeSections = [...gradeSections];
    newGradeSections[index] = {
      grade,
      sections: [], // Reset sections when grade changes
    };
    setGradeSections(newGradeSections);
    updateSelectedClassesFromGradeSections(newGradeSections);
  };

  const handleSectionToggleForGrade = (gradeIndex: number, section: string) => {
    const newGradeSections = [...gradeSections];
    const currentSections = newGradeSections[gradeIndex].sections || [];
    
    if (currentSections.includes(section)) {
      newGradeSections[gradeIndex].sections = currentSections.filter(s => s !== section);
    } else {
      newGradeSections[gradeIndex].sections = [...currentSections, section];
    }
    
    setGradeSections(newGradeSections);
    updateSelectedClassesFromGradeSections(newGradeSections);
  };

  const handleAddGrade = () => {
    setGradeSections([...gradeSections, { grade: '', sections: [] }]);
  };

  const handleRemoveGrade = (index: number) => {
    const newGradeSections = gradeSections.filter((_, i) => i !== index);
    setGradeSections(newGradeSections);
    updateSelectedClassesFromGradeSections(newGradeSections);
  };

  // Update selectedClasses and selectedSections from gradeSections
  const updateSelectedClassesFromGradeSections = (gs: Array<{ grade: string; sections: string[] }>) => {
    const newSelectedClasses: string[] = [];
    const newSelectedSections: Record<string, string[]> = {};
    
    gs.forEach((gsItem) => {
      if (gsItem.grade) {
        if (gsItem.sections.length > 0) {
          // Add grade with sections (e.g., "1A", "1B")
          gsItem.sections.forEach((section) => {
            const gradeNum = gsItem.grade.match(/\d+/)?.[0] || '';
            const classValue = `${gradeNum}${section}`;
            if (!newSelectedClasses.includes(classValue)) {
              newSelectedClasses.push(classValue);
            }
          });
        } else {
          // Just add the grade
          if (!newSelectedClasses.includes(gsItem.grade)) {
            newSelectedClasses.push(gsItem.grade);
          }
        }
      }
    });
    
    setSelectedClasses(newSelectedClasses);
    setSelectedSections(newSelectedSections);
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    background: colors.background,
    minHeight: '100vh',
  };

  const cardStyle: React.CSSProperties = {
    background: colors.surface,
    borderRadius: '0.75rem',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${colors.border}`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: colors.text,
    margin: '0 0 2rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const formRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  };

  const halfWidthStyle: React.CSSProperties = {
    flex: '0 0 calc(50% - 0.5rem)',
    minWidth: '200px',
  };

  const thirdWidthStyle: React.CSSProperties = {
    flex: '0 0 calc(33.333% - 0.67rem)',
    minWidth: '150px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: colors.text,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${errors.name || errors.subject || errors.date ? '#e53e3e' : colors.border}`,
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    backgroundColor: colors.surface,
    color: colors.text,
    transition: 'border-color 0.2s',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
  };

  const errorStyle: React.CSSProperties = {
    color: '#e53e3e',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <BackButton 
          size="md" 
          onClick={() => navigate('/dashboard/admin/exams')}
          title="Back to Exams"
        />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Main Form Card */}
        <div style={cardStyle}>
          <h1 style={titleStyle}>
            <BookOpen size={28} color={colors.button} />
            {isEditMode ? 'Edit Exam' : 'Create New Exam'}
          </h1>

          {/* Row 1: Exam Name and Subject */}
          <div style={formRowStyle}>
            <div style={halfWidthStyle}>
              <label style={labelStyle}>
                Exam Name <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Mid-Term Exam, Final Exam"
                style={inputStyle}
                required
              />
              {errors.name && <div style={errorStyle}>{errors.name}</div>}
            </div>
            <div style={halfWidthStyle}>
              <label style={labelStyle}>
                Subject <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((s, index) => (
                  <option 
                    key={s.id || s._id || `subject-${index}`} 
                    value={s.name}
                  >
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              {errors.subject && <div style={errorStyle}>{errors.subject}</div>}
            </div>
          </div>

          {/* Row 2: Assign to Classes - Similar to Subject Assignment Design */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={labelStyle}>
              Assign to Classes <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* First Row: Select Grade Label, Add Grade Button, Grade Dropdown, Sections */}
              {gradeSections.length > 0 && gradeSections[0] && (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 0.5fr 2fr', gap: '1rem', alignItems: 'flex-end' }}>
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

                  {/* Grade Dropdown */}
                  <div>
                    <select
                      value={gradeSections[0].grade}
                      onChange={(e) => handleGradeSectionChange(0, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="">Select Grade</option>
                      {getAvailableGrades().map((grade, gradeIndex) => (
                        <option key={`grade-${grade.value}-${gradeIndex}`} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sections - Only show if grade is selected and sections are available */}
                  {gradeSections[0]?.grade && (() => {
                    const availableSections = getSectionsForGrade(gradeSections[0].grade);
                    return availableSections.length > 0 ? (
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                          Sections
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {availableSections.map((section, sectionIndex) => {
                            const isChecked = gradeSections[0].sections.includes(section.value);
                            return (
                              <label
                                key={`section-${section.value}-${sectionIndex}`}
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
                                  onChange={() => handleSectionToggleForGrade(0, section.value)}
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
              )}

              {/* Additional Grade Sections (if more than one) */}
              {gradeSections.length > 1 && (
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
                              onChange={(e) => handleGradeSectionChange(actualIndex, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '0.5rem',
                                fontSize: '0.9rem',
                              }}
                            >
                              <option value="">Select Grade</option>
                              {getAvailableGrades().map((grade) => (
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
                                {availableSections.map((section, sectionIndex) => {
                                  const isChecked = gradeSection.sections.includes(section.value);
                                  return (
                                    <label
                                      key={`section-${actualIndex}-${section.value}-${sectionIndex}`}
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
                                        onChange={() => handleSectionToggleForGrade(actualIndex, section.value)}
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

              {/* Empty state or initial Add Grade button */}
              {gradeSections.length === 0 && (
                <div>
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
                    }}
                  >
                    <Plus size={16} />
                    Add Grade
                  </button>
                </div>
              )}
            </div>

            {errors.classes && <div style={errorStyle}>{errors.classes}</div>}
            {selectedClasses.length === 0 && !errors.classes && (
              <div style={{ ...errorStyle, color: colors.textSecondary, marginTop: '0.5rem' }}>
                Please select at least one grade
              </div>
            )}
          </div>

          {/* Row 3: Date, Time, Duration, Marks */}
          <div style={formRowStyle}>
            <div style={thirdWidthStyle}>
              <label style={labelStyle}>
                Exam Date <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                style={{ ...inputStyle, width: '100%', maxWidth: '180px' }}
                required
              />
              {errors.date && <div style={errorStyle}>{errors.date}</div>}
            </div>
            <div style={thirdWidthStyle}>
              <label style={labelStyle}>
                Start Time <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                style={{ ...inputStyle, width: '100%', maxWidth: '180px' }}
              />
            </div>
            <div style={thirdWidthStyle}>
              <label style={labelStyle}>
                Exam Time <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                style={{ ...inputStyle, width: '100%', maxWidth: '180px' }}
                required
              />
              {errors.time && <div style={errorStyle}>{errors.time}</div>}
            </div>
            <div style={thirdWidthStyle}>
              <label style={labelStyle}>
                Duration <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="2h 30m"
                style={{ ...inputStyle, width: '100%', maxWidth: '200px' }}
                required
              />
              {errors.duration && <div style={errorStyle}>{errors.duration}</div>}
            </div>
            <div style={thirdWidthStyle}>
              <label style={labelStyle}>
                Total Marks <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                placeholder="100"
                min={0}
                max={9999}
                style={{ ...inputStyle, width: '100%', maxWidth: '180px' }}
                required
              />
              {errors.totalMarks && <div style={errorStyle}>{errors.totalMarks}</div>}
            </div>
            <div style={thirdWidthStyle}>
              <label style={labelStyle}>
                Passing Marks
              </label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={(e) => handleInputChange('passingMarks', e.target.value)}
                placeholder="e.g., 40"
                min={0}
                max={9999}
                style={{ ...inputStyle, width: '100%', maxWidth: '180px' }}
              />
            </div>
          </div>

          {/* Row 4: Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter exam description or instructions"
              rows={4}
              style={textareaStyle}
            />
          </div>

          {/* Teacher Assignments - Similar to Subject Assignment Design */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${colors.border}` }}>
            <label style={{ ...labelStyle, margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} />
              Teacher Assignments (Grading Teachers)
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {teacherAssignments.map((assignment, index) => (
                <div 
                  key={index} 
                  style={{ 
                    marginBottom: '0',
                    padding: '1.5rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', margin: 0 }}>
                      {index === 0 ? 'First Teacher' : index === 1 ? 'Second Teacher' : index === 2 ? 'Third Teacher' : `Teacher ${index + 1}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeacherAssignment(index)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Remove Teacher
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Teacher Selection */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                        Select Teacher *
                      </label>
                      <select
                        value={assignment.teacherId}
                        onChange={(e) => handleTeacherChange(index, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.625rem 0.75rem',
                          border: '2px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          fontSize: '0.9rem',
                        }}
                      >
                        <option value="">Select a teacher</option>
                        {teachers
                          .filter(t => {
                            // Filter out teachers already assigned to other slots
                            const assignedTeacherIds = teacherAssignments
                              .map(a => a.teacherId)
                              .filter((id, idx) => idx !== index && id);
                            const tId = String(t._id || t.id || '');
                            return !assignedTeacherIds.includes(tId);
                          })
                          .map((teacher: any) => {
                            const teacherId = teacher._id || teacher.id || '';
                            const teacherName = teacher.name || 'Unknown';
                            const teacherSubject = teacher.subject || 'N/A';
                            return (
                              <option key={teacherId} value={teacherId}>
                                {teacherName} ({teacherSubject})
                              </option>
                            );
                          })}
                      </select>
                    </div>

                    {/* Grade Sections - Similar to TeacherGradeAssignment component */}
                    {assignment.teacherId && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* First Grade Row */}
                        {assignment.gradeSections.length > 0 && assignment.gradeSections[0] && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 0.5fr 2fr', gap: '1rem', alignItems: 'flex-end' }}>
                            {/* Select Grade Label */}
                            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingBottom: '0.5rem' }}>
                              <label style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                Select Grade *
                              </label>
                            </div>

                            {/* Add Grade Button */}
                            <button
                              type="button"
                              onClick={() => handleAddGradeForTeacher(index)}
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

                            {/* Grade Dropdown */}
                            <div>
                              <select
                                value={assignment.gradeSections[0].grade}
                                onChange={(e) => handleGradeChangeForTeacher(index, 0, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.625rem 0.75rem',
                                  border: '2px solid #e2e8f0',
                                  borderRadius: '0.5rem',
                                  fontSize: '0.9rem',
                                }}
                              >
                                <option value="">Select Grade</option>
                                {getAvailableGrades().map((grade) => (
                                  <option key={grade.value} value={grade.value}>
                                    {grade.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Sections - Only show if grade is selected and sections are available */}
                            {assignment.gradeSections[0]?.grade && (() => {
                              const availableSections = getSectionsForGrade(assignment.gradeSections[0].grade);
                              return availableSections.length > 0 ? (
                                <div>
                                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                                    Sections
                                  </label>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {availableSections.map((section, sectionIndex) => {
                                      const isChecked = assignment.gradeSections[0].sections.includes(section.value);
                                      return (
                                        <label
                                          key={`teacher-${index}-section-${section.value}-${sectionIndex}`}
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
                                            onChange={() => handleSectionToggleForTeacher(index, 0, section.value)}
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
                        )}

                        {/* Additional Grade Sections (if more than one) */}
                        {assignment.gradeSections.length > 1 && (
                          <div>
                            {assignment.gradeSections.slice(1).map((gradeSection, gradeIndex) => {
                              const actualGradeIndex = gradeIndex + 1;
                              const availableSections = gradeSection.grade 
                                ? getSectionsForGrade(gradeSection.grade)
                                : [];

                              return (
                                <div
                                  key={actualGradeIndex}
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
                                        onChange={(e) => handleGradeChangeForTeacher(index, actualGradeIndex, e.target.value)}
                                        style={{
                                          width: '100%',
                                          padding: '0.5rem',
                                          border: '2px solid #e2e8f0',
                                          borderRadius: '0.5rem',
                                          fontSize: '0.9rem',
                                        }}
                                      >
                                        <option value="">Select Grade</option>
                                        {getAvailableGrades().map((grade) => (
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
                                                {availableSections.map((section, sectionIndex) => {
                                                  const isChecked = gradeSection.sections.includes(section.value);
                                                  return (
                                                    <label
                                                      key={`teacher-${index}-grade-${actualGradeIndex}-section-${section.value}-${sectionIndex}`}
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
                                                  onChange={() => handleSectionToggleForTeacher(index, actualGradeIndex, section.value)}
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
                                      onClick={() => handleRemoveGradeForTeacher(index, actualGradeIndex)}
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

                        {/* Empty state or initial Add Grade button */}
                        {assignment.gradeSections.length === 0 && (
                          <div>
                            <button
                              type="button"
                              onClick={() => handleAddGradeForTeacher(index)}
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
                              }}
                            >
                              <Plus size={16} />
                              Add Grade
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => {
                  setTeacherAssignments([...teacherAssignments, { teacherId: '', gradeSections: [] }]);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: 'auto',
                }}
              >
                <span>+</span>
                Add Another Teacher
              </button>
            </div>
          </div>

          {/* Exam Sections */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ ...labelStyle, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} />
                Exam Sections
              </label>
              <Button variant="primary" size="sm" type="button" onClick={handleAddSection}>
                <Plus size={16} />
                Add Section
              </Button>
            </div>

            {errors.sections && <div style={errorStyle}>{errors.sections}</div>}

            {sections.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sections.map((section, index) => (
                  <div key={section.id || `section-${index}`} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#f7f7f7',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`
                  }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{section.name}</strong>
                      {section.description && (
                        <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '0.25rem' }}>
                          {section.description}
                        </div>
                      )}
                      <div style={{ fontSize: '0.8rem', color: colors.textSecondary, marginTop: '0.25rem' }}>
                        Marks: <strong>{section.marks}</strong>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => handleRemoveSection(section.id)}
                      style={{ color: '#e53e3e', borderColor: '#e53e3e' }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#e6f3ff', borderRadius: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>
                    Total Section Marks: {sections.reduce((sum, s) => sum + s.marks, 0)}
                  </strong>
                </div>
              </div>
            ) : (
              <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
                No sections added yet. Click "Add Section" to add one.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => navigate('/dashboard/admin/exams')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <Save size={18} />
              {isEditMode ? 'Update Exam' : 'Create Exam'}
            </Button>
          </div>
        </div>
      </form>

      {/* Add Section Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title="Add Exam Section"
        size="md"
      >
        <div style={{ padding: '1rem 0' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Section Name *
            </label>
            <input
              type="text"
              value={currentSection.name || ''}
              onChange={(e) => setCurrentSection({ ...currentSection, name: e.target.value })}
              placeholder="e.g., Section A: Multiple Choice"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Description
            </label>
            <textarea
              value={currentSection.description || ''}
              onChange={(e) => setCurrentSection({ ...currentSection, description: e.target.value })}
              placeholder="Section description or instructions"
              rows={3}
              style={textareaStyle}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
              Marks *
            </label>
            <input
              type="number"
              value={currentSection.marks || ''}
              onChange={(e) => setCurrentSection({ ...currentSection, marks: parseInt(e.target.value) || 0 })}
              placeholder="20"
              min={0}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" size="md" type="button" onClick={() => setIsSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="button" onClick={handleSaveSection}>
              <Save size={16} />
              Add Section
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CreateExam;
