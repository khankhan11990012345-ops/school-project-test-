# Reusable UI Components

This folder contains reusable UI components that can be used throughout the application.

## 📦 Components

### 1. Button
A versatile button component with multiple variants and sizes.

**Location:** `components/Button/`

**Usage:**
```tsx
import { Button } from '../components';

<Button variant="primary" size="md">Click Me</Button>
<Button variant="danger" size="sm" isLoading={true}>Delete</Button>
<Button variant="outline" fullWidth>Full Width Button</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean (shows spinner)
- `fullWidth`: boolean
- All standard button HTML attributes

---

### 2. Toast / Notification
Toast notifications with context provider for easy usage.

**Location:** `components/Toast/`

**Setup (in App.tsx or main component):**
```tsx
import { ToastProvider } from './components';

function App() {
  return (
    <ToastProvider>
      {/* Your app content */}
    </ToastProvider>
  );
}
```

**Usage:**
```tsx
import { useToast } from '../components';

const MyComponent = () => {
  const { showToast } = useToast();

  const handleClick = () => {
    showToast('Success message!', 'success');
    showToast('Error occurred!', 'error');
    showToast('Warning message', 'warning');
    showToast('Info message', 'info');
  };

  return <button onClick={handleClick}>Show Toast</button>;
};
```

**Types:**
- 'success' | 'error' | 'warning' | 'info'

---

### 3. Loading
Loading spinner component with different sizes and fullscreen option.

**Location:** `components/Loading/`

**Usage:**
```tsx
import { Loading } from '../components';

// Simple loading
<Loading size="md" />

// Fullscreen loading
<Loading fullScreen={true} message="Loading data..." />

// Small loading
<Loading size="sm" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg'
- `fullScreen`: boolean (covers entire screen)
- `message`: string (optional message below spinner)

---

### 4. Modal
Modal dialog component with customizable size and close options.

**Location:** `components/Modal/`

**Usage:**
```tsx
import { Modal } from '../components';
import { useState } from 'react';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        size="md"
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
};
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (optional)
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `showCloseButton`: boolean (default: true)
- `closeOnOverlayClick`: boolean (default: true)

---

### 5. Badge
Badge component for displaying status, labels, or tags.

**Location:** `components/Badge/`

**Usage:**
```tsx
import { Badge } from '../components';

<Badge variant="success">Active</Badge>
<Badge variant="danger" size="sm">Inactive</Badge>
<Badge variant="primary" rounded>New</Badge>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `rounded`: boolean (fully rounded badge)

---

## 🎨 Styling

All components have their styles in separate CSS files within their respective folders:
- `Button/Button.css`
- `Toast/Toast.css`
- `Loading/Loading.css`
- `Modal/Modal.css`
- `Badge/Badge.css`

Styles follow the application's design system with consistent colors and spacing.

## 📝 Import Examples

**Import individual components:**
```tsx
import { Button } from '../components';
import { Modal } from '../components';
import { Badge } from '../components';
```

**Import multiple components:**
```tsx
import { Button, Modal, Badge, Loading } from '../components';
```

**Import Toast:**
```tsx
import { ToastProvider, useToast } from '../components';
```

