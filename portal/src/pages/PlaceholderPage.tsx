import './PlaceholderPage.css';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-icon">🚧</div>
        <h2>Coming Soon</h2>
        {description && <p>{description}</p>}
        <p className="placeholder-note">This page is under development and will be available soon.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;

