import type { Metadata } from "next";
import { Accounts } from "./accounts";

export const metadata: Metadata = { title: "Hesaplarım" };

export default function Page() {
  return <Accounts />;
}
