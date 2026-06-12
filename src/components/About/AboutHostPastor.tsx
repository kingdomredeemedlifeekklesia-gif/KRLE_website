import Image from "next/image";

const AboutHostPastor = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-1/2">
            <div className="mx-auto mb-12 w-full max-w-[500px] lg:m-0">
              <div className="relative w-full overflow-hidden rounded-[40px] bg-white shadow-three min-h-[320px]">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/about/IMG_0951img_0951.jpg"
                    alt="host pastor"
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 500px"
                    className="object-cover transition duration-500 dark:hidden"
                  />
                  <Image
                    src="/images/about/IMG_0951img_0951.jpg"
                    alt="host pastor"
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 500px"
                    className="hidden object-cover transition duration-500 dark:block"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <div className="max-w-[470px]">
              <div className="mb-9">
                <h2 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl lg:text-3xl xl:text-4xl">
                  Meet Our Host Pastor
                </h2>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Our host pastor brings a wealth of spiritual wisdom, pastoral care, and visionary leadership to Kingdom Redeemed Life Ecclesia. With a deep commitment to the gospel and a heart for discipleship, the pastor leads our congregation with grace and integrity.
                </p>
              </div>

              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Spiritual Vision
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Dedicated to empowering believers to live out their faith daily, the pastor emphasizes practical application of Scripture and the transformative power of the Holy Spirit in modern life.
                </p>
              </div>

              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Pastoral Heart
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Available for counseling, mentorship, and prayer, the pastor serves with compassion and wisdom, helping members navigate life's challenges through a biblical lens.
                </p>
              </div>

              <div className="mb-1">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Community Leadership
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Through teachings, seminars, and community involvement, the pastor leads our church to be a beacon of hope and transformation in the city, demonstrating Christ's love in practical ways.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHostPastor;
