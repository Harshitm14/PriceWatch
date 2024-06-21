"use server"

import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(prodcutUrl:string) {
    if(!prodcutUrl) return ;

    try {
        const scrapedProduct = await scrapeAmazonProduct(prodcutUrl);
    } catch (error:any) {
        throw new Error(`Failed to create/update product : ${error.message}`)
    }
}