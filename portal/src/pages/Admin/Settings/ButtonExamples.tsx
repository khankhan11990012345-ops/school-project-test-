import { useState } from 'react';
import { Save, Trash2, Edit, Plus, Check, X, Download, Upload } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import '../../../styles/universal.css';

const ButtonExamples = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 600,
    color: '#333',
    margin: 0,
    marginBottom: '0.5rem',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '3rem',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#333',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e0e0e0',
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const groupStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const groupLabelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#666',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'center',
  };

  const codeBlockStyle: React.CSSProperties = {
    background: '#f5f5f5',
    padding: '1rem',
    borderRadius: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: '#333',
    marginTop: '1rem',
    overflowX: 'auto',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Button Component Examples</h1>
        <p style={subtitleStyle}>
          Reusable Button component from <code>components/Button</code> folder
        </p>
      </div>

      {/* Variants Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Button Variants</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Primary Button</div>
            <div style={buttonGroupStyle}>
              <Button variant="primary">
                <Save size={18} />
                Primary Button
              </Button>
              <Button variant="primary" disabled>
                Primary Disabled
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="primary">
  <Save size={18} />
  Primary Button
</Button>`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Secondary Button</div>
            <div style={buttonGroupStyle}>
              <Button variant="secondary">
                <Edit size={18} />
                Secondary Button
              </Button>
              <Button variant="secondary" disabled>
                Secondary Disabled
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="secondary">
  <Edit size={18} />
  Secondary Button
</Button>`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Danger Button</div>
            <div style={buttonGroupStyle}>
              <Button variant="danger">
                <Trash2 size={18} />
                Danger Button
              </Button>
              <Button variant="danger" disabled>
                Danger Disabled
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="danger">
  <Trash2 size={18} />
  Danger Button
</Button>`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Success Button</div>
            <div style={buttonGroupStyle}>
              <Button variant="success">
                <Check size={18} />
                Success Button
              </Button>
              <Button variant="success" disabled>
                Success Disabled
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="success">
  <Check size={18} />
  Success Button
</Button>`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Outline Button</div>
            <div style={buttonGroupStyle}>
              <Button variant="outline">
                <Download size={18} />
                Outline Button
              </Button>
              <Button variant="outline" disabled>
                Outline Disabled
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="outline">
  <Download size={18} />
  Outline Button
</Button>`}
            </div>
          </div>
        </Card>
      </div>

      {/* Sizes Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Button Sizes</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Small (sm)</div>
            <div style={buttonGroupStyle}>
              <Button variant="primary" size="sm">
                <Plus size={14} />
                Small Button
              </Button>
              <Button variant="secondary" size="sm">
                Small Secondary
              </Button>
              <Button variant="danger" size="sm">
                Small Danger
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="primary" size="sm">
  <Plus size={14} />
  Small Button
</Button>`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Medium (md) - Default</div>
            <div style={buttonGroupStyle}>
              <Button variant="primary" size="md">
                <Save size={18} />
                Medium Button
              </Button>
              <Button variant="secondary" size="md">
                Medium Secondary
              </Button>
              <Button variant="danger" size="md">
                Medium Danger
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="primary" size="md">
  <Save size={18} />
  Medium Button
</Button>`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Large (lg)</div>
            <div style={buttonGroupStyle}>
              <Button variant="primary" size="lg">
                <Upload size={20} />
                Large Button
              </Button>
              <Button variant="secondary" size="lg">
                Large Secondary
              </Button>
              <Button variant="danger" size="lg">
                Large Danger
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="primary" size="lg">
  <Upload size={20} />
  Large Button
</Button>`}
            </div>
          </div>
        </Card>
      </div>

      {/* States Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Button States</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Loading State</div>
            <div style={buttonGroupStyle}>
              <Button variant="primary" isLoading={isLoading} onClick={handleLoadingDemo}>
                <Save size={18} />
                {isLoading ? 'Loading...' : 'Click to Load'}
              </Button>
              <Button variant="secondary" isLoading={isLoading}>
                Secondary Loading
              </Button>
              <Button variant="danger" isLoading={isLoading}>
                Danger Loading
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="primary" isLoading={isLoading}>
  <Save size={18} />
  Loading Button
</Button>`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Disabled State</div>
            <div style={buttonGroupStyle}>
              <Button variant="primary" disabled>
                Disabled Primary
              </Button>
              <Button variant="secondary" disabled>
                Disabled Secondary
              </Button>
              <Button variant="danger" disabled>
                Disabled Danger
              </Button>
              <Button variant="success" disabled>
                Disabled Success
              </Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="primary" disabled>
  Disabled Button
</Button>`}
            </div>
          </div>
        </Card>
      </div>

      {/* Full Width Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Full Width Buttons</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Full Width Button</div>
            <div style={{ width: '100%', maxWidth: '600px' }}>
              <Button variant="primary" fullWidth style={{ marginBottom: '1rem' }}>
                <Save size={18} />
                Full Width Primary
              </Button>
              <Button variant="secondary" fullWidth style={{ marginBottom: '1rem' }}>
                Full Width Secondary
              </Button>
              <Button variant="danger" fullWidth>
                Full Width Danger
              </Button>
            </div>
            <div style={codeBlockStyle}>
              {`<Button variant="primary" fullWidth>
  <Save size={18} />
  Full Width Button
</Button>`}
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Examples Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Common Usage Examples</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Form Actions</div>
            <div style={buttonGroupStyle}>
              <Button variant="primary">
                <Save size={18} />
                Save
              </Button>
              <Button variant="secondary">
                Cancel
              </Button>
              <Button variant="outline">
                Reset
              </Button>
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Table Actions</div>
            <div style={buttonGroupStyle}>
              <Button variant="primary" size="sm">
                <Edit size={14} />
                Edit
              </Button>
              <Button variant="danger" size="sm">
                <Trash2 size={14} />
                Delete
              </Button>
              <Button variant="outline" size="sm">
                <X size={14} />
                Cancel
              </Button>
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Page Actions</div>
            <div style={buttonGroupStyle}>
              <Button variant="primary" size="md">
                <Plus size={18} />
                Add New
              </Button>
              <Button variant="secondary" size="md">
                <Download size={18} />
                Export
              </Button>
              <Button variant="outline" size="md">
                <Upload size={18} />
                Import
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Props Documentation */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Component Props</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={codeBlockStyle}>
            {`interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}`}
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              Props Description:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>variant:</strong> Button style variant (default: 'primary')
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>size:</strong> Button size (default: 'md')
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>children:</strong> Button content (text, icons, etc.)
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>isLoading:</strong> Shows loading spinner (default: false)
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>fullWidth:</strong> Makes button full width (default: false)
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>disabled:</strong> Disables the button (inherited from HTMLButtonElement)
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ButtonExamples;

