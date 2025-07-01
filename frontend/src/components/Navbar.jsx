import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Settings, Info } from "lucide-react"

const navItems = [
  {
    name: "Home",
    url: "/",
    icon: Home
  },
  {
    name: "Normalize",
    url: "/normalise",
    icon: Settings
  },
  {
    name: "About",
    url: "/about",
    icon: Info
  }
]

export function NavBar({ className }) {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("Home")

  useEffect(() => {
    const currentItem = navItems.find(item => item.url === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.name)
    }
  }, [location.pathname])

  return (
    <nav className="w-full bg-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-amber-600">Color Norm</h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name

            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setActiveTab(item.name)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? "bg-amber-100 text-amber-800" 
                    : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default NavBar 