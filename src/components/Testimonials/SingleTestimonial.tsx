'use client'
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react"

type Testimonial = {
  body: string;
  name: string;
  username?: string;
  handle?: string;
  likes: number;
  retweets?: number;
  replies?: number;
  shares?: number;
  comments?: number;
  time: string;
  verified?: boolean;
  img?: string;
  title?: string;
};

const SingleTestimonial = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="w-full md:w-[400px]    rounded-2xl">
      <div className="shadow-two hover:shadow-one h-[300px] dark:bg-dark dark:shadow-three dark:hover:shadow-gray-dark rounded-xs bg-white p-8 duration-300 lg:px-5 xl:px-8">
        <p className="border-body-color/10 text-body-color  pb-4 text-base leading-relaxed dark:border-white/10 dark:text-white">
          {testimonial.body}
        </p>
        <div className="flex items-center mb-2 border-b pb-8 justify-between text-xs text-gray-500 transition-all duration-300 delay-700">
          <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{testimonial.replies ?? testimonial.comments ?? 0}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer transition-colors">
            <Repeat2 className="w-4 h-4" />
            <span>{testimonial.retweets ?? testimonial.shares ?? 0}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer transition-colors">
            <Heart className="w-4 h-4" />
            <span>{testimonial.likes}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors">
            <Share className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full">
            <h3 className="text-dark mb-1 text-lg font-semibold lg:text-base xl:text-lg dark:text-white">
              {testimonial.name}
            </h3>
            <div
              className={
                "flex items-center gap-2 text-xs text-gray-500 transition-all duration-300 delay-250"
              }
            >
              <span>
                {testimonial.handle
                  ? testimonial.handle
                  : testimonial.username ?? ""}
              </span>
              <span>·</span>
              <span>{testimonial.time}</span>
            </div>
          </div>
          {testimonial.handle ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleTestimonial;
