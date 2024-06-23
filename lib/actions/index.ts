"use server"
import { revalidatePath } from "next/cache";
import Product from "../models/product.models";
import { scrapeAmazonProduct } from "../scraper";
import { connectToDB } from "../scraper/mongoose";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";

export async function scrapeAndStoreProduct(prodcutUrl:string) {
    if(!prodcutUrl) return ;

    try {
        connectToDB();
        const scrapedProduct = await scrapeAmazonProduct(prodcutUrl);
        if(!scrapedProduct) return;
        
        let product = scrapedProduct;

        const existingProduct = await Product.findOne({url: scrapedProduct.url});

        if(existingProduct){
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                {price: scrapedProduct.currentPrice}
            ];
            
            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }
        }
        const newProduct = await Product.findOneAndUpdate(
            {url: scrapedProduct.url},
            product,
            {upsert: true , new:true}
        );
        //This is particularly useful for Incremental Static Regeneration (ISR), where you might want to revalidate or refresh the static pages without rebuilding the entire site.
        //The revalidatePath function allows you to programmatically revalidate the cache for a specific path. 
        //This means that if you have a statically generated page, you can trigger its revalidation and 
        //regeneration to ensure that users are served fresh content.

        revalidatePath(`/products/${newProduct._id}`);

    } catch (error:any) {
        throw new Error(`Failed to create/update product : ${error.message}`)
    }
}

export async function getProductById(productId: string){
    try {
        connectToDB();

        const product = await Product.findOne({_id: productId});

        if(!product) return null;

        return product;
    } catch (error) {
        console.log(error);
    }
}

export async function getAllProducts() {
    try {
        connectToDB();
        const products = await Product.find();
        
        return products;
    } catch (error) {
        console.log(error);
    }
}