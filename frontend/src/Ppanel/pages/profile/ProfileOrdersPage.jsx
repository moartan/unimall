import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePpanel } from "../../context/PpanelProvider";
import ProfileShell from "./ProfileShell";
import Orders from "../orders/Orders.jsx";

export default function ProfileOrdersPage() {
  const navigate = useNavigate();
  const { user, loading, logout } = usePpanel();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const displayName = useMemo(() => user?.name || user?.fullName || user?.email || "", [user]);

  const handleTabSelect = (tabKey) => {
    navigate(`/profile?tab=${tabKey}`);
  };

  return (
    <ProfileShell
      user={user}
      displayName={displayName}
      activeKey="orders"
      onSelectTab={handleTabSelect}
      logout={logout}
    >
      <Orders embedded />
    </ProfileShell>
  );
}
