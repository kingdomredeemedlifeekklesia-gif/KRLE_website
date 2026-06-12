import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import AboutHostPastor from "@/components/About/AboutHostPastor";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Kingdom Redeemed Life Ecclesia",
  description: "Learn about our church mission, values, and community ministries.",
  // other metadata
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="About Us"
        description="Explore the heart of our church: worship, community, discipleship, and outreach."
      />
      <AboutSectionOne />
      <AboutSectionTwo />
      <AboutHostPastor />
    </>
  );
};

export default AboutPage;
