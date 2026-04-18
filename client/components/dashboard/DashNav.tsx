"use client"
import ProfileMenu from '../auth/ProfileMenu'
import Link from 'next/link'

export default function DashNav({name,image}:{name:string,image?:string}) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center max-w-7xl">
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl leading-none">Q</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">QuickChat</h1>
        </Link>
        <div className="flex items-center space-x-4 text-foreground">
          <ProfileMenu name={name} image={image}/>
        </div>
      </div>
    </nav>
  )
}
