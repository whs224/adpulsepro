import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminUser } from "@/hooks/useAdminUsers";
import { UserActionsCell } from "./UserActionsCell";

interface AdminUserTableProps {
  users: AdminUser[];
  loading: boolean;
  searchTerm: string;
  creditEdit: { [userId: string]: number };
  planEdit: { [userId: string]: string };
  onCreditChange: (userId: string, value: number) => void;
  onPlanChange: (userId: string, value: string) => void;
  onUpdateCredits: (userId: string) => void;
  onUpdatePlan: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onGiveCredits: (userId: string, credits: number) => void;
}

export const AdminUserTable = ({
  users,
  loading,
  searchTerm,
  creditEdit,
  planEdit,
  onCreditChange,
  onPlanChange,
  onUpdateCredits,
  onUpdatePlan,
  onDeleteUser,
  onGiveCredits
}: AdminUserTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border-b font-semibold">Email</th>
            <th className="p-3 border-b font-semibold">Name</th>
            <th className="p-3 border-b font-semibold">Plan</th>
            <th className="p-3 border-b font-semibold">Credits</th>
            <th className="p-3 border-b font-semibold">Used</th>
            <th className="p-3 border-b font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div className="text-sm">
                  <div className="font-medium">{u.user_email}</div>
                  <div className="text-gray-500 text-xs">{u.user_id}</div>
                </div>
              </td>
              <td className="p-3">{u.full_name}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Input 
                    value={planEdit[u.user_id] ?? u.plan_name} 
                    onChange={e => onPlanChange(u.user_id, e.target.value)} 
                    className="w-32" 
                  />
                  <Button size="sm" onClick={() => onUpdatePlan(u.user_id)} className="whitespace-nowrap">
                    Update
                  </Button>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={creditEdit[u.user_id] ?? u.total_credits} 
                    onChange={e => onCreditChange(u.user_id, Number(e.target.value))} 
                    className="w-24" 
                  />
                  <Button size="sm" onClick={() => onUpdateCredits(u.user_id)} className="whitespace-nowrap">
                    Update
                  </Button>
                </div>
              </td>
              <td className="p-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {u.used_credits}/{u.total_credits}
                </span>
              </td>
              <td className="p-3">
                <div className="flex flex-col gap-2">
                  <UserActionsCell user={u} onDelete={onDeleteUser} />
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="Credits to give" 
                      className="w-24 text-xs" 
                      id={`give-credits-${u.user_id}`}
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById(`give-credits-${u.user_id}`) as HTMLInputElement;
                        const credits = parseInt(input.value);
                        if (credits > 0) {
                          onGiveCredits(u.user_id, credits);
                          input.value = '';
                        }
                      }}
                      className="text-xs whitespace-nowrap"
                    >
                      Give Credits
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && !loading && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-gray-500">
                {searchTerm ? 'No users found matching your search.' : 'No users found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};