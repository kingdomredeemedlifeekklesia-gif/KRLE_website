import Breadcrumb from "@/components/Common/Breadcrumb";
import Gallery from "@/components/Gallery";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | Kingdom Redeemed Life Ecclesia",
  description: "View our collection of programs, services, and ministry photos.",
};

const GalleryPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Gallery"
        description="Explore our collection of photos from programs, services, and ministry activities."
      />

      <Gallery />
    </>
  );
};

export default GalleryPage;