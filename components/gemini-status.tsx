"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, CheckCircle, AlertCircle } from "lucide-react"

export function GeminiStatus() {
  // Check if Google Gemini API key is available
  const isAvailable = typeof window !== "undefined" ? false : !!process.env.GOOGLE_GENERATIVE_AI_API_KEY

  return (
    <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${isAvailable ? "bg-green-100 dark:bg-green-900/30" : "bg-yellow-100 dark:bg-yellow-900/30"}`}
          >
            <Search
              className={`w-5 h-5 ${isAvailable ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Google Gemini</h3>
              {isAvailable ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isAvailable
                ? "Ready for high-quality multilingual translations"
                : "Configure GOOGLE_GENERATIVE_AI_API_KEY to enable"}
            </p>
          </div>
          <Badge variant={isAvailable ? "default" : "secondary"}>{isAvailable ? "Active" : "Setup Required"}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
