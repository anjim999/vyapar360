// src/components/LanguageSelector.jsx - Multi-language Selector
import { useState, useRef, useEffect } from 'react';
import { FaGlobe, FaCheck } from 'react-icons/fa';

const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' }
];

export default function LanguageSelector() {
    const [currentLang, setCurrentLang] = useState(() => {
        const saved = localStorage.getItem('language') || 'en';
        return languages.find(l => l.code === saved) || languages[0];
    });
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = async (code) => {
        try {
            // Dynamic import of i18n to avoid initialization issues
            const i18n = (await import('../i18n')).default;
            i18n.changeLanguage(code);
        } catch (err) {
            console.error('Failed to change language:', err);
        }
        localStorage.setItem('language', code);
        setCurrentLang(languages.find(l => l.code === code) || languages[0]);
        setIsOpen(false);
        // Reload page to apply language change
        window.location.reload();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg theme-bg-tertiary hover:theme-bg-secondary transition-colors"
                title="Change Language"
            >
                <FaGlobe className="theme-text-muted" />
                <span className="text-lg">{currentLang.flag}</span>
                <span className="text-sm theme-text-secondary hidden sm:inline">{currentLang.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 theme-bg-secondary rounded-xl theme-shadow-lg border theme-border-light z-50 overflow-hidden animate-fade-in-down">
                    <div className="p-2">
                        <p className="text-xs theme-text-muted px-2 py-1 uppercase tracking-wide">Select Language</p>
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${currentLang.code === lang.code
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                : 'hover:theme-bg-tertiary theme-text-secondary'
                                }`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <div className="flex-1">
                                <p className="font-medium">{lang.nativeName}</p>
                                <p className="text-xs theme-text-muted">{lang.name}</p>
                            </div>
                            {currentLang.code === lang.code && <FaCheck className="text-blue-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
