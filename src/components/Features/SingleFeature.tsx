import Image from "next/image";
import { Feature } from "@/types/feature";

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, image, title, paragraph } = feature;
  return (
    <div className="w-full h-full">
      <div className="wow fadeInUp rounded-[24px] border border-body-color/10 bg-white p-6 shadow-three transition hover:-translate-y-1 dark:border-white/10 dark:bg-[#11131A] dark:shadow-none h-full flex flex-col" data-wow-delay=".15s">
        {image ? (
          <div className="mb-6 overflow-hidden rounded-[20px]">
            <Image
              src={image}
              alt={title}
              width={500}
              height={320}
              className="h-[220px] w-full object-cover"
            />
          </div>
        ) : null}
        <div className="bg-primary/10 text-primary mb-6 flex h-[70px] w-[70px] items-center justify-center rounded-md">
          {icon}
        </div>
        <h3 className="mb-5 text-xl font-bold text-black sm:text-2xl lg:text-xl xl:text-2xl dark:text-white">
          {title}
        </h3>
        <p className="text-body-color text-base leading-relaxed font-medium flex-grow">
          {paragraph}
        </p>
      </div>
    </div>
  );
};

export default SingleFeature;
