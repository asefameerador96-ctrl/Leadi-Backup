import Leaderboard from "@/components/Leaderboard";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const identityMessage =
    user?.role === "management"
      ? `Assalamualaikum, ${user.display_name} Sir`
      : user?.role === "tso"
        ? `Welcome, ${user.territory} Territory`
        : null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="relative">
      {/* Top Right Controls */}
      <div className="fixed top-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
        {isAuthenticated && identityMessage && (
          <div className="rounded-lg border border-border bg-background/85 px-4 py-2 text-right shadow-sm backdrop-blur-sm">
            <p className="text-sm font-semibold text-foreground">{identityMessage}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          {/* Admin Editor Button - Only for admins */}
          {isAdmin && (
            <Link to="/admin">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 rounded-full shadow-sm bg-background/80 backdrop-blur-sm border-amber-700/50 text-amber-400 hover:bg-amber-950/20"
              >
                <Settings className="w-4 h-4" />
                Editor
              </Button>
            </Link>
          )}

          {/* Logout Button */}
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 rounded-full shadow-sm bg-background/80 backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
      <Leaderboard />
    </div>
  );
};

export default Index;
