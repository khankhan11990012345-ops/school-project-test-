import { Save } from 'lucide-react';
import { CreateForm, FormField, FormSection } from '../../../components/Form';

const AddBranch = () => {
  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Branch Name',
      type: 'text',
      required: true,
      placeholder: 'Enter branch name',
      halfWidth: true,
    },
    {
      name: 'code',
      label: 'Branch Code',
      type: 'text',
      required: true,
      placeholder: 'e.g., MAIN-001',
      halfWidth: true,
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea',
      required: true,
      placeholder: 'Enter branch address',
      rows: 3,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: 'Enter phone number',
      halfWidth: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Enter email address',
      halfWidth: true,
    },
    {
      name: 'establishedDate',
      label: 'Established Date',
      type: 'date',
      required: true,
    },
    {
      name: 'principalName',
      label: 'Principal Name',
      type: 'text',
      required: true,
      placeholder: 'Enter principal name',
    },
    {
      name: 'principalEmail',
      label: 'Principal Email',
      type: 'email',
      placeholder: 'Enter principal email',
      halfWidth: true,
    },
    {
      name: 'principalPhone',
      label: 'Principal Phone',
      type: 'tel',
      placeholder: 'Enter principal phone',
      halfWidth: true,
    },
  ];

  const sections: FormSection[] = [
    {
      title: 'Branch Information',
      fieldNames: ['name', 'code', 'address', 'phone', 'email', 'establishedDate'],
    },
    {
      title: 'Principal Information',
      fieldNames: ['principalName', 'principalEmail', 'principalPhone'],
    },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    alert('Branch added successfully!');
    console.log('Branch data:', data);
  };

  return (
    <CreateForm
      title="Add New Branch"
      fields={fields}
      sections={sections}
      onSubmit={handleSubmit}
      submitButtonText="Add Branch"
      submitButtonIcon={<Save size={18} />}
    />
  );
};

export default AddBranch;

