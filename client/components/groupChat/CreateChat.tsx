"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createChatSchema, createChatSchemaType } from '@/validations/groupChatValidation'
import { Input } from '../ui/input'
import { CustomUser } from '@/app/api/auth/[...nextauth]/options'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { CHAT_GROUP_URL } from '@/lib/apiEndPoints'
import { clearCache } from '@/actions/common'
import { Plus } from 'lucide-react'

export default function CreateChat({user}:{user:CustomUser}) {

    const [open,setOpen]=useState(false)
    const [loading,setLoading]=useState(false)
      const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<createChatSchemaType>({
    resolver: zodResolver(createChatSchema),
  })

  const onSubmit=async(payload:createChatSchemaType)=>{
    try {
      setLoading(true)
      const {data}=await axios.post(CHAT_GROUP_URL,{...payload,user_id:user.id},{
        headers:{
          Authorization:user.token
        }
      })
      if(data?.message){
        clearCache("dashboard")
        setLoading(false);
        setOpen(false);
        toast.success(data?.message)
      }
    } catch (error) {
      setLoading(false)
      if(error instanceof AxiosError){
        toast.error(error.message)
      }else{
        toast.error("Something went wrong.Please try again!")
      }
    }
  }

  return (
   <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button className="rounded-full shadow-md hover:shadow-lg transition-all duration-300 group">
      <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
      Create Group
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md rounded-2xl" onInteractOutside={(e)=>e.preventDefault()}>
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold tracking-tight">Create your new Chat</DialogTitle>
      <DialogDescription>
        Set up a private chat room with a passcode for you and your friends.
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Chat Title</label>
        <Input 
          className="rounded-xl h-12 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors" 
          placeholder='e.g. Weekend Plans' 
          {...register("title")}
        />
        <span className='text-red-500 text-xs'>{errors?.title?.message}</span>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Passcode</label>
        <Input 
          className="rounded-xl h-12 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-colors" 
          placeholder='Enter a secure passcode' 
          {...register("passcode")}
        />
        <span className='text-red-500 text-xs'>{errors?.passcode?.message}</span>
      </div>
      <div className='pt-2'>
        <Button className='w-full rounded-xl h-12 text-base font-medium' disabled={loading}>
          {loading ? "Creating..." : "Create Chat Room"}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
  )
}
