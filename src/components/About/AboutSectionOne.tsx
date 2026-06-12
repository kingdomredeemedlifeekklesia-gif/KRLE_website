import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

const AboutSectionOne = () => {
  const missionPoints = [
    "To preach the gospel of redemption and kingdom transformation.",
    "To disciple believers to manifest Christ's life and light in every sphere of influence.",
    "To equip saints for ministry through teaching, mentorship, and the gifts of the Spirit.",
    "To build strong families and communities founded on Kingdom principles.",
    "To reveal the reality of God's Kingdom through love, service, and supernatural power.",
    "To partner with families and leaders to advance Kingdom influence in every area of society.",
  ];

  return (
    <section id="about" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 dark:border-white/[.15] md:pb-20 lg:pb-28">
          <div className="mb-12 text-center">
            <SectionTitle
              title="Our Vision & Mission"
              paragraph="To raise a generation of Kingdom-minded believers who are redeemed by grace, empowered by the Spirit, and living in dominion on earth."
              center
              width="665px"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {missionPoints.map((point, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-[0_20px_60px_rgba(74,108,247,0.1)] hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">{index + 1}</span>
                </div>
                <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionOne;
