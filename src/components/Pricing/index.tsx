"use client";
import SectionTitle from "../Common/SectionTitle";
import OfferList from "./OfferList";
import PricingBox from "./PricingBox";

const Pricing = () => {
  return (
    <section id="pricing" className="relative z-10 py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="Support the Church"
          paragraph="Choose a giving plan that helps sustain our ministries, outreach, and gospel work in the city, including Covenant Seed monthly card deduction for committed supporters."
          center
          width="665px"
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          <PricingBox
            packageName="Tithe"
            subtitle="Give with gratitude to sustain worship, discipleship, and ministry care."
            scripture="Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this, says the Lord of hosts, if I will not open the windows of heaven for you."
            scriptureRef="Malachi 3:10"
          >
            <OfferList text="Joyful stewardship" status="active" />
            <OfferList text="Church support" status="active" />
            <OfferList text="Spiritual growth" status="inactive" />
            <OfferList text="Community care" status="inactive" />
          </PricingBox>
          <PricingBox
            packageName="Offertory"
            subtitle="Bless the church with an offering that helps serve families and outreach."
            scripture="Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver."
            scriptureRef="2 Corinthians 9:7"
          >
            <OfferList text="Community impact" status="active" />
            <OfferList text="Prayer support" status="active" />
            <OfferList text="Mission care" status="active" />
            <OfferList text="Event blessing" status="inactive" />
          </PricingBox>
          <PricingBox
            packageName="Thanksgiving"
            subtitle="Partner in thanksgiving ministry to bless our celebrations and outreach."
            scripture="You will be enriched in every way to be generous in every way, which through us will produce thanksgiving to God."
            scriptureRef="2 Corinthians 9:11"
          >
            <OfferList text="Thanksgiving support" status="active" />
            <OfferList text="Program blessing" status="active" />
            <OfferList text="Community celebration" status="active" />
            <OfferList text="Legacy giving" status="inactive" />
          </PricingBox>
          <PricingBox
            packageName="Covenant"
            subtitle="monthly card deduction and support the church through Covenant Seed."
            scripture="And let us not grow weary of doing good, for in due season we will reap, if we do not give up."
            scriptureRef="Galatians 6:9"
          >
            <OfferList text="Monthly card deduction" status="active" />
            <OfferList text="Covenant member care" status="active" />
            <OfferList text="Reliable church support" status="active" />
            <OfferList text="Priority follow-up" status="inactive" />
          </PricingBox>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 z-[-1]">
        <svg
          width="239"
          height="601"
          viewBox="0 0 239 601"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            opacity="0.3"
            x="-184.451"
            y="600.973"
            width="196"
            height="541.607"
            rx="2"
            transform="rotate(-128.7 -184.451 600.973)"
            fill="url(#paint0_linear_93:235)"
          />
          <rect
            opacity="0.3"
            x="-188.201"
            y="385.272"
            width="59.7544"
            height="541.607"
            rx="2"
            transform="rotate(-128.7 -188.201 385.272)"
            fill="url(#paint1_linear_93:235)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_93:235"
              x1="-90.1184"
              y1="420.414"
              x2="-90.1184"
              y2="1131.65"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_93:235"
              x1="-159.441"
              y1="204.714"
              x2="-159.441"
              y2="915.952"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4A6CF7" />
              <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Pricing;
