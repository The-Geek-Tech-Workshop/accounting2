import SyncTool from "../SyncTool";
import { syncEbayDate } from "../../lib/apis/ebay";

const EbaySyncTool = () => <SyncTool onSync={syncEbayDate} />;

export default EbaySyncTool;
