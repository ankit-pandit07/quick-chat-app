import { CHAT_GROUP_URL, CHAT_GROUP_MESSAGES_URL } from "@/lib/apiEndPoints";

export async function fetchChatGrouop(token:string){
    const res=await fetch(CHAT_GROUP_URL,{
        headers:{
            Authorization:token,
        },
        next:{
            revalidate:60*60,
            tags:['dashboard']
        }
    })
    if(!res.ok){
        throw new Error("Failed to fetch data")
    }

    const response=await res.json();
    if(response?.data){
        return response?.data
    }
    return [];
}

export async function fetchChatMessages(groupId: string, token: string) {
    try {
        const res = await fetch(CHAT_GROUP_MESSAGES_URL(groupId), {
            headers: {
                Authorization: token,
            },
            cache: "no-store"
        });
        
        if (!res.ok) {
            return [];
        }

        const response = await res.json();
        return response?.data || [];
    } catch (error) {
        return [];
    }
}

export async function fetchChatGroupById(groupId: string, token: string) {
    try {
        const res = await fetch(`${CHAT_GROUP_URL}/${groupId}`, {
            headers: {
                Authorization: token,
            },
            cache: "no-store"
        });
        
        if (!res.ok) {
            return null;
        }

        const response = await res.json();
        return response?.data || null;
    } catch (error) {
        return null;
    }
}