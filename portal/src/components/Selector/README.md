# Universal Selector Component

This is a **universal, reusable selector component** that can be used for any dropdown/select needs throughout the application.

## Why Universal?

- **Single source of design**: All dropdowns use the same component, so design changes only need to be made in one file (`Selector.tsx`)
- **Consistent UX**: All selects behave the same way across the application
- **Easy maintenance**: Update styling, behavior, or features in one place

## Usage

### Basic Usage with Static Options

```tsx
import { Selector } from '../../../components/Selector';

<Selector
  value={selectedValue}
  onChange={(val) => setSelectedValue(val)}
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ]}
  placeholder="Select an option"
  required
/>
```

### Usage with Async Data (Recommended)

```tsx
import { Selector, loadGradeOptions } from '../../../components/Selector';

<Selector
  value={selectedGrade}
  onChange={(val) => setSelectedGrade(String(val))}
  options={loadGradeOptions} // Pass the function directly
  placeholder="Select Grade"
  required
/>
```

### Available Helper Functions

We provide helper functions for common data types:

```tsx
import { 
  Selector, 
  loadGradeOptions, 
  loadSubjectOptions, 
  loadTeacherOptions,
  loadStudentOptions 
} from '../../../components/Selector';

// Grades
<Selector
  value={gradeId}
  onChange={(val) => setGradeId(String(val))}
  options={loadGradeOptions} // Shows all active grades
/>

// Grades with section
<Selector
  value={gradeId}
  onChange={(val) => setGradeId(String(val))}
  options={() => loadGradeOptions(true, true)} // showSection=true, filterActiveOnly=true
/>

// Subjects
<Selector
  value={subjectId}
  onChange={(val) => setSubjectId(String(val))}
  options={loadSubjectOptions}
/>

// Teachers
<Selector
  value={teacherId}
  onChange={(val) => setTeacherId(String(val))}
  options={loadTeacherOptions}
/>

// Students
<Selector
  value={studentId}
  onChange={(val) => setStudentId(String(val))}
  options={loadStudentOptions}
/>
```

### Advanced Features

```tsx
// With filtering
<Selector
  value={selectedValue}
  onChange={(val) => setSelectedValue(val)}
  options={allOptions}
  filterFn={(option) => option.value !== 'excluded-id'}
/>

// With sorting
<Selector
  value={selectedValue}
  onChange={(val) => setSelectedValue(val)}
  options={allOptions}
  sortFn={(a, b) => a.label.localeCompare(b.label)}
/>

// With custom loading/empty text
<Selector
  value={selectedValue}
  onChange={(val) => setSelectedValue(val)}
  options={loadData}
  loadingText="Fetching data..."
  emptyText="No items found"
/>

// With external loading state
<Selector
  value={selectedValue}
  onChange={(val) => setSelectedValue(val)}
  options={allOptions}
  loading={isLoading}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | `''` | Current selected value |
| `onChange` | `(value: string \| number) => void` | required | Callback when selection changes |
| `options` | `SelectorOption[] \| (() => Promise<SelectorOption[]>)` | required | Options array or async function |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `required` | `boolean` | `false` | Whether field is required |
| `disabled` | `boolean` | `false` | Whether selector is disabled |
| `loading` | `boolean` | `undefined` | External loading state |
| `loadingText` | `string` | `'Loading...'` | Text shown while loading |
| `emptyText` | `string` | `'No options available'` | Text shown when no options |
| `filterFn` | `(option: SelectorOption) => boolean` | `undefined` | Function to filter options |
| `sortFn` | `(a: SelectorOption, b: SelectorOption) => number` | `undefined` | Function to sort options |
| `renderOption` | `(option: SelectorOption) => ReactNode` | `undefined` | Custom render for options |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `React.CSSProperties` | `{}` | Inline styles |
| `id` | `string` | `undefined` | HTML id attribute |
| `name` | `string` | `undefined` | HTML name attribute |

## Customizing Design

To change the design of all selectors in the application, edit the `selectStyle` object in `Selector.tsx`:

```tsx
const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  fontSize: '0.9rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  // ... modify these styles
};
```

## Creating Custom Option Loaders

If you need a selector for a new data type, create a helper function in `selectorHelpers.ts`:

```tsx
export const loadCustomOptions = async (): Promise<SelectorOption[]> => {
  const data = await fetchCustomData();
  return data.map((item) => ({
    value: item.id,
    label: item.name,
  }));
};
```

Then use it:

```tsx
<Selector
  value={selectedId}
  onChange={(val) => setSelectedId(String(val))}
  options={loadCustomOptions}
/>
```

