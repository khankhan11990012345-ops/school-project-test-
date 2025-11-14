import { ArrowRightLeft, Building2 } from 'lucide-react';
import { ViewButton, ApproveButton, DeleteButton } from '../../../components/Button/iconbuttons';
import { Badge } from '../../../components/Badge';
import '../../../styles/universal.css';
import './Branches.css';

const BranchTransfer = () => {
  const transfers = [
    {
      id: 1,
      studentName: 'Alice Johnson',
      fromBranch: 'Main Campus',
      toBranch: 'North Branch',
      transferDate: '2024-03-15',
      reason: 'Family relocation',
      status: 'Pending',
    },
    {
      id: 2,
      studentName: 'Bob Williams',
      fromBranch: 'North Branch',
      toBranch: 'South Branch',
      transferDate: '2024-03-10',
      reason: 'Academic preference',
      status: 'Approved',
    },
    {
      id: 3,
      studentName: 'Charlie Brown',
      fromBranch: 'South Branch',
      toBranch: 'Main Campus',
      transferDate: '2024-03-05',
      reason: 'Better facilities',
      status: 'Completed',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Branch Transfer</h1>
        <button className="btn-primary">
          <ArrowRightLeft size={18} />
          New Transfer Request
        </button>
      </div>

      <div className="section-title">Transfer Requests</div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>From Branch</th>
              <th>To Branch</th>
              <th>Transfer Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id}>
                <td>
                  <strong>{transfer.studentName}</strong>
                </td>
                <td>
                  <div className="branch-info-small">
                    <Building2 size={14} />
                    {transfer.fromBranch}
                  </div>
                </td>
                <td>
                  <div className="branch-info-small">
                    <Building2 size={14} />
                    {transfer.toBranch}
                  </div>
                </td>
                <td>{transfer.transferDate}</td>
                <td>{transfer.reason}</td>
                <td>
                  <Badge variant={transfer.status.toLowerCase() === 'approved' ? 'approved' : transfer.status.toLowerCase() === 'pending' ? 'pending' : 'rejected'} size="sm">
                    {transfer.status}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {transfer.status === 'Pending' && (
                      <>
                        <ApproveButton size="sm" onClick={() => console.log('Approve', transfer.id)} />
                        <DeleteButton size="sm" onClick={() => console.log('Reject', transfer.id)} />
                      </>
                    )}
                    <ViewButton size="sm" onClick={() => console.log('View', transfer.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchTransfer;

