import type { Metadata } from "next";
import { Cards } from "./cards";

export const metadata: Metadata = { title: "Kartlarım" };

export default function Page() {
  return <Cards />;
}
