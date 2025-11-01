'use client'
import { Brand } from "~/types/brand";
import apex from "~/components/assets/logo-apex.png"
import echo from "~/components/assets/logo-echo.png"
import celestial from "~/components/assets/logo-celestial.png"
import Image from 'next/image';
import { motion } from "framer-motion"

const Brands = () => {
  return (
    <section className="pt-16 overflow-clip">
      <div className="">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="flex flex-wrap items-center justify-center rounded-xs bg-gray-light px-8 py-8 dark:bg-gray-dark sm:px-10 md:px-[50px] md:py-[40px] xl:p-[50px] 2xl:px-[70px] 2xl:py-[60px]">
                 <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)] ">
          <motion.div 
          animate={{
            translateX:"-50%"
          }}
          transition={{
            duration:7,
            ease:'linear',
            repeat:Infinity,
            repeatType:'loop',
          }}
          className="flex gap-14 flex-none pr-14">
            <Image src={apex} className=" ticker"  alt="ewj ticker"/>
            <Image src={echo} className="ede ticker"  alt=" ticker"/>
            <Image src={apex} className="ede ticker"  alt=" ticker"/>
            <Image src={celestial} className="ede ticker"  alt=" ticker"/>  <Image src={echo} className="ede ticker"  alt=" ticker"/>
            <Image src={apex} className="ede ticker"  alt=" ticker"/>
            <Image src={celestial} className="ede ticker"  alt=" ticker"/>
            <Image src={echo} className="ede ticker"  alt=" ticker"/>
            <Image src={apex} className="ede ticker"  alt=" ticker"/>

          </motion.div>

        </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;

const SingleBrand = ({ brand }: { brand: Brand }) => {
  const { href, image, imageLight, name } = brand;

  return (
    <div className="flex w-1/2 items-center justify-center px-3 py-[15px] sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6">
      <a
        href={href}
        target="_blank"
        rel="nofollow noreferrer"
        className="relative h-10 w-full opacity-70 transition hover:opacity-100 dark:opacity-60 dark:hover:opacity-100"
      >
        <Image src={imageLight ?? ''} alt={name} fill className="hidden dark:block" />
        <Image src={image} alt={name} fill className="block dark:hidden" />
      </a>
    </div>
  );
};
