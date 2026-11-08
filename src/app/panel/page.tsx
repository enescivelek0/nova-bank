import type { Metadata } from "next";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = { title: "Özet" };

export default function Page() {
  return <Dashboard />;
}
