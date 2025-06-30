import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creditEdit, setCreditEdit] = useState<{ [userId: string]: number }>({});
  const [planEdit, setPlanEdit] = useState<{ [userId: string]: string }>({});

  useEffect(() => {
    if (user?.email === "willsiwinski@gmail.com") {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_credits')
      .select('user_id, plan_name, total_credits, used_credits, is_active, profiles:profiles(email)');
    if (data) setUsers(data);
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
            {loading && <div>Loading...</div>}
            <table className="w-full text-left border mt-4">
              <thead>
                <tr>
                  <th className="p-2">Email</th>
                  <th className="p-2">Plan</th>
                  <th className="p-2">Credits</th>
                  <th className="p-2">Used</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.user_id} className="border-t">
                    <td className="p-2">{u.profiles?.email || u.user_id}</td>
                    <td className="p-2">
                      <Input value={planEdit[u.user_id] ?? u.plan_name} onChange={e => handlePlanChange(u.user_id, e.target.value)} className="w-32" />
                      <Button size="sm" onClick={() => updatePlan(u.user_id)} className="ml-2">Update</Button>
                    </td>
                    <td className="p-2">
                      <Input type="number" value={creditEdit[u.user_id] ?? u.total_credits} onChange={e => handleCreditChange(u.user_id, Number(e.target.value))} className="w-24" />
                      <Button size="sm" onClick={() => updateCredits(u.user_id)} className="ml-2">Update</Button>
                    </td>
                    <td className="p-2">{u.used_credits}</td>
                    <td className="p-2">
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(u.user_id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin; 