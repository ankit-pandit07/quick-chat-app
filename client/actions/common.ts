"use server"
import { revalidateTag } from "next/cache";

export async function clearCache(tag:string){
    // @ts-ignore
    revalidateTag(tag)
}