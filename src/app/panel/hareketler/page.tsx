import type { Metadata } from "next";
import { History } from "./history";

export const metadata: Metadata = { title: "Hesap Hareketleri" };

export default function Page() {
  return <History />;
}
