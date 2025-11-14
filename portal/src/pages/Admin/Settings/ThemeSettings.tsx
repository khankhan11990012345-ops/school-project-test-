import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Palette, RotateCcw, Save } from 'lucide-react';
import { Button } from '../../../components';

const ThemeSettings = () => {
  const { colors, updateColor, resetTheme } = useTheme();
  const [localColors, setLocalColors] = useState<typeof colors>(colors);
  const [saved, setSaved] = useState(false);

  // Sync local colors when theme changes
  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setLocalColors((prev) => ({ ...prev, [key]: value }));
    updateColor(key, value);
  };

  const handleSave = () => {
    // Colors are already updated via handleColorChange
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetTheme();
    // Update local colors after reset
    const defaultColors = {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#667eea',
      background: '#f5f5f5',
      surface: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e0e0e0',
      hover: '#5568d3',
      active: '#667eea',
      navbar: '#ffffff',
      sidebar: '#ffffff',
      button: '#667eea',
      buttonHover: '#5568d3',
      buttonActive: '#4a5bc4',
    };
    setLocalColors(defaultColors);
  };

  const colorGroups = [
    {
      title: 'Primary Colors',
      colors: [
        { key: 'primary' as const, label: 'Primary', description: 'Main brand color' },
        { key: 'secondary' as const, label: 'Secondary', description: 'Secondary brand color' },
        { key: 'accent' as const, label: 'Accent', description: 'Accent color' },
      ],
    },
    {
      title: 'Background Colors',
      colors: [
        { key: 'background' as const, label: 'Background', description: 'Main background' },
        { key: 'surface' as const, label: 'Surface', description: 'Card/surface background' },
        { key: 'navbar' as const, label: 'Navbar', description: 'Top navbar background' },
        { key: 'sidebar' as const, label: 'Sidebar', description: 'Sidebar background' },
      ],
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'text' as const, label: 'Text', description: 'Primary text color' },
        { key: 'textSecondary' as const, label: 'Text Secondary', description: 'Secondary text color' },
      ],
    },
    {
      title: 'Button Colors',
      colors: [
        { key: 'button' as const, label: 'Button', description: 'Button background' },
        { key: 'buttonHover' as const, label: 'Button Hover', description: 'Button hover state' },
        { key: 'buttonActive' as const, label: 'Button Active', description: 'Button active state' },
      ],
    },
    {
      title: 'Interactive Colors',
      colors: [
        { key: 'hover' as const, label: 'Hover', description: 'Hover state color' },
        { key: 'active' as const, label: 'Active', description: 'Active state color' },
        { key: 'border' as const, label: 'Border', description: 'Border color' },
      ],
    },
  ];

  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 600,
    color: '#333',
    margin: 0,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const groupStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const groupTitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#333',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e0e0e0',
  };

  const colorsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  };

  const colorItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  const colorLabelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#333',
  };

  const colorDescStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#666',
  };

  const colorInputWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const colorPreviewStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    borderRadius: '0.5rem',
    border: '2px solid #e0e0e0',
    cursor: 'pointer',
  };

  const colorInputStyle: React.CSSProperties = {
    flex: 1,
    padding: '0.5rem',
    border: '2px solid #e0e0e0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  };

  const savedMessageStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    background: '#48bb78',
    color: 'white',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <Palette size={32} style={{ color: colors.primary }} />
        <h1 style={titleStyle}>Theme Settings</h1>
      </div>

      {saved && (
        <div style={savedMessageStyle}>
          Theme saved successfully!
        </div>
      )}

      <div style={actionsStyle}>
        <Button variant="primary" onClick={handleSave}>
          <Save size={18} style={{ marginRight: '0.5rem' }} />
          Save Theme
        </Button>
        <Button variant="secondary" onClick={handleReset}>
          <RotateCcw size={18} style={{ marginRight: '0.5rem' }} />
          Reset to Default
        </Button>
      </div>

      {colorGroups.map((group) => (
        <div key={group.title} style={groupStyle}>
          <h2 style={groupTitleStyle}>{group.title}</h2>
          <div style={colorsGridStyle}>
            {group.colors.map((color) => (
              <div key={color.key} style={colorItemStyle}>
                <label style={colorLabelStyle}>{color.label}</label>
                <p style={colorDescStyle}>{color.description}</p>
                <div style={colorInputWrapperStyle}>
                  <div
                    style={{
                      ...colorPreviewStyle,
                      background: localColors[color.key],
                    }}
                    onClick={() => {
                      const input = document.getElementById(`color-${color.key}`) as HTMLInputElement;
                      input?.click();
                    }}
                  />
                  <input
                    id={`color-${color.key}`}
                    type="color"
                    value={localColors[color.key]}
                    onChange={(e) => handleColorChange(color.key, e.target.value)}
                    style={colorInputStyle}
                  />
                  <input
                    type="text"
                    value={localColors[color.key]}
                    onChange={(e) => handleColorChange(color.key, e.target.value)}
                    style={colorInputStyle}
                    placeholder="#667eea"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThemeSettings;

