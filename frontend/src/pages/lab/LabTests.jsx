import ManagementPage from "../dashboard/ManagementPage";

export default function LabTests() {
  return (
    <ManagementPage
      eyebrow="LAB CATALOGUE"
      title="My test listings"
      description="Review the tests your laboratory is approved to offer."
      backTo="/lab"
      columns={["Test", "Approved price", "Turnaround", "Availability", "Status"]}
      note="Only administrator-approved prices and active services should be shown to customers."
    />
  );
}