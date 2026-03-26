import SyncTool from "../SyncTool";
import { syncEtsyLedgerEntries } from "../../lib/apis/etsy";

const EtsySyncTool = () => (
  <SyncTool
    onSync={syncEtsyLedgerEntries}
    invalidateQueryKey="etsyLedgerEntries"
  />
);

export default EtsySyncTool;
