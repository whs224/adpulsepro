import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useUserSearch } from "@/hooks/useUserSearch";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminUserTable } from "@/components/admin/AdminUserTable";

const Admin = () => {
  const { user } = useAuth();
  
  const {
    users,
    loading,
    creditEdit,
    planEdit,
    loadUsers,
    handleCreditChange,
    handlePlanChange,
    updateCredits,
    updatePlan,
    deleteUser
  } = useAdminUsers();

  const { searchTerm, setSearchTerm, filteredUsers } = useUserSearch(users);

  if (user?.email !== "willsiwinski@gmail.com") {
    return <div className="p-8 text-center text-lg">Not authorized</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div className="text-center py-4">Loading users...</div>}
            
            <AdminSearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              userCount={filteredUsers.length}
            />

            <Button onClick={loadUsers} className="mb-4" disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Users'}
            </Button>

            <AdminUserTable
              users={filteredUsers}
              loading={loading}
              searchTerm={searchTerm}
              creditEdit={creditEdit}
              planEdit={planEdit}
              onCreditChange={handleCreditChange}
              onPlanChange={handlePlanChange}
              onUpdateCredits={updateCredits}
              onUpdatePlan={updatePlan}
              onDeleteUser={deleteUser}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;