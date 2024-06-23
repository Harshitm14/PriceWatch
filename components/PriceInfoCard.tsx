import Image from "next/image";

interface Props {
  title: string;
  iconSrc: string;
  value: string;
  borderColor: string;
}
const PriceInfoCard = ({ title, iconSrc, value, borderColor }: Props) => {
  return (
    
  //  <div className={`price-info_card border-l-[${borderColor}]`}> 
  //the above way is not the correct way to use a template literal therefore using the way below so that the tailwing utility scanner picks it up
  //You cannot create a dynamic utility class from a template literal, you must explicitly list the full class name in some text somewhere (even comments) so the tailwind scanner can pick it up.  
  //So 'className=`border-${color-param}`' does not work. Instead in the component  say 'className=`${border-color-param)`' and when using the component pass 'border-color-param="border-red-500"' 
  //or whatever you need. Tailwind scanner sees the utility class name and includes it even though it is not in an explicit class context!  
  <div className={`price-info_card`} style={{ borderLeftColor: borderColor }}>
    <p className="text-base text-black-100">{title}</p>

    <div className="flex gap-1">
      <Image 
        src={iconSrc} 
        alt={title}
        width={24}
        height={24} 
      />
      <p className="text-2xl font-bold text-secondary">{value}</p>
    </div>
    
   </div>
  )
}

export default PriceInfoCard
