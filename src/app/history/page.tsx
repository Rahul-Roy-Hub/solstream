import { currentUser } from "@clerk/nextjs/server";
import HistroyPage from "@/components/HistroyPage";
import { fetchUserTransactions } from "@/actions/transactionActions";
export default async function Page() {
  const user = await currentUser();
  if (!user) throw new Error("User not found");
  const userId = user.id;
  const res = await fetchUserTransactions(user.id);

  return (
    <HistroyPage
      initialTransactions={res.transactions || []}
      userId={userId.toString()}
    />
  );
}
