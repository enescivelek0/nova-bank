import type { Metadata } from "next";
import { TransferFlow } from "./transfer-flow";

export const metadata: Metadata = { title: "Para Gönder" };

export default function Page() {
  return <TransferFlow />;
}
