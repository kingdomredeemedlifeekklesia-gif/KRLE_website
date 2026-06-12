import { Brand } from "@/types/brand";
import brandsData from "./brandsData";

const Brands = () => {
  return (
    <section className="pt-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark dark:text-white mb-4">Our Weekly Services</h2>
          <p className="text-body-color dark:text-body-color-dark">
            Join us for worship, prayer, and fellowship at our regular services.
          </p>
        </div>
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {brandsData.map((brand) => (
                <SingleBrand key={brand.id} brand={brand} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;

const SingleBrand = ({ brand }: { brand: Brand }) => {
  const { day, time, service } = brand;

  return (
    <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-lg text-center min-w-[250px]">
      <h3 className="text-xl font-bold text-dark dark:text-white mb-2">{day}</h3>
      <p className="text-primary text-lg font-semibold mb-1">{time}</p>
      <p className="text-body-color dark:text-body-color-dark">{service}</p>
    </div>
  );
};
