import { redirect } from "next/navigation";

export default function SermonDetailsPage() {
  // This route was removed by project decision; redirect to the sermons listing.
  redirect("/sermon");
}
