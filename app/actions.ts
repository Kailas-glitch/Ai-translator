"use server"

import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
  hi: "Hindi",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  pl: "Polish",
  tr: "Turkish",
  th: "Thai",
}

// Available AI providers
export type AIProvider = "openai" | "anthropic" | "google" | "groq" | "mock"

interface ProviderConfig {
  name: string
  model: string
  available: boolean
  description: string
}

export const AI_PROVIDERS: Record<AIProvider, ProviderConfig> = {
  google: {
    name: "Google Gemini",
    model: "gemini-1.5-flash",
    available: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    description: "Google's latest AI with superior multilingual expertise",
  },
  openai: {
    name: "OpenAI GPT-4",
    model: "gpt-4o-mini",
    available: !!process.env.OPENAI_API_KEY,
    description: "Advanced language model with excellent translation quality",
  },
  anthropic: {
    name: "Anthropic Claude",
    model: "claude-3-haiku-20240307",
    available: !!process.env.ANTHROPIC_API_KEY,
    description: "Highly accurate translations with cultural context",
  },
  groq: {
    name: "Groq Llama",
    model: "llama-3.1-8b-instant",
    available: !!process.env.GROQ_API_KEY,
    description: "Ultra-fast inference with competitive quality",
  },
  mock: {
    name: "Demo Mode",
    model: "mock-translator",
    available: true,
    description: "Demonstration translations for preview",
  },
}

// Mock translations for demo purposes
const mockTranslations: Record<string, Record<string, string>> = {
  hello: {
    es: "hola",
    fr: "bonjour",
    de: "hallo",
    it: "ciao",
    pt: "olá",
    ru: "привет",
    ja: "こんにちは",
    ko: "안녕하세요",
    zh: "你好",
    ar: "مرحبا",
    hi: "नमस्ते",
  },
  "how are you": {
    es: "¿cómo estás?",
    fr: "comment allez-vous?",
    de: "wie geht es dir?",
    it: "come stai?",
    pt: "como você está?",
    ru: "как дела?",
    ja: "元気ですか？",
    ko: "어떻게 지내세요?",
    zh: "你好吗？",
    ar: "كيف حالك؟",
    hi: "आप कैसे हैं?",
  },
  "thank you": {
    es: "gracias",
    fr: "merci",
    de: "danke",
    it: "grazie",
    pt: "obrigado",
    ru: "спасибо",
    ja: "ありがとう",
    ko: "감사합니다",
    zh: "谢谢",
    ar: "شكرا",
    hi: "धन्यवाद",
  },
  "good morning": {
    es: "buenos días",
    fr: "bonjour",
    de: "guten Morgen",
    it: "buongiorno",
    pt: "bom dia",
    ru: "доброе утро",
    ja: "おはよう",
    ko: "좋은 아침",
    zh: "早上好",
    ar: "صباح الخير",
    hi: "सुप्रभात",
  },
  "i love you": {
    es: "te amo",
    fr: "je t'aime",
    de: "ich liebe dich",
    it: "ti amo",
    pt: "eu te amo",
    ru: "я тебя люблю",
    ja: "愛してる",
    ko: "사랑해",
    zh: "我爱你",
    ar: "أحبك",
    hi: "मैं तुमसे प्यार करता हूँ",
  },
  "what is your name": {
    es: "¿cuál es tu nombre?",
    fr: "quel est votre nom?",
    de: "wie heißt du?",
    it: "come ti chiami?",
    pt: "qual é o seu nome?",
    ru: "как тебя зовут?",
    ja: "お名前は何ですか？",
    ko: "이름이 뭐예요?",
    zh: "你叫什么名字？",
    ar: "ما اسمك؟",
    hi: "आपका नाम क्या है?",
  },
  "where are you from": {
    es: "¿de dónde eres?",
    fr: "d'où venez-vous?",
    de: "woher kommst du?",
    it: "di dove sei?",
    pt: "de onde você é?",
    ru: "откуда ты?",
    ja: "どちらの出身ですか？",
    ko: "어디서 왔어요?",
    zh: "你来自哪里？",
    ar: "من أين أنت؟",
    hi: "आप कहाँ से हैं?",
  },
}

function getMockTranslation(text: string, targetLang: string): string {
  const lowerText = text.toLowerCase().trim()

  // Check for exact matches first
  if (mockTranslations[lowerText] && mockTranslations[lowerText][targetLang]) {
    return mockTranslations[lowerText][targetLang]
  }

  // Check for partial matches
  for (const [key, translations] of Object.entries(mockTranslations)) {
    if (lowerText.includes(key) && translations[targetLang]) {
      return translations[targetLang]
    }
  }

  // Generic responses based on target language
  const genericResponses: Record<string, string> = {
    es: `Traducción simulada: "${text}" (Modo demostración)`,
    fr: `Traduction simulée: "${text}" (Mode démonstration)`,
    de: `Simulierte Übersetzung: "${text}" (Demo-Modus)`,
    it: `Traduzione simulata: "${text}" (Modalità demo)`,
    pt: `Tradução simulada: "${text}" (Modo demonstração)`,
    ru: `Имитация перевода: "${text}" (Демо-режим)`,
    ja: `模擬翻訳: "${text}" (デモモード)`,
    ko: `모의 번역: "${text}" (데모 모드)`,
    zh: `模拟翻译: "${text}" (演示模式)`,
    ar: `ترجمة محاكاة: "${text}" (وضع العرض)`,
    hi: `नकली अनुवाद: "${text}" (डेमो मोड)`,
    en: `Mock translation: "${text}" (Demo mode)`,
  }

  return genericResponses[targetLang] || `Mock translation: "${text}" (Demo mode)`
}

export async function getAvailableProviders(): Promise<AIProvider[]> {
  const providers = Object.entries(AI_PROVIDERS)
    .filter(([_, config]) => config.available)
    .map(([provider]) => provider as AIProvider)

  // Prioritize Google Gemini if available
  const sortedProviders = providers.sort((a, b) => {
    if (a === "google") return -1
    if (b === "google") return 1
    if (a === "mock") return 1
    if (b === "mock") return -1
    return 0
  })

  return sortedProviders
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  provider: AIProvider | null = null,
): Promise<{ translation: string; provider: string; model: string }> {
  // Add a small delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

  const sourceLanguage = languageNames[sourceLang] || sourceLang
  const targetLanguage = languageNames[targetLang] || targetLang

  // Default to Google Gemini if available, otherwise use mock
  let actualProvider = provider
  if (!actualProvider || !AI_PROVIDERS[actualProvider]?.available) {
    const availableProviders = await getAvailableProviders()
    actualProvider = availableProviders.find((p) => p === "google") || availableProviders[0] || "mock"
  }

  const systemPrompt = `You are a professional translator specializing in accurate, contextual translations. Translate the given text from ${sourceLanguage} to ${targetLanguage}. 

Rules:
- Provide only the translation, no explanations or additional text
- Maintain the original tone, style, and formality level
- Preserve formatting like line breaks and punctuation
- Keep proper nouns, brand names, and technical terms appropriate for the target language
- Consider cultural context and idiomatic expressions
- If the source text is already in the target language, provide the same text but mention it's already in the correct language`

  const userPrompt = `Translate this text from ${sourceLanguage} to ${targetLanguage}:

${text}`

  // Handle mock provider
  if (actualProvider === "mock") {
    return {
      translation: getMockTranslation(text, targetLang),
      provider: "Demo Mode",
      model: "mock-translator",
    }
  }

  try {
    let result
    const config = AI_PROVIDERS[actualProvider]

    switch (actualProvider) {
      case "google":
        result = await generateText({
          model: google(config.model),
          system: systemPrompt,
          prompt: userPrompt,
          maxTokens: 2000,
          temperature: 0.3,
        })
        break

      case "openai":
        result = await generateText({
          model: openai(config.model),
          system: systemPrompt,
          prompt: userPrompt,
          maxTokens: 2000,
          temperature: 0.3,
        })
        break

      case "anthropic":
        result = await generateText({
          model: anthropic(config.model),
          system: systemPrompt,
          prompt: userPrompt,
          maxTokens: 2000,
        })
        break

      case "groq":
        result = await generateText({
          model: groq(config.model),
          system: systemPrompt,
          prompt: userPrompt,
          maxTokens: 2000,
          temperature: 0.3,
        })
        break

      default:
        throw new Error(`Unsupported provider: ${actualProvider}`)
    }

    return {
      translation: result.text,
      provider: config.name,
      model: config.model,
    }
  } catch (error) {
    console.error(`Translation error with ${actualProvider}:`, error)

    // Try fallback providers, prioritizing Google Gemini
    const availableProviders = await getAvailableProviders()
    const fallbackProviders = availableProviders.filter((p) => p !== actualProvider && p !== "mock")

    if (fallbackProviders.length > 0) {
      console.log(`Trying fallback provider: ${fallbackProviders[0]}`)
      return translateText(text, sourceLang, targetLang, fallbackProviders[0])
    }

    // Final fallback to mock
    return {
      translation: getMockTranslation(text, targetLang),
      provider: "Demo Mode (Fallback)",
      model: "mock-translator",
    }
  }
}
