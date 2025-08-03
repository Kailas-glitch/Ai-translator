"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeftRight, Copy, Languages, Loader2, Sparkles, Volume2, Settings, Zap, Brain, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { translateText, getAvailableProviders, AI_PROVIDERS, type AIProvider } from "./actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { GeminiStatus } from "@/components/gemini-status"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
]

const providerIcons: Record<AIProvider, React.ReactNode> = {
  openai: <Brain className="w-4 h-4" />,
  anthropic: <Sparkles className="w-4 h-4" />,
  google: <Search className="w-4 h-4" />,
  groq: <Zap className="w-4 h-4" />,
  mock: <Settings className="w-4 h-4" />,
}

export default function TranslatorPage() {
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("es")
  const [isTranslating, setIsTranslating] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null)
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([])
  const [lastUsedProvider, setLastUsedProvider] = useState<string>("")
  const [lastUsedModel, setLastUsedModel] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoading(true)
        const providers = await getAvailableProviders()
        setAvailableProviders(providers)

        // Set default provider to Google Gemini if available, otherwise first available
        if (providers.length > 0) {
          const preferredProvider =
            providers.find((p) => p === "google") || providers.find((p) => p !== "mock") || providers[0]
          setSelectedProvider(preferredProvider)
        } else {
          setSelectedProvider("mock")
        }
      } catch (error) {
        console.error("Error loading providers:", error)
        setSelectedProvider("mock")
        setAvailableProviders(["mock"])
      } finally {
        setIsLoading(false)
      }
    }
    loadProviders()
  }, [])

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to translate.",
        variant: "destructive",
      })
      return
    }

    if (sourceLang === targetLang) {
      toast({
        title: "Error",
        description: "Please select different source and target languages.",
        variant: "destructive",
      })
      return
    }

    setIsTranslating(true)
    try {
      const result = await translateText(sourceText, sourceLang, targetLang, selectedProvider || "mock")
      setTranslatedText(result.translation)
      setLastUsedProvider(result.provider)
      setLastUsedModel(result.model)

      toast({
        title: "Translation Complete",
        description: `Translated using ${result.provider}`,
      })
    } catch (error) {
      toast({
        title: "Translation Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSwapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      })
    }
  }

  const getLanguage = (code: string) => {
    return languages.find((lang) => lang.code === code) || { name: code, flag: "🌐" }
  }

  // Safe provider access with fallbacks
  const getProviderInfo = (provider: AIProvider | null) => {
    if (!provider || !AI_PROVIDERS[provider]) {
      return {
        name: "Demo Mode",
        description: "Demonstration translations for preview",
        available: true,
      }
    }
    return AI_PROVIDERS[provider]
  }

  const currentProviderInfo = getProviderInfo(selectedProvider)
  const isGeminiAvailable = AI_PROVIDERS?.google?.available || false

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading AI providers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  AI Translator
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isGeminiAvailable ? "Powered by Google Gemini" : "Multi-provider AI translation"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {availableProviders.length} AI Providers
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Provider Status Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${isGeminiAvailable ? "bg-green-500" : "bg-yellow-500"}`}
              ></div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-medium">
                  {isGeminiAvailable
                    ? "Google Gemini Ready • " + Math.max(0, availableProviders.length - 1) + " backup providers"
                    : availableProviders.length + " AI providers available"}
                </span>
                {lastUsedProvider && (
                  <span className="ml-2 text-slate-500 dark:text-slate-400">• Last used: {lastUsedProvider}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Highlight Google Gemini first */}
              {isGeminiAvailable && (
                <div
                  className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 ring-2 ring-green-300 dark:ring-green-700"
                  title="Google Gemini - Primary Provider"
                >
                  <Search className="w-4 h-4" />
                </div>
              )}
              {availableProviders
                .filter((p) => p !== "google")
                .slice(0, 3)
                .map((provider) => {
                  const providerConfig = AI_PROVIDERS[provider]
                  if (!providerConfig) return null

                  return (
                    <div
                      key={provider}
                      className={`p-1.5 rounded-md ${
                        providerConfig.available
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }`}
                      title={providerConfig.name}
                    >
                      {providerIcons[provider]}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2">
        <GeminiStatus />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Translation Card */}
        <Card className="shadow-2xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-center text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Multi-Provider Translation
            </CardTitle>
            <p className="text-center text-slate-600 dark:text-slate-400 mt-2">
              Choose your preferred AI provider for optimal translation results
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Provider Selection */}
            <div className="flex justify-center">
              <div className="w-full max-w-md space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block text-center">
                  AI Provider
                </label>
                <Select
                  value={selectedProvider || "mock"}
                  onValueChange={(value: AIProvider) => setSelectedProvider(value)}
                >
                  <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue>
                      <div className="flex items-center gap-3">
                        {selectedProvider ? providerIcons[selectedProvider] : providerIcons.mock}
                        <div className="text-left">
                          <div className="font-medium">{currentProviderInfo.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {currentProviderInfo.description}
                          </div>
                        </div>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map((provider) => {
                      const providerConfig = AI_PROVIDERS[provider]
                      if (!providerConfig) return null

                      return (
                        <SelectItem key={provider} value={provider}>
                          <div className="flex items-center gap-3">
                            {providerIcons[provider]}
                            <div>
                              <div className="font-medium">{providerConfig.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {providerConfig.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getLanguage(sourceLang).flag}</span>
                        <span>{getLanguage(sourceLang).name}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapLanguages}
                  className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isTranslating}
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </Button>
                <span className="text-xs text-slate-500 dark:text-slate-400">Swap</span>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getLanguage(targetLang).flag}</span>
                        <span>{getLanguage(targetLang).name}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Text Areas */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLanguage(sourceLang).flag}</span>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {getLanguage(sourceLang).name}
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {sourceText && (
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(sourceText)} className="h-8">
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Textarea
                    placeholder="Enter text to translate..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className="min-h-[200px] resize-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                    disabled={isTranslating}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded">
                    {sourceText.length} chars
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLanguage(targetLang).flag}</span>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {getLanguage(targetLang).name}
                    </label>
                    {lastUsedProvider && (
                      <Badge variant="outline" className="text-xs">
                        {lastUsedProvider}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {translatedText && (
                      <>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(translatedText)}
                          className="h-8"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Textarea
                    placeholder="Translation will appear here..."
                    value={translatedText}
                    readOnly
                    className="min-h-[200px] resize-none bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                    {translatedText.length} chars
                  </div>
                  {isTranslating && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-medium">Translating with {currentProviderInfo.name}...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Translate Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleTranslate}
                disabled={isTranslating || !sourceText.trim()}
                size="lg"
                className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    {selectedProvider ? providerIcons[selectedProvider] : providerIcons.mock}
                    <span className="ml-3">Translate with {currentProviderInfo.name}</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Providers Grid */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          {Object.entries(AI_PROVIDERS)
            .filter(([key]) => key !== "mock")
            .map(([key, config]) => {
              if (!config) return null

              return (
                <Card
                  key={key}
                  className={`group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl ${config.available ? "ring-2 ring-green-200 dark:ring-green-800" : "opacity-60"}`}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${
                        config.available
                          ? "bg-gradient-to-br from-green-500 to-green-600"
                          : "bg-gradient-to-br from-gray-400 to-gray-500"
                      }`}
                    >
                      <div className="text-white">{providerIcons[key as AIProvider]}</div>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">{config.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">
                      {config.description}
                    </p>
                    <Badge variant={config.available ? "default" : "secondary"} className="text-xs">
                      {config.available ? "Available" : "Configure API Key"}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </main>
    </div>
  )
}
