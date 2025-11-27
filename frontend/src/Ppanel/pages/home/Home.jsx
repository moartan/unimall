import Hero from "./Hero";
import Categories from "./Categories";
import Special from "./Special";
import Trending from "./Trending";

const container = "w-full mx-auto px-4 lg:px-20";

export default function Home() {
  return (
    <div className="space-y-12 pb-12">
      <Hero containerClass={container} />
      <Categories containerClass={container} />
      <Special containerClass={container} />
      <Trending containerClass={container} />
    </div>
  );
}
