
import ManagementPage from "../dashboard/ManagementPage";

export default function ManageUsers() {
  return (
    <ManagementPage
      resource="users"
      eyebrow="ACCOUNT MANAGEMENT"
      title="Users"
      description="Manage customer, partner and staff account access."
      backTo="/admin"
      columns={[
        "Name",
        "Account role",
        "Contact",
        "Status",
        "Actions",
      ]}
      note="Manage registered accounts and their active status."
    />
  );
}
