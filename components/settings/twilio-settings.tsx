/**
 * Twilio configuration component
 */
"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Copy, Check } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function TwilioSettings() {
  const [areaCode, setAreaCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: numbers = [], mutate } = useSWR("/api/twilio/numbers", fetcher)

  const handleBuyNumber = async () => {
    if (!areaCode || areaCode.length !== 3) {
      toast.error("Please enter a valid area code")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/twilio/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaCode }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Number purchased: ${data.number}`)
        setAreaCode("")
        mutate()
      } else {
        toast.error("Failed to purchase number")
      }
    } catch (error) {
      toast.error("Error purchasing number")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (phoneNumber: string) => {
    navigator.clipboard.writeText(phoneNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Twilio Phone Numbers
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Numbers */}
        <div>
          <h3 className="font-medium mb-3">Active Numbers</h3>
          {numbers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No phone numbers configured</p>
          ) : (
            <div className="space-y-2">
              {numbers.map((num: any) => (
                <div key={num.sid} className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-medium">{num.phoneNumber}</p>
                    <p className="text-xs text-muted-foreground">{num.friendlyName}</p>
                    <div className="flex gap-2 mt-1">
                      {num.capabilities?.sms && (
                        <Badge variant="secondary" className="text-xs">
                          SMS
                        </Badge>
                      )}
                      {num.capabilities?.voice && (
                        <Badge variant="secondary" className="text-xs">
                          Voice
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(num.phoneNumber)}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buy New Number */}
        <div className="border-t border-border pt-4">
          <h3 className="font-medium mb-3">Buy New Number</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Area code (e.g., 415)"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value.slice(0, 3))}
              maxLength="3"
              type="tel"
            />
            <Button onClick={handleBuyNumber} disabled={isLoading || areaCode.length !== 3}>
              {isLoading ? "Purchasing..." : "Buy Number"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Purchase a phone number for SMS and voice capabilities</p>
        </div>
      </CardContent>
    </Card>
  )
}
