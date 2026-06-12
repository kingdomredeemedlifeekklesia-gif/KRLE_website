import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SectionTitle from "@/components/Common/SectionTitle";

export const metadata: Metadata = {
  title: "Our Ministries | Kingdom Redeemed Life Ecclesia",
  description: "Explore our church ministries and find ways to get involved in our faith community.",
};

interface MinistryItem {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  activities: string[];
  leader: string;
  icon: string;
}

const ministries: MinistryItem[] = [
  {
    id: 1,
    title: "Pastoral Leadership",
    description: "Spiritual guidance and care for our church family",
    longDescription:
      "Our pastoral team provides compassionate leadership, biblical teaching, and hands-on care that helps every member grow in their faith.",
    image: "/images/ministries/pastors.jpg",
    activities: [
      "Sermon preparation and teaching",
      "Counseling and prayer support",
      "Leadership development",
      "Vision casting and strategy",
      "Member care visits",
    ],
    leader: "Pastor Adraku Mawutor Anthony",
    icon: "🙏",
  },
  {
    id: 2,
    title: "Worship & Praise",
    description: "Leading worship that connects hearts to God",
    longDescription:
      "The worship ministry creates powerful, authentic worship experiences through song, music, and celebration that draw our congregation closer to God.",
    image: "/images/ministries/triumphtabernaclesingers.jpg",
    activities: [
      "Band and choir rehearsals",
      "Worship nights and services",
      "Song selection and planning",
      "Special music events",
      "Team training and development",
    ],
    leader: "Minister Adrake Bless",
    icon: "🎵",
  },
  {
    id: 3,
    title: "Media & Outreach",
    description: "Sharing the gospel across digital platforms",
    longDescription:
      "Our media team uses video, livestreaming, and online communication to extend our church’s message and serve our community with clarity and creativity.",
    image: "/images/ministries/mediateam.jpg",
    activities: [
      "Live streaming and recordings",
      "Social media content",
      "Video production",
      "Website and newsletter support",
      "Digital outreach campaigns",
    ],
    leader: "Pastor Gogovi Samuel",
    icon: "📱",
  },
  {
    id: 4,
    title: "Youth & Family",
    description: "Equipping the next generation for Christ",
    longDescription:
      "We create safe, inspiring spaces where young people and families can grow spiritually, serve together, and build lifelong friendships.",
    image: "/images/ministries/youth.svg",
    activities: [
      "Youth gatherings and retreats",
      "Bible study and mentorship",
      "Family-focused events",
      "Leadership development",
      "Community service projects",
    ],
    leader: "Youth Leadership Team",
    icon: "👥",
  },
  {
    id: 5,
    title: "Community Outreach",
    description: "Serving our city with practical love",
    longDescription:
      "Our outreach ministries bring help, hope, and the compassion of Christ to families, schools, and neighborhoods across our city.",
    image: "/images/ministries/pastors.jpg",
    activities: [
      "Food and care programs",
      "Community partnerships",
      "Support for local families",
      "Service events",
      "Disaster relief efforts",
    ],
    leader: "Pastor Opoku Samuel",
    icon: "❤️",
  },
  {
    id: 6,
    title: "Prayer & Intercession",
    description: "Standing together in prayer for our church and community",
    longDescription:
      "A faithful prayer team gathers regularly to lift up our church, leaders, families, and city in intercession and spiritual covering.",
    image: "/images/ministries/volunteers.svg",
    activities: [
      "Weekly prayer gatherings",
      "Intercessory support",
      "Prayer request ministry",
      "Fasting and special prayer seasons",
      "Spiritual covering for ministries",
    ],
    leader: "Prayer Leaders",
    icon: "🕯️",
  },
];

const MinistriesPage = () => {
  return (
    <>
      <Breadcrumb pageName="Our Ministries" description="Growing together in faith and service" />

      <section className="relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 py-14 md:py-20 lg:py-24 dark:from-primary/20 dark:to-primary/10">
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Ministry Focus
            </span>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
              Inspiring, serving, and growing together in every ministry.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              Discover the teams that power our worship, outreach, media, prayer, and family life. Each ministry exists to help you connect with God, serve others, and walk in your calling.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Join a Ministry
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center justify-center rounded-full border border-primary bg-white px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                Support Our Ministries
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 lg:py-28">
        <div className="container">
          <SectionTitle
            title="Ministry Spotlight"
            paragraph="Explore the teams leading worship, media, prayer, and outreach. These ministries are helping our church grow stronger and serve more effectively."
            center
          />

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ministries.map((ministry) => (
              <article
                key={ministry.id}
                className="group overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(74,108,247,0.1)] transition-all duration-300 hover:-translate-y-2 dark:bg-gray-900"
              >
                <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                  <Image
                    src={ministry.image}
                    alt={ministry.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-6 bottom-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm">
                    <span>{ministry.icon}</span>
                    <span>{ministry.title}</span>
                  </div>
                </div>
                <div className="p-8">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                    {ministry.description}
                  </p>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    {ministry.title}
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {ministry.longDescription}
                  </p>
                  <div className="mb-6 grid gap-2 text-sm text-gray-700 dark:text-gray-300">
                    {ministry.activities.slice(0, 4).map((activity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">Lead:</span>
                    <span>{ministry.leader}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-4">
            {[
              {
                title: "Inspired Worship",
                description: "We invite everyone into authentic praise and heartfelt worship.",
                icon: "🎶",
              },
              {
                title: "Community Care",
                description: "We serve our neighbors with practical love and gospel hope.",
                icon: "🤝",
              },
              {
                title: "Creative Media",
                description: "We use digital tools to share God's story in fresh ways.",
                icon: "📸",
              },
              {
                title: "Prayer Coverage",
                description: "We lift our church and community up in continual prayer.",
                icon: "🕯️",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-[24px] border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
                  {value.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 md:py-24 lg:py-28 bg-primary/5 dark:bg-primary/10">
        <div className="container">
          <div className="rounded-[32px] bg-white p-10 shadow-xl dark:bg-gray-900 md:p-16">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-primary">Ready to Serve</p>
                <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">Join a ministry team that reflects your passion and purpose.</h2>
                <p className="mb-8 max-w-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  You don’t need experience—just a willing heart. Our leaders will help you connect, grow, and make a real difference in the church and our community.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">Contact Us</Link>
                  <Link href="/donate" className="inline-flex items-center justify-center rounded-full border border-primary bg-white px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white">Support Our Ministries</Link>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  { label: "Weekly gatherings", value: "5+" },
                  { label: "Volunteer teams", value: "12" },
                  { label: "Digital reach", value: "15k+" },
                  { label: "Prayer nights", value: "Weekly" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-950">
                    <p className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MinistriesPage;
