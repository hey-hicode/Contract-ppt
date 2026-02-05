'use client'
import apex from "~/components/assets/logo-apex.png"
import echo from "~/components/assets/logo-echo.png"
import celestial from "~/components/assets/logo-celestial.png"
import Image from 'next/image';
import { motion } from "framer-motion"

const Brands = () => {
  return (
    <section id="brands" className="pt-16 overflow-clip">
      <div className="">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="flex flex-wrap items-center justify-center rounded-xs bg-gray-light px-8 py-8 dark:bg-gray-dark sm:px-10 md:px-[50px] md:py-[40px] xl:p-[50px] 2xl:px-[70px] 2xl:py-[60px]">
              <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)] ">
                <motion.div
                  animate={{
                    translateX: "-50%"
                  }}
                  transition={{
                    duration: 7,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                  className="flex gap-14 flex-none pr-14">
                  <Image src={apex} className=" ticker" alt="ewj ticker" />
                  <Image src={echo} className="ede ticker" alt=" ticker" />
                  <Image src={apex} className="ede ticker" alt=" ticker" />
                  <Image src={celestial} className="ede ticker" alt=" ticker" />  <Image src={echo} className="ede ticker" alt=" ticker" />
                  <Image src={apex} className="ede ticker" alt=" ticker" />
                  <Image src={celestial} className="ede ticker" alt=" ticker" />
                  <Image src={echo} className="ede ticker" alt=" ticker" />
                  <Image src={apex} className="ede ticker" alt=" ticker" />

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
