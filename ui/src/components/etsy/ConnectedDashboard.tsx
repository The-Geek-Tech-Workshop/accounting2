import SyncTool from "./SyncTool";
import DisconnectEtsy from "./DisconnectEtsy";
import TransactionList from "./TransactionList";

const ConnectedDashboard = () => {
  return (
    <>
      <div>
        <SyncTool />
        <DisconnectEtsy />
      </div>
      <div>
        <TransactionList />
      </div>
    </>
  );
};

export default ConnectedDashboard;
