import { fetchBrokersPublic } from "../_lib/actions/brokerActions";
import { DashboardClient } from "./Components/DashboardClient";

export default async function DashboardPage() {
  // Fetch data on the server - much more secure than doing it on useEffect
  const initialBrokers = await fetchBrokersPublic();

  return <DashboardClient initialBrokers={initialBrokers} />;
}
