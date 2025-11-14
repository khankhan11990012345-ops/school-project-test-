import React, { CSSProperties, useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

export interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  subject: string;
  subjectCode?: string;
  class?: string;
  room?: string;
  students?: number;
  startTime?: string; // e.g., "09:00"
  endTime?: string; // e.g., "10:30"
}

export interface BigCalendarProps {
  schedules: ScheduleItem[];
  timeSlots?: string[]; // Custom time slots, e.g., ["08:00", "09:00", "10:00", ...]
  daysOfWeek?: string[]; // Custom days, default is Monday-Sunday
  onCellClick?: (schedule: ScheduleItem | null, day: string, timeSlot: string) => void;
  cellHeight?: string; // Height of each time slot cell
}

const BigCalendar: React.FC<BigCalendarProps> = ({
  schedules,
  timeSlots,
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  onCellClick,
  cellHeight = '80px',
}) => {
  const [filterMode, setFilterMode] = useState<'today' | 'weekdays'>('weekdays');

  // Get today's day name
  const getTodayDayName = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Filter schedules based on mode
  const filteredSchedules = filterMode === 'today' 
    ? schedules.filter(schedule => schedule.day === getTodayDayName())
    : schedules;

  // Filter days based on mode
  const filteredDays = filterMode === 'today'
    ? [getTodayDayName()]
    : daysOfWeek;

  // Default time slots (8 AM to 5 PM, every hour)
  const defaultTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const slots = timeSlots || defaultTimeSlots;

  // Parse time string to minutes for comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Check if a schedule item falls within a time slot
  const getScheduleForSlot = (day: string, slotTime: string): ScheduleItem | null => {
    return filteredSchedules.find(schedule => {
      if (schedule.day !== day) return false;
      
      const slotMinutes = timeToMinutes(slotTime);
      
      // Prefer startTime and endTime if available (more reliable)
      if (schedule.startTime && schedule.endTime) {
        const startMinutes = timeToMinutes(schedule.startTime);
        const endMinutes = timeToMinutes(schedule.endTime);
        return slotMinutes >= startMinutes && slotMinutes < endMinutes;
      }
      
      // Fallback to parsing schedule.time string (e.g., "09:00 AM - 10:30 AM")
      const timeMatch = schedule.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/g);
      if (!timeMatch || timeMatch.length < 2) {
        return false;
      }

      const startTimeStr = timeMatch[0];
      const endTimeStr = timeMatch[1];

      // Convert to 24-hour format
      const convertTo24Hour = (timeStr: string): number => {
        const [time, period] = timeStr.split(/\s*(AM|PM)/);
        const [hours, minutes] = time.split(':').map(Number);
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        return hour24 * 60 + (minutes || 0);
      };

      const startMinutes = convertTo24Hour(startTimeStr);
      const endMinutes = convertTo24Hour(endTimeStr);

      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    }) || null;
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    overflow: 'hidden',
  };

  const headerContainerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0',
  };

  const filterToggleStyle: CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
    background: 'white',
    borderRadius: '0.5rem',
    padding: '0.25rem',
    border: '1px solid #e0e0e0',
  };

  const filterButtonStyle = (isActive: boolean): CSSProperties => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    background: isActive ? '#E6E6E6' : 'transparent',
    color: isActive ? '#333' : '#666',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  });

  const headerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `120px repeat(${filteredDays.length}, 1fr)`,
    background: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0',
  };

  const timeColumnStyle: CSSProperties = {
    padding: '0.75rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#333',
    textAlign: 'center',
    borderRight: '1px solid #e0e0e0',
  };

  const dayHeaderStyle: CSSProperties = {
    padding: '0.75rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#333',
    textAlign: 'center',
    borderRight: '1px solid #e0e0e0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `120px repeat(${filteredDays.length}, 1fr)`,
  };

  const timeCellStyle: CSSProperties = {
    padding: '0.5rem',
    fontSize: '0.75rem',
    color: '#666',
    textAlign: 'center',
    borderRight: '1px solid #e0e0e0',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: cellHeight,
  };

  const scheduleCellStyle: CSSProperties = {
    padding: '0.25rem',
    borderRight: '1px solid #e0e0e0',
    borderBottom: '1px solid #f0f0f0',
    minHeight: cellHeight,
    position: 'relative',
    cursor: onCellClick ? 'pointer' : 'default',
  };

  const emptyCellStyle: CSSProperties = {
    ...scheduleCellStyle,
    background: '#fafafa',
  };

  const scheduleItemStyle: CSSProperties = {
    padding: '0.5rem',
    background: '#E6E6E6',
    color: '#333',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const scheduleSubjectStyle: CSSProperties = {
    fontWeight: 600,
    marginBottom: '0.25rem',
  };

  const scheduleTimeStyle: CSSProperties = {
    fontSize: '0.7rem',
    opacity: 0.9,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const formatTimeSlot = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div style={containerStyle}>
      {/* Filter Toggle Header */}
      <div style={headerContainerStyle}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
          Schedule
        </div>
        <div style={filterToggleStyle}>
          <button
            style={filterButtonStyle(filterMode === 'today')}
            onClick={() => setFilterMode('today')}
            onMouseEnter={(e) => {
              if (filterMode !== 'today') {
                e.currentTarget.style.background = '#E6E6E6';
              }
            }}
            onMouseLeave={(e) => {
              if (filterMode !== 'today') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Calendar size={14} />
            Today
          </button>
          <button
            style={filterButtonStyle(filterMode === 'weekdays')}
            onClick={() => setFilterMode('weekdays')}
            onMouseEnter={(e) => {
              if (filterMode !== 'weekdays') {
                e.currentTarget.style.background = '#E6E6E6';
              }
            }}
            onMouseLeave={(e) => {
              if (filterMode !== 'weekdays') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Calendar size={14} />
            Weekdays
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={headerStyle}>
        <div style={timeColumnStyle}>Time</div>
        {filteredDays.map((day) => (
          <div key={day} style={dayHeaderStyle}>
            {day.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={gridStyle}>
        {slots.map((slot) => (
          <React.Fragment key={slot}>
            {/* Time column */}
            <div style={timeCellStyle}>
              {formatTimeSlot(slot)}
            </div>

            {/* Day columns */}
            {filteredDays.map((day) => {
              const schedule = getScheduleForSlot(day, slot);
              const cellStyle = schedule ? scheduleCellStyle : emptyCellStyle;

              return (
                <div
                  key={`${day}-${slot}`}
                  style={cellStyle}
                  onClick={() => onCellClick?.(schedule, day, slot)}
                  onMouseEnter={(e) => {
                    if (onCellClick) {
                      e.currentTarget.style.background = schedule ? '#E6E6E6' : '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onCellClick) {
                      e.currentTarget.style.background = schedule ? 'transparent' : '#fafafa';
                    }
                  }}
                >
                  {schedule && (
                    <div style={scheduleItemStyle}>
                      <div style={scheduleSubjectStyle}>
                        {schedule.subject}
                        {schedule.subjectCode && (
                          <span style={{ fontSize: '0.65rem', opacity: 0.8, marginLeft: '0.25rem', fontWeight: 400 }}>
                            ({schedule.subjectCode})
                          </span>
                        )}
                      </div>
                      {schedule.class && (
                        <div style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                          {schedule.class}
                        </div>
                      )}
                      <div style={scheduleTimeStyle}>
                        <Clock size={10} />
                        {schedule.time}
                      </div>
                      {schedule.room && (
                        <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '0.25rem' }}>
                          {schedule.room}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BigCalendar;

