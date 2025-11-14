import { useState, useEffect } from 'react';
import { Badge } from '../../../components/Badge';
import { EditButton, DeleteButton, AddButton } from '../../../components/Button/iconbuttons';
import { Table, TableColumn } from '../../../components/Table';
import { Modal } from '../../../components/Modal';
import { Plus, X, Copy } from 'lucide-react';
import api from '../../../services/api';
import '../../../styles/universal.css';
import './MasterData.css';

type MasterDataType = 'room';

interface MasterDataEntry {
  _id?: string;
  id?: string;
  type: MasterDataType;
  code: string;
  name: string;
  data: {
    // For Room
    building?: string;
    floor?: number;
    capacity?: number;
    timeSlots?: string[]; // Array of time slot IDs or codes
    // For TimeSlot
    startTime?: string;
    endTime?: string;
    duration?: number;
  };
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

const MasterData = () => {
  const [entries, setEntries] = useState<MasterDataEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MasterDataEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MasterDataEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<Array<{ name: string; startTime: string; endTime: string }>>([{ name: 'Slot 1', startTime: '', endTime: '' }]);

  // Load entries from API
  useEffect(() => {
    loadEntries();
  }, []);

  // Filter entries to show only rooms
  useEffect(() => {
    const filtered = entries.filter(entry => entry.type === 'room');
    setFilteredEntries(filtered);
  }, [entries]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const response = await api.masterData.getAll({ type: 'room' }) as any;
      if (response.data?.masterData) {
        setEntries(response.data.masterData);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Error loading master data:', error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedEntry({
      type: 'room',
      code: '',
      name: '',
      data: {},
      status: 'Active',
    });
    setTimeSlots([{ name: 'Slot 1', startTime: '', endTime: '' }]);
    setIsAddModalOpen(true);
  };

  const handleEdit = (entry: MasterDataEntry) => {
    setSelectedEntry(entry);
    // Load time slots from entry data
    if (entry.data?.timeSlots && Array.isArray(entry.data.timeSlots) && entry.data.timeSlots.length > 0) {
      // Check if timeSlots is array of objects or strings
      const slots = entry.data.timeSlots.map((slot: any, index: number) => {
        if (typeof slot === 'string') {
          // If it's a string, try to parse it or create default
          return { name: `Slot ${index + 1}`, startTime: '', endTime: '' };
        }
        return { 
          name: slot.name || `Slot ${index + 1}`, 
          startTime: slot.startTime || '', 
          endTime: slot.endTime || '' 
        };
      });
      setTimeSlots(slots.length > 0 ? slots : [{ name: 'Slot 1', startTime: '', endTime: '' }]);
    } else if (entry.data?.startTime && entry.data?.endTime) {
      // Legacy: single time slot
      setTimeSlots([{ name: 'Slot 1', startTime: entry.data.startTime, endTime: entry.data.endTime }]);
    } else {
      setTimeSlots([{ name: 'Slot 1', startTime: '', endTime: '' }]);
    }
    setIsEditModalOpen(true);
  };

  const handleDelete = (entry: MasterDataEntry) => {
    setSelectedEntry(entry);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEntry) return;

    try {
      const entryId = selectedEntry._id || selectedEntry.id;
      if (!entryId) {
        alert('Invalid entry ID');
        return;
      }

      await api.masterData.delete(entryId);
      
      // Reload entries from backend
      await loadEntries();
      
      setIsDeleteModalOpen(false);
      setSelectedEntry(null);
      alert('Entry deleted successfully!');
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isEditModalOpen && selectedEntry) {
      setFormData(getInitialData());
    } else if (isAddModalOpen) {
      setFormData({ status: 'Active' });
    }
  }, [isEditModalOpen, isAddModalOpen, selectedEntry]);

  const handleFormChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      const data = formData;
      // Validate required fields
      if (!data.code || !data.code.trim()) {
        alert('Code is required');
        return;
      }
      if (!data.name || !data.name.trim()) {
        alert('Name is required');
        return;
      }

      // Prepare data object - only include defined values
      const roomData: any = {};
      if (data.building && data.building.trim()) {
        roomData.building = data.building.trim();
      }
      if (data.floor && data.floor.toString().trim()) {
        const floorNum = parseInt(data.floor);
        if (!isNaN(floorNum)) {
          roomData.floor = floorNum;
        }
      }
      if (data.capacity && data.capacity.toString().trim()) {
        const capacityNum = parseInt(data.capacity);
        if (!isNaN(capacityNum)) {
          roomData.capacity = capacityNum;
        }
      }
      // Store time slots as array with names
      const validTimeSlots = timeSlots
        .map((slot, index) => ({
          name: slot.name || `Slot ${index + 1}`,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
        .filter(slot => slot.startTime && slot.endTime);
      if (validTimeSlots.length > 0) {
        roomData.timeSlots = validTimeSlots;
        // Also keep first time slot for backward compatibility
        roomData.startTime = validTimeSlots[0].startTime;
        roomData.endTime = validTimeSlots[0].endTime;
      }

      const entryData: MasterDataEntry = {
        type: 'room',
        code: data.code.trim(),
        name: data.name.trim(),
        data: roomData,
        status: data.status || 'Active',
      };

      if (isEditModalOpen && selectedEntry) {
        // Update existing entry
        const entryId = selectedEntry._id || selectedEntry.id;
        if (!entryId) {
          alert('Invalid entry ID');
          return;
        }

        await api.masterData.update(entryId, entryData);
        alert('Entry updated successfully!');
      } else {
        // Create new entry
        await api.masterData.create(entryData);
        alert('Entry created successfully!');
      }

      // Reload entries from backend
      await loadEntries();

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedEntry(null);
      setTimeSlots([{ name: 'Slot 1', startTime: '', endTime: '' }]);
    } catch (error: any) {
      console.error('Error saving entry:', error);
      // Extract error message from API error
      let errorMessage = 'Failed to save entry. Please try again.';
      if (error?.errorData) {
        errorMessage = error.errorData.message || error.errorData.error || errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      alert(`Error: ${errorMessage}`);
    }
  };

  const getFields = (): any[] => {
    return [
      {
        name: 'code',
        label: 'Code *',
        type: 'text' as const,
        placeholder: 'e.g., ROM01',
        required: true,
      },
      {
        name: 'name',
        label: 'Name *',
        type: 'text' as const,
        placeholder: 'e.g., Room 101',
        required: true,
      },
      {
        name: 'building',
        label: 'Building',
        type: 'text' as const,
        placeholder: 'e.g., Main Building',
      },
      {
        name: 'floor',
        label: 'Floor',
        type: 'number' as const,
        placeholder: 'e.g., 1, 2, 3',
      },
      {
        name: 'capacity',
        label: 'Capacity',
        type: 'number' as const,
        placeholder: 'e.g., 30',
      },
      {
        name: 'status',
        label: 'Status *',
        type: 'select' as const,
        options: [
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
        ],
        defaultValue: 'Active',
      },
    ];
  };

  const getInitialData = () => {
    if (!selectedEntry) return {};
    
    return {
      code: selectedEntry.code,
      name: selectedEntry.name,
      status: selectedEntry.status,
      building: selectedEntry.data.building || '',
      floor: selectedEntry.data.floor?.toString() || '',
      capacity: selectedEntry.data.capacity?.toString() || '',
    };
  };

  const handleAddTimeSlot = () => {
    const newSlotNumber = timeSlots.length + 1;
    setTimeSlots([...timeSlots, { name: `Slot ${newSlotNumber}`, startTime: '', endTime: '' }]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      const updated = timeSlots.filter((_, i) => i !== index);
      // Re-number all slots after removal to maintain correct order
      const renumberedSlots = updated.map((slot, idx) => ({
        ...slot,
        name: `Slot ${idx + 1}`,
      }));
      setTimeSlots(renumberedSlots);
    }
  };

  const handleTimeSlotChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const handleCopyTimeSlot = (index: number) => {
    const slotToCopy = timeSlots[index];
    // New slot's start time should be the copied slot's end time
    const newStartTime = slotToCopy.endTime || '';
    let newEndTime = '';
    
    if (slotToCopy.startTime && slotToCopy.endTime) {
      // Calculate the duration between start and end time
      const [startHours, startMinutes] = slotToCopy.startTime.split(':').map(Number);
      const [endHours, endMinutes] = slotToCopy.endTime.split(':').map(Number);
      
      // Convert to minutes for easier calculation
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      const durationMinutes = endTotalMinutes - startTotalMinutes;
      
      // Calculate new end time by adding the same duration to the new start time
      const [newStartHours, newStartMinutes] = newStartTime.split(':').map(Number);
      const newStartTotalMinutes = newStartHours * 60 + newStartMinutes;
      const newEndTotalMinutes = newStartTotalMinutes + durationMinutes;
      
      // Convert back to hours and minutes
      const newEndHours = Math.floor(newEndTotalMinutes / 60) % 24; // Handle 24-hour overflow
      const newEndMins = newEndTotalMinutes % 60;
      
      newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMins).padStart(2, '0')}`;
    }
    
    // Generate new slot name based on position
    const newSlotNumber = index + 2; // Next slot number after the copied one
    const newSlot = { name: `Slot ${newSlotNumber}`, startTime: newStartTime, endTime: newEndTime };
    const updated = [...timeSlots];
    updated.splice(index + 1, 0, newSlot);
    
    // Re-number all slots after insertion to maintain correct order
    const renumberedSlots = updated.map((slot, idx) => ({
      ...slot,
      name: `Slot ${idx + 1}`,
    }));
    
    setTimeSlots(renumberedSlots);
  };

  // Helper function to format time (09:00 -> 9:00am)
  const formatTime = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes || '00'}${ampm}`;
  };


  const getColumns = (): TableColumn<MasterDataEntry>[] => {
    return [
      {
        key: 'code',
        header: 'Code',
        render: (value) => (
          <span style={{ fontWeight: 600, color: '#667eea' }}>{value}</span>
        ),
      },
      {
        key: 'name',
        header: 'Name',
      },
      {
        key: 'building',
        header: 'Building',
        render: (_value, row) => row.data?.building || 'N/A',
      },
      {
        key: 'floor',
        header: 'Floor',
        render: (_value, row) => row.data?.floor || 'N/A',
      },
      {
        key: 'capacity',
        header: 'Capacity',
        render: (_value, row) => row.data?.capacity || 'N/A',
      },
      {
        key: 'timeSlot',
        header: 'Time Slot',
        render: (_value, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {(() => {
              // Check if timeSlots array exists
              if (row.data?.timeSlots && Array.isArray(row.data.timeSlots) && row.data.timeSlots.length > 0) {
                const validSlots = row.data.timeSlots.filter((slot: any) => slot.startTime && slot.endTime);
                if (validSlots.length > 0) {
                  return validSlots.map((slot: any, index: number) => {
                    const start = formatTime(slot.startTime);
                    const end = formatTime(slot.endTime);
                    return (
                      <span key={index} style={{ fontSize: '0.8rem', color: '#666', fontWeight: 500 }}>
                        {start}-{end}
                      </span>
                    );
                  });
                }
              }
              
              // Fallback to single startTime/endTime for backward compatibility
              const startTime = row.data?.startTime;
              const endTime = row.data?.endTime;
              if (startTime && endTime) {
                return (
                  <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 500 }}>
                    {formatTime(startTime)}-{formatTime(endTime)}
                  </span>
                );
              }
              
              return <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>N/A</span>;
            })()}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (value) => (
          <Badge variant={value === 'Active' ? 'success' : 'secondary'} size="sm">
            {value}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_value, row) => (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <EditButton
              size="sm"
              onClick={() => handleEdit(row)}
            />
            <DeleteButton
              size="sm"
              onClick={() => handleDelete(row)}
            />
          </div>
        ),
      },
    ];
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Master Data Management</h1>
        <AddButton
          size="md"
          onClick={handleAdd}
          title="Add New Room"
        />
      </div>


      {/* Table */}
      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          Loading...
        </div>
      ) : (
        <Table
          columns={getColumns()}
          data={filteredEntries.slice(0, 10)}
          emptyMessage="No rooms found"
        />
      )}

      {/* Add/Edit Modal */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: (isAddModalOpen || isEditModalOpen) ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem',
        }}
        onClick={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedEntry(null);
          setTimeSlots([{ name: 'Slot 1', startTime: '', endTime: '' }]);
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            maxHeight: '90vh',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '700px', // Width to fit 3 fields per row comfortably
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>
              {isEditModalOpen ? 'Edit' : 'Add'} Room
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedEntry(null);
                setTimeSlots([{ name: 'Slot 1', startTime: '', endTime: '' }]);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Body */}
          <div style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Regular Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(() => {
                const fields = getFields();
                const rows: any[][] = [];
                let currentRow: any[] = [];
                
                // Group fields into rows of 3
                fields.forEach((field) => {
                  currentRow.push(field);
                  if (currentRow.length === 3) {
                    rows.push([...currentRow]);
                    currentRow = [];
                  }
                });
                
                if (currentRow.length > 0) {
                  rows.push(currentRow);
                }
                
                return rows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${row.length}, 1fr)`,
                      gap: '1rem',
                    }}
                  >
                    {row.map((field) => (
                      <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={formData[field.name] || field.defaultValue || ''}
                            onChange={(e) => handleFormChange(field.name, e.target.value)}
                            required={field.required}
                            style={{
                              padding: '0.625rem 0.75rem',
                              border: '2px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              fontSize: '0.9rem',
                            }}
                          >
                            <option value="">{field.placeholder || `Select ${field.label}`}</option>
                            {field.options?.map((option: { value: string; label: string }) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleFormChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            min={field.min}
                            style={{
                              padding: '0.625rem 0.75rem',
                              border: '2px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              fontSize: '0.9rem',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
            
            {/* Time Slots Section */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' }}>
                Time Slots
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(() => {
                  // Group slots into rows of 2
                  const rows: any[][] = [];
                  for (let i = 0; i < timeSlots.length; i += 2) {
                    rows.push(timeSlots.slice(i, i + 2));
                  }
                  
                  return rows.map((row, rowIndex) => (
                    <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {row.map((slot, slotIndex) => {
                        const actualIndex = rowIndex * 2 + slotIndex;
                        return (
                          <div
                            key={actualIndex}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem',
                              padding: '0.75rem',
                              border: '2px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              background: '#f7fafc',
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#667eea', marginBottom: '0.25rem' }}>
                              {slot.name || `Slot ${actualIndex + 1}`}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.5rem', alignItems: 'flex-end' }}>
                              <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.75rem' }}>
                                  Start Time
                                </label>
                                <input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => handleTimeSlotChange(actualIndex, 'startTime', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.4rem 0.5rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.8rem',
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.75rem' }}>
                                  End Time
                                </label>
                                <input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => handleTimeSlotChange(actualIndex, 'endTime', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.4rem 0.5rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.8rem',
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyTimeSlot(actualIndex)}
                                style={{
                                  padding: '0.4rem',
                                  background: '#e0e7ff',
                                  color: '#667eea',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title="Copy this time slot"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveTimeSlot(actualIndex)}
                                disabled={timeSlots.length === 1}
                                style={{
                                  padding: '0.4rem',
                                  background: timeSlots.length === 1 ? '#e2e8f0' : '#fed7d7',
                                  color: timeSlots.length === 1 ? '#9ca3af' : '#c53030',
                                  border: 'none',
                                  borderRadius: '0.5rem',
                                  cursor: timeSlots.length === 1 ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title={timeSlots.length === 1 ? 'At least one time slot is required' : 'Remove time slot'}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
                <button
                  type="button"
                  onClick={handleAddTimeSlot}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <Plus size={16} />
                  Add Slot
                </button>
              </div>
            </div>
            
            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedEntry(null);
                  setTimeSlots([{ name: 'Slot 1', startTime: '', endTime: '' }]);
                }}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#e2e8f0',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {isEditModalOpen ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEntry(null);
        }}
        title="Confirm Delete"
        size="sm"
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Are you sure you want to delete <strong>{selectedEntry?.name}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedEntry(null);
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
              onClick={confirmDelete}
              style={{
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MasterData;

