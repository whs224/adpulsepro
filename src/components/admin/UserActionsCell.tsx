import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface UserActionsCellProps {
  user: {
    user_id: string;
    user_email: string;
    full_name: string;
  };
  onDelete: (userId: string) => void;
}

export const UserActionsCell = ({ user, onDelete }: UserActionsCellProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size="sm" 
          variant="destructive" 
          className="whitespace-nowrap"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this user account? This action will:
            <br />• Remove all user data and credits
            <br />• Delete their profile information
            <br />• This action cannot be undone
            <br /><br />
            <strong>User:</strong> {user.user_email}
            <br />
            <strong>Name:</strong> {user.full_name}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => onDelete(user.user_id)}
            className="bg-red-600 hover:bg-red-700"
          >
            Yes, Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};