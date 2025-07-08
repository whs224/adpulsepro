import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [creditEdit, setCreditEdit] = useState<{ [userId: string]: number }>({});
  const [planEdit, setPlanEdit] = useState<{ [userId: string]: string }>({});

  useEffect(() => {
    if (user?.email === "willsiwinski@gmail.com") {
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u => 
        (u.user_email && u.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // First get all user credits with profile data
      const { data: userCreditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, plan_name, total_credits, used_credits, is_active');
      
      if (creditsError) {
        console.error('Error loading user credits:', creditsError);
        toast({ title: 'Error loading user credits', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Get profile data separately to avoid join issues
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Get auth users data using service role
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      // Combine the data
      const combinedData = userCreditsData?.map(credit => {
        const profile = profilesData?.find(p => p.id === credit.user_id);
        const authUser = authUsers?.users?.find(u => u.id === credit.user_id);
        
        return {
          ...credit,
          full_name: profile?.full_name || 'No name',
          user_email: authUser?.email || 'No email'
        };
      }) || [];

      console.log('Combined user data:', combinedData);
      setUsers(combinedData);
      setFilteredUsers(combinedData);
    } catch (error) {
      console.error('Error in loadUsers:', error);
      toast({ title: 'Error loading users', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleCreditChange = (userId: string, value: number) => {
    setCreditEdit(prev => ({ ...prev, [userId]: value }));
  };

  const handlePlanChange = (userId: string, value: string) => {
    setPlanEdit(prev => ({ ...prev, [userId]: value }));
  };

  const updateCredits = async (userId: string) => {
    setLoading(true);
    const credits = creditEdit[userId];
    await supabase.from('user_credits').update({ total_credits: credits }).eq('user_id', userId);
    toast({ title: 'Credits updated' });
    loadUsers();
    setLoading(false);
  };

  const updatePlan = async (userId: string) => {
    setLoading(true);
    const plan = planEdit[userId];
    await supabase.from('user_credits').update({ plan_name: plan }).eq('user_id', userId);
    toast({ title: 'Plan updated' });
    loadUsers();
    setLoading(false);
  };

  const deleteUser = async (userId: string) => {
    setLoading(true);
    await supabase.from('user_credits').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    // Optionally, call Supabase admin API to delete from auth.users
    toast({ title: 'User deleted' });
    loadUsers();
    setLoading(false);
  };

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
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by email, name, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 max-w-md"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Refresh Button */}
            <Button onClick={loadUsers} className="mb-4" disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Users'}
            </Button>

            {/* Users Table */}
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
                  {filteredUsers.map(u => (
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
                            onChange={e => handlePlanChange(u.user_id, e.target.value)} 
                            className="w-32" 
                          />
                          <Button size="sm" onClick={() => updatePlan(u.user_id)} className="whitespace-nowrap">
                            Update
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            value={creditEdit[u.user_id] ?? u.total_credits} 
                            onChange={e => handleCreditChange(u.user_id, Number(e.target.value))} 
                            className="w-24" 
                          />
                          <Button size="sm" onClick={() => updateCredits(u.user_id)} className="whitespace-nowrap">
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
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteUser(u.user_id)}
                          className="whitespace-nowrap"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin; 