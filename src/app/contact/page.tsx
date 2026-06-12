import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Kingdom Redeemed Life Ecclesia",
  description: "Get in touch with our church office, plan your visit, or ask for prayer.",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact"
        description="Have questions or want to visit? Reach out and our team will connect with you soon."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
