import { 
  ViewButton, 
  PrintButton, 
  EditButton, 
  DeleteButton, 
  ApproveButton,
  ViewIcon,
  PrintIcon,
  EditIcon,
  DeleteIcon,
  ApproveIcon
} from '../../../components/Button/iconbuttons';
import { Card } from '../../../components/Card';
import '../../../styles/universal.css';

const IconButtonExamples = () => {
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

  const iconDisplayStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    alignItems: 'center',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '0.5rem',
  };

  const iconItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Icon Button Component Examples</h1>
        <p style={subtitleStyle}>
          Reusable Icon Button components from <code>components/Button/iconbuttons</code> folder
        </p>
      </div>

      {/* Icons Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Available Icons</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={iconDisplayStyle}>
            <div style={iconItemStyle}>
              <ViewIcon size={32} />
              <span style={{ fontSize: '0.875rem', color: '#666' }}>ViewIcon</span>
            </div>
            <div style={iconItemStyle}>
              <PrintIcon size={32} />
              <span style={{ fontSize: '0.875rem', color: '#666' }}>PrintIcon</span>
            </div>
            <div style={iconItemStyle}>
              <EditIcon size={32} />
              <span style={{ fontSize: '0.875rem', color: '#666' }}>EditIcon</span>
            </div>
            <div style={iconItemStyle}>
              <DeleteIcon size={32} />
              <span style={{ fontSize: '0.875rem', color: '#666' }}>DeleteIcon</span>
            </div>
            <div style={iconItemStyle}>
              <ApproveIcon size={32} />
              <span style={{ fontSize: '0.875rem', color: '#666' }}>ApproveIcon</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Icon Buttons Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Icon Buttons</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Basic Icon Buttons</div>
            <div style={buttonGroupStyle}>
              <ViewButton onClick={() => alert('View clicked')} />
              <PrintButton onClick={() => alert('Print clicked')} />
              <EditButton onClick={() => alert('Edit clicked')} />
              <DeleteButton onClick={() => alert('Delete clicked')} />
              <ApproveButton onClick={() => alert('Approve clicked')} />
            </div>
            <div style={codeBlockStyle}>
              {`<ViewButton onClick={() => handleView()} />
<PrintButton onClick={() => handlePrint()} />
<EditButton onClick={() => handleEdit()} />
<DeleteButton onClick={() => handleDelete()} />
<ApproveButton onClick={() => handleApprove()} />`}
            </div>
          </div>
        </Card>
      </div>

      {/* Sizes Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Icon Button Sizes</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Small (sm)</div>
            <div style={buttonGroupStyle}>
              <ViewButton size="sm" onClick={() => {}} />
              <PrintButton size="sm" onClick={() => {}} />
              <EditButton size="sm" onClick={() => {}} />
              <DeleteButton size="sm" onClick={() => {}} />
              <ApproveButton size="sm" onClick={() => {}} />
            </div>
            <div style={codeBlockStyle}>
              {`<ViewButton size="sm" onClick={handleClick} />
<EditButton size="sm" onClick={handleClick} />
<DeleteButton size="sm" onClick={handleClick} />`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Medium (md)</div>
            <div style={buttonGroupStyle}>
              <ViewButton size="md" onClick={() => {}} />
              <PrintButton size="md" onClick={() => {}} />
              <EditButton size="md" onClick={() => {}} />
              <DeleteButton size="md" onClick={() => {}} />
              <ApproveButton size="md" onClick={() => {}} />
            </div>
            <div style={codeBlockStyle}>
              {`<ViewButton size="md" onClick={handleClick} />
<EditButton size="md" onClick={handleClick} />
<DeleteButton size="md" onClick={handleClick} />`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Large (lg)</div>
            <div style={buttonGroupStyle}>
              <ViewButton size="lg" onClick={() => {}} />
              <PrintButton size="lg" onClick={() => {}} />
              <EditButton size="lg" onClick={() => {}} />
              <DeleteButton size="lg" onClick={() => {}} />
              <ApproveButton size="lg" onClick={() => {}} />
            </div>
            <div style={codeBlockStyle}>
              {`<ViewButton size="lg" onClick={handleClick} />
<EditButton size="lg" onClick={handleClick} />
<DeleteButton size="lg" onClick={handleClick} />`}
            </div>
          </div>
        </Card>
      </div>

      {/* Variants Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Icon Button Variants</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>View Button Variants</div>
            <div style={buttonGroupStyle}>
              <ViewButton variant="primary" onClick={() => {}} />
              <ViewButton variant="secondary" onClick={() => {}} />
              <ViewButton variant="outline" onClick={() => {}} />
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Edit Button Variants</div>
            <div style={buttonGroupStyle}>
              <EditButton variant="primary" onClick={() => {}} />
              <EditButton variant="secondary" onClick={() => {}} />
              <EditButton variant="outline" onClick={() => {}} />
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Delete Button Variants</div>
            <div style={buttonGroupStyle}>
              <DeleteButton variant="danger" onClick={() => {}} />
              <DeleteButton variant="outline" onClick={() => {}} />
              <DeleteButton variant="secondary" onClick={() => {}} />
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Approve Button Variants</div>
            <div style={buttonGroupStyle}>
              <ApproveButton variant="success" onClick={() => {}} />
              <ApproveButton variant="primary" onClick={() => {}} />
              <ApproveButton variant="outline" onClick={() => {}} />
            </div>
          </div>
        </Card>
      </div>

      {/* States Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Icon Button States</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Disabled State</div>
            <div style={buttonGroupStyle}>
              <ViewButton disabled onClick={() => {}} />
              <EditButton disabled onClick={() => {}} />
              <DeleteButton disabled onClick={() => {}} />
              <ApproveButton disabled onClick={() => {}} />
              <PrintButton disabled onClick={() => {}} />
            </div>
            <div style={codeBlockStyle}>
              {`<ViewButton disabled onClick={handleClick} />
<EditButton disabled onClick={handleClick} />
<DeleteButton disabled onClick={handleClick} />`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Loading State</div>
            <div style={buttonGroupStyle}>
              <ViewButton isLoading onClick={() => {}} />
              <EditButton isLoading onClick={() => {}} />
              <DeleteButton isLoading onClick={() => {}} />
              <ApproveButton isLoading onClick={() => {}} />
            </div>
            <div style={codeBlockStyle}>
              {`<ViewButton isLoading onClick={handleClick} />
<EditButton isLoading onClick={handleClick} />
<DeleteButton isLoading onClick={handleClick} />`}
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Examples Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Common Usage Examples</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={groupStyle}>
            <div style={groupLabelStyle}>Table Row Actions</div>
            <div style={buttonGroupStyle}>
              <ViewButton size="sm" onClick={() => {}} title="View Details" />
              <EditButton size="sm" onClick={() => {}} title="Edit Record" />
              <DeleteButton size="sm" onClick={() => {}} title="Delete Record" />
              <ApproveButton size="sm" onClick={() => {}} title="Approve" />
            </div>
            <div style={codeBlockStyle}>
              {`// In a table row
<ViewButton size="sm" onClick={() => viewRecord(id)} />
<EditButton size="sm" onClick={() => editRecord(id)} />
<DeleteButton size="sm" onClick={() => deleteRecord(id)} />
<ApproveButton size="sm" onClick={() => approveRecord(id)} />`}
            </div>
          </div>

          <div style={groupStyle}>
            <div style={groupLabelStyle}>Card Actions</div>
            <div style={buttonGroupStyle}>
              <ViewButton size="md" onClick={() => {}} />
              <PrintButton size="md" onClick={() => {}} />
              <EditButton size="md" onClick={() => {}} />
            </div>
            <div style={codeBlockStyle}>
              {`// In a card component
<ViewButton size="md" onClick={handleView} />
<PrintButton size="md" onClick={handlePrint} />
<EditButton size="md" onClick={handleEdit} />`}
            </div>
          </div>
        </Card>
      </div>

      {/* Props Documentation */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Component Props</h2>
        
        <Card variant="custom" style={cardStyle}>
          <div style={codeBlockStyle}>
            {`interface IconButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  title?: string;
}`}
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              Props Description:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>onClick:</strong> Click handler function
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>variant:</strong> Button style variant (default varies by button type)
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>size:</strong> Button size (default: 'sm')
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>disabled:</strong> Disables the button (default: false)
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>isLoading:</strong> Shows loading spinner (default: false)
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                <strong>title:</strong> Tooltip text (default: button name)
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IconButtonExamples;

