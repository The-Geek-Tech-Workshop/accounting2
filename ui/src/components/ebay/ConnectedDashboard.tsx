import SyncTool from "./SyncTool";
import LedgerTable from "./LedgerTable";

const ConnectedDashboard = () => {
  return (
    <>
      <div>
        <SyncTool />
      </div>
      <div>
        <LedgerTable />
      </div>
    </>
  );
};

export default ConnectedDashboard;
