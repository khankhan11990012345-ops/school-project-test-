import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import '../../../styles/universal.css';

const BadgeExamples = () => {
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

  const badgeGroupStyle: React.CSSProperties = {
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
        <h1 style={titleStyle}>Badge Component Examples</h1>
        <p style={subtitleStyle}>
          Reusable Badge component from <code>components/Badge</code> folder
        </p>
      </div>

      {/* Status Badges Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Status Badges</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Status Variants</div>
            <div style={badgeGroupStyle}>
              <Badge variant="pending">Pending</Badge>
              <Badge variant="approved">Approved</Badge>
              <Badge variant="active">Active</Badge>
              <Badge variant="rejected">Rejected</Badge>
              <Badge variant="late">Late</Badge>
              <Badge variant="absent">Absent</Badge>
              <Badge variant="onLeave">On Leave</Badge>
            </div>
            <div style={codeBlockStyle}>
              {`<Badge variant="pending">Pending</Badge>
<Badge variant="approved">Approved</Badge>
<Badge variant="active">Active</Badge>
<Badge variant="rejected">Rejected</Badge>
<Badge variant="late">Late</Badge>
<Badge variant="absent">Absent</Badge>
<Badge variant="onLeave">On Leave</Badge>`}
            </div>
          </div>
        </Card>
      </div>

      {/* Standard Variants Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Standard Variants</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Basic Variants</div>
            <div style={badgeGroupStyle}>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div style={codeBlockStyle}>
              {`<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>`}
            </div>
          </div>
        </Card>
      </div>

      {/* Sizes Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Badge Sizes</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Small (sm)</div>
            <div style={badgeGroupStyle}>
              <Badge variant="pending" size="sm">Pending</Badge>
              <Badge variant="approved" size="sm">Approved</Badge>
              <Badge variant="active" size="sm">Active</Badge>
              <Badge variant="rejected" size="sm">Rejected</Badge>
            </div>
            <div style={codeBlockStyle}>
              {`<Badge variant="pending" size="sm">Pending</Badge>
<Badge variant="approved" size="sm">Approved</Badge>
<Badge variant="active" size="sm">Active</Badge>
<Badge variant="rejected" size="sm">Rejected</Badge>`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Medium (md) - Default</div>
            <div style={badgeGroupStyle}>
              <Badge variant="pending" size="md">Pending</Badge>
              <Badge variant="approved" size="md">Approved</Badge>
              <Badge variant="active" size="md">Active</Badge>
              <Badge variant="rejected" size="md">Rejected</Badge>
            </div>
            <div style={codeBlockStyle}>
              {`<Badge variant="pending" size="md">Pending</Badge>
<Badge variant="approved" size="md">Approved</Badge>
<Badge variant="active" size="md">Active</Badge>
<Badge variant="rejected" size="md">Rejected</Badge>`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Large (lg)</div>
            <div style={badgeGroupStyle}>
              <Badge variant="pending" size="lg">Pending</Badge>
              <Badge variant="approved" size="lg">Approved</Badge>
              <Badge variant="active" size="lg">Active</Badge>
              <Badge variant="rejected" size="lg">Rejected</Badge>
            </div>
            <div style={codeBlockStyle}>
              {`<Badge variant="pending" size="lg">Pending</Badge>
<Badge variant="approved" size="lg">Approved</Badge>
<Badge variant="active" size="lg">Active</Badge>
<Badge variant="rejected" size="lg">Rejected</Badge>`}
            </div>
          </div>
        </Card>
      </div>

      {/* Rounded Badges Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Rounded Badges</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Rounded Status Badges</div>
            <div style={badgeGroupStyle}>
              <Badge variant="pending" rounded>Pending</Badge>
              <Badge variant="approved" rounded>Approved</Badge>
              <Badge variant="active" rounded>Active</Badge>
              <Badge variant="rejected" rounded>Rejected</Badge>
              <Badge variant="late" rounded>Late</Badge>
              <Badge variant="absent" rounded>Absent</Badge>
              <Badge variant="onLeave" rounded>On Leave</Badge>
            </div>
            <div style={codeBlockStyle}>
              {`<Badge variant="pending" rounded>Pending</Badge>
<Badge variant="approved" rounded>Approved</Badge>
<Badge variant="active" rounded>Active</Badge>
<Badge variant="rejected" rounded>Rejected</Badge>
<Badge variant="late" rounded>Late</Badge>
<Badge variant="absent" rounded>Absent</Badge>
<Badge variant="onLeave" rounded>On Leave</Badge>`}
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Examples Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Common Usage Examples</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Attendance Status</div>
            <div style={badgeGroupStyle}>
              <Badge variant="active">Present</Badge>
              <Badge variant="absent">Absent</Badge>
              <Badge variant="late">Late</Badge>
              <Badge variant="onLeave">On Leave</Badge>
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Application Status</div>
            <div style={badgeGroupStyle}>
              <Badge variant="pending">Pending</Badge>
              <Badge variant="approved">Approved</Badge>
              <Badge variant="rejected">Rejected</Badge>
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Record Status</div>
            <div style={badgeGroupStyle}>
              <Badge variant="active">Active</Badge>
              <Badge variant="secondary">Inactive</Badge>
              <Badge variant="warning">Pending Review</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Props Documentation */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Component Props</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={codeBlockStyle}>
            {`interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 
           'pending' | 'approved' | 'active' | 'rejected' | 'late' | 'absent' | 'onLeave';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  style?: CSSProperties;
}`}
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              Props Description:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>variant:</strong> Badge style variant (default: 'primary')
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>size:</strong> Badge size (default: 'md')
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>rounded:</strong> Makes badge fully rounded (default: false)
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>children:</strong> Badge content (text)
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>className:</strong> Additional CSS classes
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>style:</strong> Inline styles
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BadgeExamples;

