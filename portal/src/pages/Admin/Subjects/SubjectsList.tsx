import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Clock, Calendar, Copy } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { ViewButton, EditButton, DeleteButton, AddButton } from '../../../components/Button/iconbuttons';
import { Table, TableColumn } from '../../../components/Table';
import { Modal } from '../../../components/Modal';
import WarningModal from '../../../components/Modal/WarningModal';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './Subjects.css';

const SubjectsList = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleEntries, setScheduleEntries] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [subjectTeachers, setSubjectTeachers] = useState<Array<{ value: string; label: string }>>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allSubjectsForConflictCheck, setAllSubjectsForConflictCheck] = useState<any[]>([]);
  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'warning' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
  });

  // Helper function to show warning modal
  const showWarning = (title: string, message: string, type: 'warning' | 'error' | 'info' = 'warning') => {
    setWarningModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  useEffect(() => {
    // Load subjects, classes, and rooms from API
    const loadData = async () => {
      try {
        const [subjectsResponse, classesResponse, roomsResponse] = await Promise.all([
          api.subjects.getAll() as any,
          api.classes.getAll() as any,
          api.masterData.getAll({ type: 'room', status: 'Active' }) as any,
        ]);
        
        if (subjectsResponse.data?.subjects) {
          setSubjects(subjectsResponse.data.subjects);
        } else {
          setSubjects([]);
        }
        
        if (classesResponse.data?.classes) {
          setAllClasses(classesResponse.data.classes);
        } else {
          setAllClasses([]);
        }

        if (roomsResponse.data?.masterData) {
          setRooms(roomsResponse.data.masterData);
        } else {
          setRooms([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setSubjects([]);
        setAllClasses([]);
        setRooms([]);
      }
    };
    
    loadData();

    // Refresh interval (since we can't use storage events for API)
    const interval = setInterval(() => {
      loadData();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getStatusVariant = (status: string | undefined | null) => {
    if (!status) return 'active'; // Default to active if status is not set
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'active';
    if (statusLower === 'inactive') return 'rejected';
    return 'active'; // Default to active for any other value
  };

  const handleDeleteSubject = async (subjectId: string | number) => {
    const subject = subjects.find(s => (s._id || s.id || s.mongoId) === subjectId);
    if (subject && confirm(`Are you sure you want to delete "${subject.name}"?`)) {
      try {
        const idToDelete = subject._id || subject.id || subject.mongoId || subjectId;
        await api.subjects.delete(idToDelete);
          // Reload subjects
        const response = await api.subjects.getAll() as any;
        if (response.data?.subjects) {
          setSubjects(response.data.subjects);
          }
          showWarning('Success', 'Subject deleted successfully!', 'info');
      } catch (error) {
        console.error('Error deleting subject:', error);
        showWarning('Error', 'Failed to delete subject. Please try again.', 'error');
      }
    }
  };

  const handleManageSchedule = async (subject: any) => {
    console.log('[FRONTEND] handleManageSchedule - START', {
      subjectId: subject._id || subject.id,
      subjectName: subject.name
    });
    
    // Reload the subject data from API to get the latest schedule with slot information
    // Also load all subjects for conflict checking
    let subjectToUse = subject;
    try {
      console.log('[FRONTEND] Fetching fresh subject from API...');
      const [freshSubjectResponse, allSubjectsResponse] = await Promise.all([
        api.subjects.getById(subject._id || subject.id) as any,
        api.subjects.getAll() as any
      ]);
      // Extract subject from response structure { success: true, data: { subject } }
      subjectToUse = freshSubjectResponse.data?.subject || freshSubjectResponse.subject || freshSubjectResponse;
      
      // Store all subjects for conflict checking (exclude current subject)
      const allSubjects = allSubjectsResponse.data?.subjects || allSubjectsResponse.subjects || [];
      const currentSubjectId = subjectToUse._id || subjectToUse.id;
      const otherSubjects = allSubjects.filter((s: any) => {
        const sId = s._id || s.id;
        return sId !== currentSubjectId;
      });
      setAllSubjectsForConflictCheck(otherSubjects);
      
      console.log('[FRONTEND] Fresh subject received:', {
        subjectId: subjectToUse._id || subjectToUse.id,
        scheduleCount: subjectToUse.schedule?.length || 0,
        scheduleEntries: (subjectToUse.schedule || []).map((e: any) => ({
          day: e.day,
          room: e.room,
          slot: e.slot,
          slotType: typeof e.slot,
          grade: e.grade,
          section: e.section,
          startTime: e.startTime,
          endTime: e.endTime
        }))
      });
    } catch (error) {
      console.error('[FRONTEND] Error loading fresh subject data:', error);
      // Continue with existing subject data if API call fails
    }
    
    setSelectedSubject(subjectToUse);
    
    // Load teachers assigned to this subject
    const teachers: Array<{ value: string; label: string }> = [];
    
    // Check if subject has teacherAssignments (new format)
    if (subjectToUse.teacherAssignments && Array.isArray(subjectToUse.teacherAssignments) && subjectToUse.teacherAssignments.length > 0) {
      subjectToUse.teacherAssignments.forEach((assignment: any) => {
        if (assignment.teacherId) {
          const teacher = typeof assignment.teacherId === 'object' 
            ? assignment.teacherId 
            : null;
          
          if (teacher) {
            const teacherId = teacher._id || teacher.id;
            const teacherName = teacher.name || 'Unknown';
            const teacherSubject = teacher.subject || 'N/A';
            teachers.push({
              value: String(teacherId),
              label: `${teacherName} (${teacherSubject})`,
            });
          }
        }
      });
    } else if (subjectToUse.teacherId) {
      // Fallback to old format
      const teacher = typeof subjectToUse.teacherId === 'object'
        ? subjectToUse.teacherId 
        : null;
      
      if (teacher) {
        const teacherId = teacher._id || teacher.id;
        const teacherName = teacher.name || 'Unknown';
        const teacherSubject = teacher.subject || 'N/A';
        teachers.push({
          value: String(teacherId),
          label: `${teacherName} (${teacherSubject})`,
        });
      }
    }
    
    // If no teachers found from subject assignments, load all teachers as fallback
    if (teachers.length === 0) {
      try {
        const allTeachersResponse = await api.teachers.getAll() as any;
        const allTeachers = allTeachersResponse.data?.teachers || allTeachersResponse.teachers || [];
        allTeachers.forEach((teacher: any) => {
          const teacherId = teacher._id || teacher.id;
          const teacherName = teacher.name || 'Unknown';
          const teacherSubject = teacher.subject || 'N/A';
          teachers.push({
            value: String(teacherId),
            label: `${teacherName} (${teacherSubject})`,
          });
        });
      } catch (error) {
        console.error('Error loading all teachers:', error);
      }
    }
    
    setSubjectTeachers(teachers);
    
    // Group schedule entries by time, room, teacher, grades, and section
    // Combine days that have the same other properties into a single time slot entry
    const scheduleMap = new Map<string, any>();
    
    (subjectToUse.schedule || []).forEach((entry: any) => {
      // Create a key based on all properties except day
      const grade = entry.grade || (Array.isArray(entry.grades) && entry.grades.length > 0 ? entry.grades[0] : '');
      const teacherId = entry.teacherId 
        ? (typeof entry.teacherId === 'object' ? entry.teacherId._id || entry.teacherId.id : entry.teacherId)
        : '';
      
      // Include slot in the key to prevent merging entries with different slots
      // Normalize slot value - handle both string and number formats from backend
      let slotValue = '';
      if (entry.slot !== undefined && entry.slot !== null && entry.slot !== '') {
        slotValue = String(entry.slot).trim();
      }
      const key = `${entry.startTime || ''}_${entry.endTime || ''}_${entry.room || ''}_${teacherId}_${grade}_${entry.section || ''}_${slotValue}`;
      
      if (scheduleMap.has(key)) {
        // Add day to existing entry
        const existing = scheduleMap.get(key);
        const day = entry.day || entry.days?.[0];
        if (day && !existing.days.includes(day)) {
          existing.days.push(day);
        }
        // Always preserve slot from entry (it should be the same since key includes slot)
        if (entry.slot !== undefined && entry.slot !== null && entry.slot !== '') {
          existing.slot = String(entry.slot).trim();
        }
      } else {
        // Create new entry
        const day = entry.day || entry.days?.[0] || 'Monday';
        // Normalize slot value - convert to string and ensure it's clean
        let normalizedSlot = '';
        if (entry.slot !== undefined && entry.slot !== null && entry.slot !== '') {
          // Handle both number and string formats
          const slotNum = typeof entry.slot === 'number' ? entry.slot : parseInt(String(entry.slot), 10);
          if (!isNaN(slotNum)) {
            normalizedSlot = String(slotNum);
          } else {
            normalizedSlot = String(entry.slot).trim();
          }
        }
        
        scheduleMap.set(key, {
          startTime: entry.startTime || '09:00',
          endTime: entry.endTime || '10:00',
          room: entry.room || '',
          slot: normalizedSlot,
          grade: grade,
          section: entry.section || (Array.isArray(entry.sections) && entry.sections.length > 0 ? entry.sections[0] : ''),
          teacherId: teacherId,
          days: [day],
        });
      }
    });
    
    // Convert map values to array and sort days
    const convertedSchedule = Array.from(scheduleMap.values()).map((entry) => {
      // Normalize slot value - ensure it's a clean string matching slot index format
      let normalizedSlot = '';
      if (entry.slot !== undefined && entry.slot !== null && entry.slot !== '') {
        // Convert to number first to handle "0", 0, "1", 1, etc. consistently
        const slotNum = typeof entry.slot === 'number' ? entry.slot : parseInt(String(entry.slot).trim(), 10);
        if (!isNaN(slotNum) && slotNum >= 0) {
          normalizedSlot = String(slotNum);
        } else {
          normalizedSlot = String(entry.slot).trim();
        }
      }
      
      return {
        ...entry,
        slot: normalizedSlot,
        days: entry.days.sort((a: string, b: string) => {
          const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          return dayOrder.indexOf(a) - dayOrder.indexOf(b);
        }),
      };
    });
    
    console.log('[FRONTEND] Converted schedule entries for UI:', convertedSchedule.map(e => ({
      room: e.room,
      slot: e.slot,
      slotType: typeof e.slot,
      grade: e.grade,
      section: e.section,
      days: e.days,
      startTime: e.startTime,
      endTime: e.endTime
    })));
    
    setScheduleEntries(convertedSchedule);
    setIsScheduleModalOpen(true);
    console.log('[FRONTEND] handleManageSchedule - END - Modal opened');
  };

  const handleAddScheduleEntry = () => {
    setScheduleEntries([...scheduleEntries, { days: ['Monday'], startTime: '09:00', endTime: '10:00', room: '', slot: '', grade: '', section: '', teacherId: '' }]);
  };

  const handleCopyScheduleEntry = (index: number) => {
    const entryToCopy = scheduleEntries[index];
    const grade = entryToCopy.grade || (Array.isArray(entryToCopy.grades) && entryToCopy.grades.length > 0 ? entryToCopy.grades[0] : '');
    const newEntry = {
      days: Array.isArray(entryToCopy.days) ? [...entryToCopy.days] : (entryToCopy.day ? [entryToCopy.day] : ['Monday']),
      startTime: entryToCopy.startTime || '09:00',
      endTime: entryToCopy.endTime || '10:00',
      room: entryToCopy.room || '',
      slot: entryToCopy.slot !== undefined ? entryToCopy.slot : '',
      grade: grade,
      section: entryToCopy.section || (Array.isArray(entryToCopy.sections) && entryToCopy.sections.length > 0 ? entryToCopy.sections[0] : ''),
      teacherId: entryToCopy.teacherId || '',
    };
    setScheduleEntries([...scheduleEntries, newEntry]);
  };

  const handleRemoveScheduleEntry = (index: number) => {
    setScheduleEntries(scheduleEntries.filter((_, i) => i !== index));
  };

  const handleUpdateScheduleEntry = (index: number, field: string, value: any) => {
    const updated = [...scheduleEntries];
    updated[index] = { ...updated[index], [field]: value };
    
    // If slot is selected, auto-fill startTime and endTime from slot data
    if (field === 'slot' && value !== '' && updated[index].room) {
      const selectedRoom = rooms.find((r: any) => (r.code === updated[index].room || r._id === updated[index].room || r.id === updated[index].room));
      if (selectedRoom && selectedRoom.data?.timeSlots && Array.isArray(selectedRoom.data.timeSlots)) {
        const slotIndex = parseInt(value);
        const selectedSlot = selectedRoom.data.timeSlots[slotIndex];
        if (selectedSlot && selectedSlot.startTime && selectedSlot.endTime) {
          updated[index].startTime = selectedSlot.startTime;
          updated[index].endTime = selectedSlot.endTime;
        }
      }
    }
    
    // If room is selected but no slot, use first time slot or legacy startTime/endTime
    if (field === 'room' && value) {
      const selectedRoom = rooms.find((r: any) => (r.code === value || r._id === value || r.id === value));
      if (selectedRoom && selectedRoom.data) {
        // Check if room has timeSlots array
        if (selectedRoom.data.timeSlots && Array.isArray(selectedRoom.data.timeSlots) && selectedRoom.data.timeSlots.length > 0) {
          const firstSlot = selectedRoom.data.timeSlots.find((slot: any) => slot.startTime && slot.endTime);
          if (firstSlot) {
            updated[index].startTime = firstSlot.startTime;
            updated[index].endTime = firstSlot.endTime;
            updated[index].slot = '0'; // Select first slot by default
          }
        } else if (selectedRoom.data.startTime) {
          // Legacy: single time slot
          updated[index].startTime = selectedRoom.data.startTime;
          updated[index].endTime = selectedRoom.data.endTime;
        }
      }
    }
    
    setScheduleEntries(updated);
  };

  const handleToggleDay = (index: number, day: string) => {
    const updated = [...scheduleEntries];
    const currentDays = Array.isArray(updated[index].days) ? updated[index].days : (updated[index].day ? [updated[index].day] : []);
    if (currentDays.includes(day)) {
      updated[index].days = currentDays.filter((d: string) => d !== day);
    } else {
      updated[index].days = [...currentDays, day];
    }
    // Remove old day field if it exists
    if (updated[index].day) {
      delete updated[index].day;
    }
    setScheduleEntries(updated);
  };

  const handleSelectGrade = (index: number, grade: string) => {
    const updated = [...scheduleEntries];
    updated[index].grade = grade;
    // Clear section when grade changes
    updated[index].section = '';
    // Remove old grades array if it exists
    if (updated[index].grades) {
      delete updated[index].grades;
    }
    setScheduleEntries(updated);
  };

  const handleSelectSection = (index: number, section: string) => {
    const updated = [...scheduleEntries];
    updated[index].section = section;
    setScheduleEntries(updated);
  };

  const handleSaveSchedule = async () => {
    if (!selectedSubject) return;

    console.log('[FRONTEND] handleSaveSchedule - START', {
      subjectId: selectedSubject._id || selectedSubject.id,
      scheduleEntriesCount: scheduleEntries.length,
      scheduleEntries: scheduleEntries.map((e, idx) => ({
        index: idx,
        room: e.room,
        slot: e.slot,
        slotType: typeof e.slot,
        grade: e.grade,
        section: e.section,
        days: e.days,
        startTime: e.startTime,
        endTime: e.endTime
      }))
    });

    // Validate that each entry has at least one day selected
    for (let i = 0; i < scheduleEntries.length; i++) {
      const entry = scheduleEntries[i];
      const days = Array.isArray(entry.days) ? entry.days : (entry.day ? [entry.day] : []);
      if (days.length === 0) {
        showWarning('Validation Error', `Time Slot ${i + 1} must have at least one day selected.`, 'error');
        return;
      }
    }

    try {
      const subjectId = selectedSubject._id || selectedSubject.id;
      
      // Validate all entries first
      for (let i = 0; i < scheduleEntries.length; i++) {
        const entry = scheduleEntries[i];
        const grade = entry.grade || (Array.isArray(entry.grades) && entry.grades.length > 0 ? entry.grades[0] : '');
        
        if (!entry.room) {
          showWarning('Validation Error', `Time Slot ${i + 1} must have a room selected.`, 'error');
          return;
        }
        
        if (!entry.startTime) {
          showWarning('Validation Error', `Time Slot ${i + 1} must have a start time.`, 'error');
          return;
        }
        
        if (!entry.endTime) {
          showWarning('Validation Error', `Time Slot ${i + 1} must have an end time.`, 'error');
          return;
        }
        
        if (!grade) {
          showWarning('Validation Error', `Time Slot ${i + 1} must have a grade selected.`, 'error');
          return;
        }
        
        if (!entry.section) {
          showWarning('Validation Error', `Time Slot ${i + 1} must have a section selected.`, 'error');
          return;
        }
        
        // Check for conflicts with other subjects (room conflicts and teacher conflicts)
        const days = Array.isArray(entry.days) ? entry.days : (entry.day ? [entry.day] : []);
        const slotValue = entry.slot !== undefined && entry.slot !== null && entry.slot !== '' 
          ? String(entry.slot).trim() 
          : '';
        
        // Get current entry's teacher ID
        const currentTeacherId = entry.teacherId 
          ? (typeof entry.teacherId === 'object' ? entry.teacherId._id || entry.teacherId.id : entry.teacherId)
          : null;
        
        if (slotValue) {
          for (const day of days) {
            // First check for room conflicts
            const roomConflictSubject = allSubjectsForConflictCheck.find((otherSubject: any) => {
              const otherSchedule = otherSubject.schedule || [];
              return otherSchedule.some((scheduleEntry: any) => {
                const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                  ? String(scheduleEntry.slot).trim()
                  : '';
                return scheduleEntry.room === entry.room &&
                       otherSlot === slotValue &&
                       scheduleEntry.day === day;
              });
            });
            
            if (roomConflictSubject) {
              const subjectCode = roomConflictSubject.code || roomConflictSubject.name || 'Unknown Subject';
              showWarning(
                'Conflict Detected',
                `Time Slot ${i + 1} conflicts with "${subjectCode}" schedule:\n\n` +
                `• Room: ${entry.room}\n` +
                `• Slot: ${slotValue}\n` +
                `• Day: ${day}\n\n` +
                `Please select a different room, slot, or day to avoid conflicts.`,
                'warning'
              );
              return;
            }
            
            // Then check for teacher conflicts (same teacher, same day, same slot, regardless of room)
            if (currentTeacherId) {
              const teacherConflictSubject = allSubjectsForConflictCheck.find((otherSubject: any) => {
                const otherSchedule = otherSubject.schedule || [];
                return otherSchedule.some((scheduleEntry: any) => {
                  const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                    ? String(scheduleEntry.slot).trim()
                    : '';
                  const otherTeacherId = scheduleEntry.teacherId
                    ? (typeof scheduleEntry.teacherId === 'object' ? scheduleEntry.teacherId._id || scheduleEntry.teacherId.id : scheduleEntry.teacherId)
                    : null;
                  
                  // Check if same teacher, same day, same slot
                  return otherTeacherId && 
                         String(otherTeacherId) === String(currentTeacherId) &&
                         otherSlot === slotValue &&
                         scheduleEntry.day === day;
                });
              });
              
              if (teacherConflictSubject) {
                const subjectCode = teacherConflictSubject.code || teacherConflictSubject.name || 'Unknown Subject';
                const teacherName = entry.teacherId ? (typeof entry.teacherId === 'object' ? entry.teacherId.name : 'Selected Teacher') : 'N/A';
                showWarning(
                  'Teacher Conflict Detected',
                  `Time Slot ${i + 1} conflicts with teacher's existing schedule for "${subjectCode}":\n\n` +
                  `• Teacher: ${teacherName}\n` +
                  `• Slot: ${slotValue}\n` +
                  `• Day: ${day}\n\n` +
                  `A teacher cannot be scheduled for multiple subjects at the same time slot and day.\n\n` +
                  `Please select a different slot, day, or teacher to avoid conflicts.`,
                  'warning'
                );
                return;
              }
            }
          }
        }
      }
      
      // Convert schedule entries to format expected by backend
      // Create separate entries for each selected day
      const formattedSchedule: any[] = [];
      scheduleEntries.forEach((entry, entryIdx) => {
        const days = Array.isArray(entry.days) ? entry.days : (entry.day ? [entry.day] : ['Monday']);
        const grade = entry.grade || (Array.isArray(entry.grades) && entry.grades.length > 0 ? entry.grades[0] : '');
        
        console.log(`[FRONTEND] Processing schedule entry ${entryIdx}:`, {
          rawSlot: entry.slot,
          rawSlotType: typeof entry.slot,
          days: days,
          room: entry.room,
          grade: grade,
          section: entry.section
        });
        
        // Create one schedule entry for each selected day
        days.forEach((day: string) => {
          // Ensure slot is saved as a string (consistent format)
          const slotToSave = entry.slot !== undefined && entry.slot !== null && entry.slot !== '' 
            ? String(entry.slot).trim() 
            : undefined;
          
          const scheduleEntry = {
            day: day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room || '',
            slot: slotToSave,
            grade: grade,
            section: entry.section || '',
            teacherId: entry.teacherId || undefined,
          };
          
          console.log(`[FRONTEND] Created schedule entry for day ${day}:`, scheduleEntry);
          
          formattedSchedule.push(scheduleEntry);
        });
      });
      
      console.log('[FRONTEND] Formatted schedule to send to backend:', formattedSchedule.map(e => ({
        day: e.day,
        room: e.room,
        slot: e.slot,
        slotType: typeof e.slot,
        grade: e.grade,
        section: e.section
      })));
      
      console.log('[FRONTEND] Sending update request to backend...');
      await api.subjects.update(subjectId, {
        ...selectedSubject,
        schedule: formattedSchedule,
      });
      console.log('[FRONTEND] Update request completed');

      // Reload subjects
      const response = await api.subjects.getAll() as any;
      if (response.data?.subjects) {
        setSubjects(response.data.subjects);
      }

      showWarning('Success', 'Schedule updated successfully!', 'info');
      setIsScheduleModalOpen(false);
      setSelectedSubject(null);
      setScheduleEntries([]);
    } catch (error) {
      console.error('Error updating schedule:', error);
      showWarning('Error', 'Failed to update schedule. Please try again.', 'error');
    }
  };

  const columns: TableColumn<any>[] = [
    { 
      key: 'id', 
      header: 'ID',
      render: (_value, row) => row.code || row._id || row.id || 'N/A'
    },
    {
      key: 'name',
      header: 'Subject Name',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={16} style={{ color: '#667eea' }} />
          <strong>{value}</strong>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (value) => (
        <span style={{ 
          padding: '0.25rem 0.5rem', 
          background: 'rgba(102, 126, 234, 0.1)', 
          borderRadius: '0.25rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#667eea'
        }}>
          {value}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => (
        <span style={{ fontSize: '0.9rem', color: '#666' }}>
          {value}
        </span>
      ),
    },
    {
      key: 'grades',
      header: 'Grades',
      render: (_value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={14} style={{ color: '#666' }} />
          <strong>{row.grades?.length || 0}</strong>
        </div>
      ),
    },
    {
      key: 'credits',
      header: 'Credits',
      render: (value) => <strong>{value}</strong>,
    },
    { key: 'category', header: 'Category' },
    {
      key: 'assignedGrades',
      header: 'Assigned Grades',
      render: (_value, row) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {row.grades && row.grades.length > 0 ? (
            row.grades.map((grade: string, index: number) => (
              <Badge key={index} variant="info" size="sm">
                {grade}
              </Badge>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#999' }}>No grades assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (_value, row) => {
        const schedules = row.schedule || [];
        if (schedules.length === 0) {
          return (
            <span style={{ fontSize: '0.8rem', color: '#999' }}>No schedule</span>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {schedules.slice(0, 2).map((sched: any, idx: number) => (
              <div key={idx} style={{ fontSize: '0.75rem', color: '#666' }}>
                {sched.day}: {sched.startTime} - {sched.endTime}
              </div>
            ))}
            {schedules.length > 2 && (
              <span style={{ fontSize: '0.7rem', color: '#999' }}>
                +{schedules.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge variant={getStatusVariant(value as string | undefined)} size="sm">
          {(value as string) || 'Active'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ViewButton 
            size="sm" 
            onClick={() => navigate(`/dashboard/admin/subjects/${row._id || row.id || row.mongoId}`)}
          />
          <EditButton 
            size="sm" 
            onClick={() => navigate(`/dashboard/admin/subjects/edit/${row._id || row.id || row.mongoId}`)}
          />
          <button
            onClick={() => handleManageSchedule(row)}
            style={{
              padding: '0.25rem 0.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            title="Manage Schedule"
          >
            <Clock size={12} />
            Schedule
          </button>
          <DeleteButton 
            size="sm" 
            onClick={() => handleDeleteSubject(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Subjects</h1>
        <AddButton
          size="md"
          onClick={() => navigate('/dashboard/admin/subjects/add')}
          title="Add New Subject"
        />
      </div>
      <Table
        columns={columns}
        data={subjects.slice(0, 10)}
        emptyMessage="No subjects found"
      />

      {/* Schedule Management Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedSubject(null);
          setScheduleEntries([]);
        }}
        title={`Manage Schedule - ${selectedSubject?.name || ''}${selectedSubject?.code ? ` (${selectedSubject.code})` : ''}`}
        size="lg"
        customMaxWidth="1000px"
      >
        {selectedSubject && (
          <div style={{ padding: '1rem 0' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                Time Schedule
              </h3>
              <button
                onClick={handleAddScheduleEntry}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Calendar size={16} />
                Add Time Slot
              </button>
            </div>

            {scheduleEntries.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                No schedule entries. Click "Add Time Slot" to create one.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {scheduleEntries.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                        Time Slot {index + 1}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleCopyScheduleEntry(index)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                          title="Copy this time slot"
                        >
                          <Copy size={12} />
                          Copy
                        </button>
                        <button
                          onClick={() => handleRemoveScheduleEntry(index)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* First row: Days, Select Teacher, Select Grade */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#374151' }}>
                            Days *
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.35rem', alignItems: 'center' }}>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                              const dayAbbr = day.substring(0, 3);
                              const currentDays = Array.isArray(entry.days) ? entry.days : (entry.day ? [entry.day] : []);
                              const isSelected = currentDays.includes(day);
                              
                              // Check if this day-slot combination is already used in another entry OR another subject
                              const currentEntrySlot = entry.slot !== undefined && entry.slot !== null && entry.slot !== '' ? String(entry.slot) : null;
                              
                              // Check current schedule entries
                              const isDaySlotUsedInCurrent = currentEntrySlot && scheduleEntries.some((e, idx) => {
                                if (idx === index) return false; // Don't check current entry
                                if (e.room !== entry.room) return false; // Different room
                                if (!e.slot || String(e.slot) !== currentEntrySlot) return false; // Different slot
                                const otherEntryDays = Array.isArray(e.days) ? e.days : (e.day ? [e.day] : []);
                                return otherEntryDays.includes(day); // Check if this specific day is used
                              });
                              
                              // Check other subjects' schedules (room conflicts)
                              const isDaySlotUsedInOtherSubjects = currentEntrySlot && allSubjectsForConflictCheck.some((otherSubject: any) => {
                                const otherSchedule = otherSubject.schedule || [];
                                return otherSchedule.some((scheduleEntry: any) => {
                                  const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                                    ? String(scheduleEntry.slot).trim()
                                    : '';
                                  return scheduleEntry.room === entry.room &&
                                         otherSlot === currentEntrySlot &&
                                         scheduleEntry.day === day;
                                });
                              });
                              
                              // Check for teacher conflicts (same teacher, same day, same slot, regardless of room)
                              const currentTeacherId = entry.teacherId 
                                ? (typeof entry.teacherId === 'object' ? entry.teacherId._id || entry.teacherId.id : entry.teacherId)
                                : null;
                              
                              const isDaySlotUsedByTeacher = currentEntrySlot && currentTeacherId && allSubjectsForConflictCheck.some((otherSubject: any) => {
                                const otherSchedule = otherSubject.schedule || [];
                                return otherSchedule.some((scheduleEntry: any) => {
                                  const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                                    ? String(scheduleEntry.slot).trim()
                                    : '';
                                  const otherTeacherId = scheduleEntry.teacherId
                                    ? (typeof scheduleEntry.teacherId === 'object' ? scheduleEntry.teacherId._id || scheduleEntry.teacherId.id : scheduleEntry.teacherId)
                                    : null;
                                  
                                  // Check if same teacher, same day, same slot
                                  return otherTeacherId && 
                                         String(otherTeacherId) === String(currentTeacherId) &&
                                         otherSlot === currentEntrySlot &&
                                         scheduleEntry.day === day;
                                });
                              });
                              
                              // Get conflicting subject code (check room conflicts first, then teacher conflicts)
                              let conflictingSubjectForDay = null;
                              if (currentEntrySlot) {
                                // First check room conflicts
                                conflictingSubjectForDay = allSubjectsForConflictCheck.find((otherSubject: any) => {
                                  const otherSchedule = otherSubject.schedule || [];
                                  return otherSchedule.some((scheduleEntry: any) => {
                                    const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                                      ? String(scheduleEntry.slot).trim()
                                      : '';
                                    return scheduleEntry.room === entry.room &&
                                           otherSlot === currentEntrySlot &&
                                           scheduleEntry.day === day;
                                  });
                                });
                                
                                // If no room conflict, check teacher conflict
                                if (!conflictingSubjectForDay && currentTeacherId) {
                                  conflictingSubjectForDay = allSubjectsForConflictCheck.find((otherSubject: any) => {
                                    const otherSchedule = otherSubject.schedule || [];
                                    return otherSchedule.some((scheduleEntry: any) => {
                                      const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                                        ? String(scheduleEntry.slot).trim()
                                        : '';
                                      const otherTeacherId = scheduleEntry.teacherId
                                        ? (typeof scheduleEntry.teacherId === 'object' ? scheduleEntry.teacherId._id || scheduleEntry.teacherId.id : scheduleEntry.teacherId)
                                        : null;
                                      
                                      // Check if same teacher, same day, same slot
                                      return otherTeacherId && 
                                             String(otherTeacherId) === String(currentTeacherId) &&
                                             otherSlot === currentEntrySlot &&
                                             scheduleEntry.day === day;
                                    });
                                  });
                                }
                              }
                              
                              const conflictingSubjectCodeForDay = conflictingSubjectForDay ? (conflictingSubjectForDay.code || conflictingSubjectForDay.name || 'Unknown') : null;
                              
                              // Disable if this day-slot combo is used in another entry, another subject (room conflict), or by the same teacher, but allow if already selected in this entry
                              const isDisabled = (isDaySlotUsedInCurrent || isDaySlotUsedInOtherSubjects || isDaySlotUsedByTeacher) && !isSelected;
                              
                              return (
                                <label
                                  key={day}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    padding: '0.35rem 0.5rem',
                                    background: isSelected ? '#667eea' : (isDisabled ? '#f3f4f6' : '#f7fafc'),
                                    color: isSelected ? 'white' : (isDisabled ? '#9ca3af' : '#4a5568'),
                                    border: `2px solid ${isSelected ? '#667eea' : (isDisabled ? '#d1d5db' : '#e2e8f0')}`,
                                    borderRadius: '0.5rem',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: isSelected ? 600 : 400,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    opacity: isDisabled ? 0.6 : 1,
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      if (!isDisabled) {
                                        handleToggleDay(index, day);
                                      }
                                    }}
                                    disabled={!!isDisabled}
                                    style={{ display: 'none' }}
                                  />
                                  {isSelected && <span style={{ fontSize: '0.65rem' }}>✓</span>}
                                  {dayAbbr}
                                  {isDisabled && conflictingSubjectCodeForDay && (
                                    <span style={{ fontSize: '0.6rem', fontStyle: 'italic', marginLeft: '0.2rem', color: '#dc2626' }}>
                                      ({conflictingSubjectCodeForDay})
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Teacher selection */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#374151' }}>
                            Select Teacher
                          </label>
                          <select
                            value={entry.teacherId || ''}
                            onChange={(e) => handleUpdateScheduleEntry(index, 'teacherId', e.target.value)}
                            style={{
                              width: 'auto',
                              minWidth: '126px',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                            }}
                          >
                            <option value="">Select Teacher</option>
                            {subjectTeachers.map((teacher) => (
                              <option key={teacher.value} value={teacher.value}>
                                {teacher.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Grade selection */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#374151' }}>
                            Select Grade *
                          </label>
                          <select
                            value={entry.grade || (Array.isArray(entry.grades) && entry.grades.length > 0 ? entry.grades[0] : '')}
                            onChange={(e) => handleSelectGrade(index, e.target.value)}
                            style={{
                              width: 'auto',
                              minWidth: '77px',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                            }}
                          >
                            <option value="">Select Grade</option>
                            {(() => {
                              // Extract grade from class name (e.g., "Grade 1 Section A" -> "Grade 1")
                              const extractGradeFromName = (name: string): string | null => {
                                if (!name) return null;
                                const match = name.match(/^(Grade\s+\d+)/i);
                                return match ? match[1] : null;
                              };
                              
                              // Get unique grades from all classes
                              const gradeMap = new Map<string, string>();
                              allClasses.forEach((c: any) => {
                                if (c.status === 'Active' && c.name) {
                                  const gradeKey = extractGradeFromName(c.name);
                                  if (gradeKey && !gradeMap.has(gradeKey)) {
                                    gradeMap.set(gradeKey, gradeKey);
                                  }
                                }
                              });
                              
                              const availableGrades = Array.from(gradeMap.values())
                                .sort((a, b) => {
                                  // Sort by grade number
                                  const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                                  const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                                  return numA - numB;
                                });
                              
                              return availableGrades.map((grade) => (
                                <option key={grade} value={grade}>
                                  {grade}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                      </div>
                      
                      {/* Second row: Room, Slot, Select Section */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.75rem', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#374151' }}>
                            Room *
                          </label>
                          <select
                            value={entry.room || ''}
                            onChange={(e) => {
                              const roomValue = e.target.value;
                              const updated = [...scheduleEntries];
                              updated[index] = { ...updated[index], room: roomValue, slot: '' };
                              
                              // If room is selected, auto-fill from first slot
                              if (roomValue) {
                                const selectedRoom = rooms.find((r: any) => (r.code === roomValue || r._id === roomValue || r.id === roomValue));
                                if (selectedRoom && selectedRoom.data) {
                                  // Check if room has timeSlots array
                                  if (selectedRoom.data.timeSlots && Array.isArray(selectedRoom.data.timeSlots) && selectedRoom.data.timeSlots.length > 0) {
                                    const firstSlot = selectedRoom.data.timeSlots.find((slot: any) => slot.startTime && slot.endTime);
                                    if (firstSlot) {
                                      updated[index].startTime = firstSlot.startTime;
                                      updated[index].endTime = firstSlot.endTime;
                                      updated[index].slot = '0'; // Select first slot by default
                                    }
                                  } else if (selectedRoom.data.startTime) {
                                    // Legacy: single time slot
                                    updated[index].startTime = selectedRoom.data.startTime;
                                    updated[index].endTime = selectedRoom.data.endTime;
                                  }
                                }
                              } else {
                                // Clear times when room is cleared
                                updated[index].startTime = '09:00';
                                updated[index].endTime = '10:00';
                              }
                              
                              setScheduleEntries(updated);
                            }}
                            style={{
                              width: 'auto',
                              minWidth: '150px',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                            }}
                          >
                            <option value="">Select Room</option>
                            {rooms.map((room: any) => (
                              <option key={room._id || room.id} value={room.code}>
                                {room.name} ({room.code})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#374151' }}>
                            Slot
                          </label>
                          {(() => {
                            if (!entry.room) {
                              return (
                                <div style={{ 
                                  padding: '0.5rem', 
                                  border: '1px solid #d1d5db', 
                                  borderRadius: '6px', 
                                  backgroundColor: '#f3f4f6',
                                  color: '#9ca3af',
                                  fontSize: '0.875rem',
                                  textAlign: 'center'
                                }}>
                                  Select Room First
                                </div>
                              );
                            }
                            
                            const selectedRoom = rooms.find((r: any) => (r.code === entry.room || r._id === entry.room || r.id === entry.room));
                            if (!selectedRoom || !selectedRoom.data?.timeSlots || !Array.isArray(selectedRoom.data.timeSlots)) {
                              return (
                                <div style={{ 
                                  padding: '0.5rem', 
                                  border: '1px solid #d1d5db', 
                                  borderRadius: '6px', 
                                  backgroundColor: '#f3f4f6',
                                  color: '#9ca3af',
                                  fontSize: '0.875rem',
                                  textAlign: 'center'
                                }}>
                                  No Slots Available
                                </div>
                              );
                            }
                            
                            const availableSlots = selectedRoom.data.timeSlots.filter((slot: any) => slot.startTime && slot.endTime);
                            
                            // Check which slots are already selected in other entries for the same room AND overlapping days
                            // A slot is reserved per room and day, regardless of grade
                            // This prevents double-booking of the same room slot on the same day
                            const getUsedSlots = () => {
                              const usedSlots: Set<string> = new Set();
                              const currentEntrySlot = entry.slot !== undefined && entry.slot !== null && entry.slot !== '' ? String(entry.slot) : null;
                              const currentEntryDays = Array.isArray(entry.days) ? entry.days : (entry.day ? [entry.day] : []);
                              
                              scheduleEntries.forEach((e, idx) => {
                                // Only check OTHER entries (not the current one)
                                // Check for same room and overlapping days (grade doesn't matter)
                                if (idx !== index && 
                                    e.room === entry.room && 
                                    e.slot !== undefined && 
                                    e.slot !== '') {
                                  const otherEntrySlot = String(e.slot);
                                  const otherEntryDays = Array.isArray(e.days) ? e.days : (e.day ? [e.day] : []);
                                  
                                  // Check if days overlap - if they do, the slot is reserved
                                  const hasDayOverlap = currentEntryDays.some((day: string) => otherEntryDays.includes(day));
                                  
                                  // Only mark as used if:
                                  // 1. It's not the current entry's slot, AND
                                  // 2. The days overlap (same day is selected in both entries)
                                  // Note: Grade is not checked - a room slot is reserved per day for all grades
                                  // If ANY day overlaps, the slot is reserved for ALL days in the current entry
                                  if (otherEntrySlot !== currentEntrySlot && hasDayOverlap) {
                                    usedSlots.add(otherEntrySlot);
                                  }
                                }
                              });
                              return usedSlots;
                            };
                            
                            // Check if a specific slot-day combination is already used
                            // This is more granular - checks if a specific day-slot combo is taken
                            // Checks both current schedule entries AND other subjects' schedules
                            // Also checks for teacher conflicts
                            const isSlotDayCombinationUsed = (slotValue: string, day: string) => {
                              // First check current schedule entries
                              const usedInCurrentSchedule = scheduleEntries.some((e, idx) => {
                                if (idx === index) return false; // Don't check current entry
                                if (e.room !== entry.room) return false; // Different room
                                if (!e.slot || String(e.slot) !== slotValue) return false; // Different slot
                                
                                const otherEntryDays = Array.isArray(e.days) ? e.days : (e.day ? [e.day] : []);
                                return otherEntryDays.includes(day); // Check if this specific day is used
                              });
                              
                              if (usedInCurrentSchedule) return true;
                              
                              // Get current entry's teacher ID
                              const currentTeacherId = entry.teacherId 
                                ? (typeof entry.teacherId === 'object' ? entry.teacherId._id || entry.teacherId.id : entry.teacherId)
                                : null;
                              
                              // Then check other subjects' schedules (room/slot/day conflicts)
                              const usedInOtherSubjects = allSubjectsForConflictCheck.some((otherSubject: any) => {
                                const otherSchedule = otherSubject.schedule || [];
                                return otherSchedule.some((scheduleEntry: any) => {
                                  const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                                    ? String(scheduleEntry.slot).trim()
                                    : '';
                                  return scheduleEntry.room === entry.room &&
                                         otherSlot === slotValue &&
                                         scheduleEntry.day === day;
                                });
                              });
                              
                              if (usedInOtherSubjects) return true;
                              
                              // Check for teacher conflicts (same teacher, same day, same slot, regardless of room)
                              if (currentTeacherId) {
                                const teacherConflict = allSubjectsForConflictCheck.some((otherSubject: any) => {
                                  const otherSchedule = otherSubject.schedule || [];
                                  return otherSchedule.some((scheduleEntry: any) => {
                                    const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                                      ? String(scheduleEntry.slot).trim()
                                      : '';
                                    const otherTeacherId = scheduleEntry.teacherId
                                      ? (typeof scheduleEntry.teacherId === 'object' ? scheduleEntry.teacherId._id || scheduleEntry.teacherId.id : scheduleEntry.teacherId)
                                      : null;
                                    
                                    // Check if same teacher, same day, same slot
                                    return otherTeacherId && 
                                           String(otherTeacherId) === String(currentTeacherId) &&
                                           otherSlot === slotValue &&
                                           scheduleEntry.day === day;
                                  });
                                });
                                
                                if (teacherConflict) return true;
                              }
                              
                              return false;
                            };
                            
                            // Get conflicting subject code for a slot-day combination
                            // Checks both room conflicts and teacher conflicts
                            const getConflictingSubjectCode = (slotValue: string, day: string): string | null => {
                              // First check for room conflicts
                              const roomConflictSubject = allSubjectsForConflictCheck.find((otherSubject: any) => {
                                const otherSchedule = otherSubject.schedule || [];
                                return otherSchedule.some((scheduleEntry: any) => {
                                  const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                                    ? String(scheduleEntry.slot).trim()
                                    : '';
                                  return scheduleEntry.room === entry.room &&
                                         otherSlot === slotValue &&
                                         scheduleEntry.day === day;
                                });
                              });
                              
                              if (roomConflictSubject) {
                                return roomConflictSubject.code || roomConflictSubject.name || 'Unknown';
                              }
                              
                              // Then check for teacher conflicts
                              const currentTeacherId = entry.teacherId 
                                ? (typeof entry.teacherId === 'object' ? entry.teacherId._id || entry.teacherId.id : entry.teacherId)
                                : null;
                              
                              if (currentTeacherId) {
                                const teacherConflictSubject = allSubjectsForConflictCheck.find((otherSubject: any) => {
                                  const otherSchedule = otherSubject.schedule || [];
                                  return otherSchedule.some((scheduleEntry: any) => {
                                    const otherSlot = scheduleEntry.slot !== undefined && scheduleEntry.slot !== null && scheduleEntry.slot !== ''
                                      ? String(scheduleEntry.slot).trim()
                                      : '';
                                    const otherTeacherId = scheduleEntry.teacherId
                                      ? (typeof scheduleEntry.teacherId === 'object' ? scheduleEntry.teacherId._id || scheduleEntry.teacherId.id : scheduleEntry.teacherId)
                                      : null;
                                    
                                    // Check if same teacher, same day, same slot
                                    return otherTeacherId && 
                                           String(otherTeacherId) === String(currentTeacherId) &&
                                           otherSlot === slotValue &&
                                           scheduleEntry.day === day;
                                  });
                                });
                                
                                if (teacherConflictSubject) {
                                  return teacherConflictSubject.code || teacherConflictSubject.name || 'Unknown';
                                }
                              }
                              
                              return null;
                            };
                            
                            const usedSlots = getUsedSlots();
                            
                            // Helper function to format time (09:00 -> 9:00AM)
                            const formatTime = (time: string): string => {
                              if (!time) return '';
                              const [hours, minutes] = time.split(':');
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              const displayHour = hour % 12 || 12;
                              return `${displayHour}:${minutes}${ampm}`;
                            };
                            
                            return (
                              <div>
                                <div style={{ 
                                  display: 'flex', 
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                  gap: '0.25rem',
                                  padding: '0.25rem',
                                  alignItems: 'flex-start',
                                  justifyContent: 'flex-start'
                                }}>
                                  {availableSlots.map((slot: any, slotIndex: number) => {
                                    const slotValue = String(slotIndex);
                                    // Normalize entry slot to match slotValue format (string representation of index)
                                    let entrySlot = '';
                                    if (entry.slot !== undefined && entry.slot !== null && entry.slot !== '') {
                                      // Convert to number first, then back to string to ensure consistency
                                      const slotNum = typeof entry.slot === 'number' ? entry.slot : parseInt(String(entry.slot).trim(), 10);
                                      if (!isNaN(slotNum) && slotNum >= 0) {
                                        entrySlot = String(slotNum);
                                      } else {
                                        entrySlot = String(entry.slot).trim();
                                      }
                                    }
                                    const isSelected = entrySlot === slotValue;
                                    
                                    // Check if this slot is used on any overlapping day
                                    // If the current entry has days selected, check if this slot is used on any of those days
                                    const currentEntryDays = Array.isArray(entry.days) ? entry.days : (entry.day ? [entry.day] : []);
                                    let isUsed = false;
                                    let conflictingSubjectCode: string | null = null;
                                    
                                    if (currentEntryDays.length > 0) {
                                      // Check if this slot is used on any of the current entry's selected days
                                      for (const day of currentEntryDays) {
                                        if (isSlotDayCombinationUsed(slotValue, day)) {
                                          isUsed = true;
                                          conflictingSubjectCode = getConflictingSubjectCode(slotValue, day);
                                          break;
                                        }
                                      }
                                    } else {
                                      // If no days selected yet, use the general check
                                      isUsed = usedSlots.has(slotValue);
                                    }
                                    
                                    // Also check if it's the current entry's slot (should not be marked as used)
                                    if (isSelected) {
                                      isUsed = false; // Current entry's slot should always be available
                                      conflictingSubjectCode = null;
                                    }
                                    
                                    // Debug log for first entry and first 3 slots
                                    if (index === 0 && slotIndex < 3) {
                                      console.log(`[FRONTEND] Radio Button Render - Entry ${index}, Slot ${slotIndex}:`, {
                                        rawEntrySlot: entry.slot,
                                        rawEntrySlotType: typeof entry.slot,
                                        normalizedEntrySlot: entrySlot,
                                        slotValue: slotValue,
                                        isSelected: isSelected,
                                        isUsed: isUsed,
                                        entryRoom: entry.room,
                                        entryGrade: entry.grade
                                      });
                                    }
                                    
                                    return (
                                      <label
                                        key={slotIndex}
                                        style={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          gap: '0.15rem',
                                          padding: '0.25rem 0.4rem',
                                          background: 'transparent',
                                          color: isSelected ? '#667eea' : (isUsed ? '#9ca3af' : '#374151'),
                                          border: 'none',
                                          cursor: isUsed ? 'not-allowed' : 'pointer',
                                          fontSize: '0.8rem',
                                          fontWeight: isSelected ? 600 : 400,
                                          opacity: isUsed ? 0.6 : 1,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                          <input
                                            type="radio"
                                            name={`slot-${index}`}
                                            value={slotValue}
                                            checked={isSelected}
                                            disabled={isUsed}
                                            onChange={() => {
                                              if (!isUsed) {
                                                const updated = [...scheduleEntries];
                                                updated[index] = { ...updated[index], slot: slotValue };
                                                
                                                // Auto-fill startTime and endTime from slot data
                                                if (selectedRoom.data?.timeSlots && Array.isArray(selectedRoom.data.timeSlots)) {
                                                  const selectedSlot = selectedRoom.data.timeSlots[slotIndex];
                                                  if (selectedSlot && selectedSlot.startTime && selectedSlot.endTime) {
                                                    updated[index].startTime = selectedSlot.startTime;
                                                    updated[index].endTime = selectedSlot.endTime;
                                                  }
                                                }
                                                
                                                setScheduleEntries(updated);
                                              }
                                            }}
                                            style={{ 
                                              margin: 0,
                                              cursor: isUsed ? 'not-allowed' : 'pointer',
                                            }}
                                          />
                                          <span>{slot.name || `Slot ${slotIndex + 1}`}</span>
                                          {isUsed && (
                                            <span style={{ fontSize: '0.65rem', fontStyle: 'italic', color: '#dc2626' }}>
                                              {conflictingSubjectCode ? `(Reserved by ${conflictingSubjectCode})` : '(Reserved)'}
                                            </span>
                                          )}
                                        </div>
                                        {isSelected && slot.startTime && slot.endTime && (
                                          <div style={{ 
                                            fontSize: '0.7rem', 
                                            fontWeight: 400,
                                            color: '#000000',
                                            marginTop: '0.1rem'
                                          }}>
                                            {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
                                          </div>
                                        )}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* Sections selection */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#374151' }}>
                            Select Section *
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {(() => {
                              const selectedGrade = entry.grade || (Array.isArray(entry.grades) && entry.grades.length > 0 ? entry.grades[0] : '');
                              if (!selectedGrade) {
                                return (
                                  <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>
                                    Please select a grade first
                                  </span>
                                );
                              }
                              
                              // Extract grade from class name (e.g., "Grade 1 Section A" -> "Grade 1")
                              const extractGradeFromName = (name: string): string | null => {
                                if (!name) return null;
                                const match = name.match(/^(Grade\s+\d+)/i);
                                return match ? match[1] : null;
                              };
                              
                              // Get sections for the selected grade
                              const normalizedGrade = selectedGrade.startsWith('Grade') ? selectedGrade : `Grade ${selectedGrade}`;
                              const sections = allClasses
                                .filter((c: any) => {
                                  if (c.status !== 'Active' || !c.section) return false;
                                  // Extract grade from name field
                                  const classGrade = extractGradeFromName(c.name || '');
                                  return classGrade === normalizedGrade;
                                })
                                .map((c: any) => c.section)
                                .filter(Boolean)
                                .sort();
                              
                              const availableSections = Array.from(new Set(sections));
                              // Filter to only show "A" and "B" sections
                              const filteredSections = availableSections.filter((s: string) => 
                                s.toUpperCase() === 'A' || s.toUpperCase() === 'B'
                              );
                              const selectedSection = entry.section || '';
                              
                              return filteredSections.length > 0 ? (
                                filteredSections.map((section: string) => {
                                  const isSelected = selectedSection === section;
                                  return (
                                    <label
                                      key={section}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.25rem',
                                        padding: '0.2rem 0.35rem',
                                        minWidth: '28px',
                                        height: '28px',
                                        background: isSelected ? '#10b981' : '#f7fafc',
                                        color: isSelected ? 'white' : '#4a5568',
                                        border: `2px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: isSelected ? 600 : 400,
                                        lineHeight: '1',
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name={`section-${index}`}
                                        checked={isSelected}
                                        onChange={() => handleSelectSection(index, section)}
                                        style={{ display: 'none' }}
                                      />
                                      {isSelected && <span style={{ fontSize: '0.7rem', lineHeight: '1' }}>✓</span>}
                                      <span style={{ lineHeight: '1' }}>{section}</span>
                                    </label>
                                  );
                                })
                              ) : (
                                <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>
                                  No sections available for {selectedGrade}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setSelectedSubject(null);
                  setScheduleEntries([]);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Save Schedule
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Warning Modal */}
      <WarningModal
        isOpen={warningModal.isOpen}
        onClose={() => setWarningModal({ ...warningModal, isOpen: false })}
        title={warningModal.title}
        message={warningModal.message}
        type={warningModal.type}
      />
    </div>
  );
};

export default SubjectsList;

