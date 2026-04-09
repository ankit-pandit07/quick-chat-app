"use client"
import ProfileMenu from '../auth/ProfileMenu'

export default function DashNav({name,image}:{name:string,image?:string}) {
  return (
    <div>
        <nav className="p-6 flex justify-between items-center bg-white shadow-sm">
      <h1 className="text-xl md:text-2xl font-extrabold">QuickChat</h1>
      <div className="flex items-center space-x-2 md:space-x-6 text-gray-700">
        <ProfileMenu name={name} image={image}/>
      </div>
    </nav>
    </div>
  )
}
