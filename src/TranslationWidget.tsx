import { useState } from 'react'
import './TranslationWidget.css'

interface TranslationWidgetProps {
  onTranslate?: (translatedText: string, targetLang: string) => void
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'th', name: 'Thai' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
]

export default function TranslationWidget({ onTranslate }: TranslationWidgetProps) {
  const [inputText, setInputText] = useState('')
  const [targetLang, setTargetLang] = useState('vi')
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translateText = async () => {
    const textToTranslate = inputText.trim()
    if (!textToTranslate) return

    setLoading(true)
    setError(null)

    try {
      // Using Google Translate API - translates from English to Vietnamese
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`
      )
      
      if (!response.ok) {
        throw new Error('Translation failed')
      }
      
      const data = await response.json()
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translated = data[0].map((item: any) => item[0]).filter(Boolean).join('')
        setTranslatedText(translated)
        if (onTranslate) {
          onTranslate(translated, targetLang)
        }
      } else {
        throw new Error('Translation not available')
      }
    } catch (err) {
      setError('Unable to translate. Please try again.')
      console.error('Translation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      translateText()
    }
  }

  return (
    <div className="translation-widget">
      <div className="translation-header">
        <span className="translation-icon">🌐</span>
        <h3>English to Vietnamese Translator</h3>
      </div>
      
      <div className="translation-content">
        <div className="source-text">
          <label>Enter English Text:</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type English text here..."
            className="text-input"
            rows={3}
          />
        </div>

        <div className="translation-controls">
          <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            className="language-select"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button 
            onClick={translateText}
            disabled={loading || !inputText.trim()}
            className="translate-button"
          >
            {loading ? '⏳ Translating...' : '🔄 Translate'}
          </button>
        </div>

        {translatedText && (
          <div className="translated-text">
            <label>Translation ({LANGUAGES.find(l => l.code === targetLang)?.name}):</label>
            <div className="text-display translation-result">{translatedText}</div>
          </div>
        )}

        {error && (
          <div className="translation-error">
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  )
}
