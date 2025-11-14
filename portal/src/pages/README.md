# Pages Structure - Role-Based Organization

This folder contains all pages organized by user roles for easy navigation and maintenance.

## 📁 Folder Structure

```
pages/
├── Auth/                    # Authentication pages (Login, Registration)
├── Admin/                   # Admin-only pages
│   ├── Teachers/           # Teacher management
│   ├── Students/           # Student management
│   ├── Attendance/         # Attendance management
│   ├── Exams/              # Exam management
│   ├── Accounts/           # Financial management
│   ├── Admissions/         # Admission management
│   ├── Reports/            # Various reports
│   ├── UserManagement/    # User & role management
│   └── Branches/           # Multi-branch management
├── Teacher/                # Teacher-specific pages
│   ├── TeacherDashboard.tsx
│   ├── MyClasses.tsx
│   └── MyStudents.tsx
├── Student/                # Student-specific pages
│   ├── StudentDashboard.tsx
│   ├── MyCourses.tsx
│   └── MyGrades.tsx
└── Accountant/             # Accountant-specific pages
    ├── AccountantDashboard.tsx
    └── FinancialOverview.tsx
```

## 🎯 How to Add New Pages

### For Admin Pages:
1. Navigate to `pages/Admin/[ModuleName]/`
2. Create your new page component
3. Add route in `App.tsx` under admin routes
4. Update `Sidebar.tsx` if needed

### For Role-Specific Pages:
1. Navigate to `pages/[Role]/` (Teacher, Student, or Accountant)
2. Create your new page component
3. Add route in `App.tsx` under role-specific routes
4. Update `Sidebar.tsx` to show the new menu item

## 📝 Naming Conventions

- **Component files**: PascalCase (e.g., `MyClasses.tsx`)
- **CSS files**: Same name as component (e.g., `Teacher.css`)
- **Folders**: PascalCase for modules, lowercase for roles

## 🔍 Finding Pages

- **Admin pages**: `pages/Admin/[Module]/`
- **Teacher pages**: `pages/Teacher/`
- **Student pages**: `pages/Student/`
- **Accountant pages**: `pages/Accountant/`
- **Auth pages**: `pages/Auth/`

## 💡 Benefits

✅ **Easy to find**: All role-specific code in one place  
✅ **Clear separation**: No confusion about which page belongs to which role  
✅ **Scalable**: Easy to add new pages for any role  
✅ **Maintainable**: Other developers can quickly understand the structure  

