/** @type {import('next').NextConfig} */
const nextConfig = {
    //older method before Next 12.3.0 , where we used domains 
    // images: {
    //     domains: ['m.media-amazon.com'],
    // },

    //this is the new method where we use remotePatterns
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        
      },
    ],
  },
};

export default nextConfig;


  