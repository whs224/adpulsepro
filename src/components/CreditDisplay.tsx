
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Users, Calendar } from "lucide-react";
import { getUserCredits, UserCredits } from "@/services/creditService";
import { useAuth } from "@/contexts/AuthContext";

const CreditDisplay = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCredits();
    }
  }, [user]);

  const loadCredits = async () => {
    try {
      const userCredits = await getUserCredits();
      setCredits(userCredits);
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  if (!credits) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">Unable to load credit information</p>
        </CardContent>
      </Card>
    );
  }

  const isLowCredits = credits.remaining_credits <= 10;
  const cycleEndDate = new Date(credits.billing_cycle_end).toLocaleDateString();

  return (
    <Card className={`${isLowCredits ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-900">
              {credits.remaining_credits} credits remaining
            </span>
          </div>
          <Badge variant={credits.plan_name === 'growth' ? 'default' : 'secondary'}>
            {credits.plan_name}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Max {credits.max_team_members} team members</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Resets {cycleEndDate}</span>
          </div>
        </div>

        {isLowCredits && (
          <p className="text-yellow-700 text-xs">
            You're running low on credits. Consider upgrading your plan.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditDisplay;
