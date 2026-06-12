import Image from "next/image";

const AboutSectionTwo = () => {
  const values = [
    {
      title: "Worship With Us",
      description: "Join us for powerful worship, inspirational teaching, and a warm church family that welcomes everyone.",
      icon: "🎵",
      image: "/images/about/IMG_1288img_1288.jpg",
    },
    {
      title: "Grow in Community",
      description: "Connect through small groups, classes, and discipleship environments designed to help you grow spiritually.",
      icon: "🌱",
      image: "/images/about/IMG_1288img_1288.jpg",
    },
    {
      title: "Serve With Purpose",
      description: "Engage in outreach, volunteer teams, and community projects that reflect our mission to love and serve others.",
      icon: "🤝",
      image: "/images/about/IMG_1288img_1288.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => (
            <article
              key={index}
              className="group overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(74,108,247,0.1)] transition-all duration-300 hover:-translate-y-2 dark:bg-gray-900"
            >
              <div className="relative overflow-hidden">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={value.image}
                    alt={value.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-6 bottom-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-2xl backdrop-blur-sm">
                    {value.icon}
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;
