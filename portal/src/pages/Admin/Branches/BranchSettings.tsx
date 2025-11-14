import { Building2, Save } from 'lucide-react';
import '../../../styles/universal.css';
import './Branches.css';

const BranchSettings = () => {
  const branches = [
    {
      id: 1,
      name: 'Main Campus',
      code: 'MAIN-001',
      settings: {
        maxStudents: 500,
        maxTeachers: 40,
        workingHours: '8:00 AM - 4:00 PM',
        timezone: 'UTC-5',
        language: 'English',
      },
    },
    {
      id: 2,
      name: 'North Branch',
      code: 'NORTH-002',
      settings: {
        maxStudents: 350,
        maxTeachers: 30,
        workingHours: '8:00 AM - 4:00 PM',
        timezone: 'UTC-5',
        language: 'English',
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Branch Settings</h1>
      </div>

      <div className="branches-settings">
        {branches.map((branch) => (
          <div key={branch.id} className="universal-card branch-settings-card">
            <div className="branch-settings-header">
              <div className="branch-info">
                <Building2 size={24} />
                <div>
                  <h3>{branch.name}</h3>
                  <span className="branch-code">{branch.code}</span>
                </div>
              </div>
              <button className="btn-primary">
                <Save size={18} />
                Save Settings
              </button>
            </div>
            <div className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Max Students</label>
                  <input
                    type="number"
                    defaultValue={branch.settings.maxStudents}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Max Teachers</label>
                  <input
                    type="number"
                    defaultValue={branch.settings.maxTeachers}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Working Hours</label>
                  <input
                    type="text"
                    defaultValue={branch.settings.workingHours}
                    placeholder="e.g., 8:00 AM - 4:00 PM"
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select defaultValue={branch.settings.timezone}>
                    <option value="UTC-5">UTC-5</option>
                    <option value="UTC-6">UTC-6</option>
                    <option value="UTC-7">UTC-7</option>
                    <option value="UTC-8">UTC-8</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select defaultValue={branch.settings.language}>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchSettings;

