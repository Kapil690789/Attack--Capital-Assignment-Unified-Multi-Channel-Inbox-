"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, User } from "lucide-react"
import { toast } from "sonner"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Account created successfully!")
        router.push("/inbox")
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || "Signup failed")
      }
    } catch (error) {
      toast.error("Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-sm text-muted-foreground">Join Unified Inbox to start managing conversations</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
