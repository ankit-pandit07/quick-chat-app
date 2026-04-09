"use client"
import React, { Suspense, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import UserAvatar from '../common/UserAvatar'
import dynamic from 'next/dynamic'
const LogoutModal=dynamic(()=>import("../auth/Logout"))
export default function ProfileMenu({name,image}:{name:string,image?:string}) {

  const [logoutOpen,setLogoutOpen]=useState(false)
  return (
    <>
    {logoutOpen && <Suspense fallback={<p>Loading...</p>}>
        <LogoutModal open={logoutOpen} setOpen={setLogoutOpen}/>
      </Suspense>}
    <DropdownMenu>
  <DropdownMenuTrigger>
    <UserAvatar name={name} image={image}/>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem onClick={()=>setLogoutOpen(true)}>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
</>
  )
}
