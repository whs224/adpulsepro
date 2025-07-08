import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  userCount: number;
}

export const AdminSearchBar = ({ searchTerm, setSearchTerm, userCount }: AdminSearchBarProps) => {
  return (
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
        {userCount} user{userCount !== 1 ? 's' : ''} found
      </p>
    </div>
  );
};