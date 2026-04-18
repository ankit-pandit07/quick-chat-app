type ChatGroupType={
    id:string,
    user_id:number,
    title:string,
    passcode:string,
    created_at:string
}

type MessageType = {
    id: string;
    group_id: string;
    sender_id: number;
    content: string;
    file_url?: string | null;
    is_edited?: boolean;
    is_deleted?: boolean;
    temp_id?: string;
    pending?: boolean;
    created_at: string;
    sender: {
        id: number;
        name: string;
        image: string | null;
    }
}