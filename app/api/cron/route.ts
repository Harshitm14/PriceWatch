import Product from "@/lib/models/product.models";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { connectToDB } from "@/lib/scraper/mongoose"
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";
import { title } from "process";

export const maxDuration = 300;
export const dynamic = 'force-dynamic'
export const revalidate = 0;

export async function GET(){
    try {
        connectToDB();

        const products = await Product.find({});

        if(!products) throw new Error("No products found");

        //1.Scrape latest product details and update db

        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {
                const scrapedProduct = await scrapeAmazonProduct (currentProduct.url);
                if(!scrapedProduct) throw new Error("No product found");

                
                    const updatedPriceHistory = [
                        ...currentProduct.priceHistory,
                        {price: scrapedProduct.currentPrice}
                    ];
                    
                    const product = {
                        ...scrapedProduct,
                        priceHistory: updatedPriceHistory,
                        lowestPrice: getLowestPrice(updatedPriceHistory),
                        highestPrice: getHighestPrice(updatedPriceHistory),
                        averagePrice: getAveragePrice(updatedPriceHistory),
                    }
                
                const updatedProduct = await Product.findOneAndUpdate(
                    {url: product.url},
                    product,
                );

                // 2. Check each product's status and send email accordingly
                const emailNotiType = getEmailNotifType(scrapedProduct,currentProduct)

                if(emailNotiType && updatedProduct.users.length > 0){
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url,
                    }

                    const emailContent = await generateEmailBody(productInfo,emailNotiType);

                    const userEmails = updatedProduct.users.map((user: any) => user.email)
                    await sendEmail(emailContent,userEmails);
                }
                return updatedProduct;
            })
        )
        return NextResponse.json({
            message: 'Ok' , data: updatedProducts
        })
    } catch (error) {
        throw new Error(`Error in GET: ${error}`)
    }
}