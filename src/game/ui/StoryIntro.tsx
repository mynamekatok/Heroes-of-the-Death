import { useState, useEffect, useCallback } from 'react';
import { STORY_SLIDES } from '../utils/constants';

interface StoryIntroProps {
  onComplete: () => void;
}

export function StoryIntro({ onComplete }: StoryIntroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showSkip, setShowSkip] = useState(false);

  const typeText = useCallback((text: string) => {
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentSlide < STORY_SLIDES.length) {
      const cleanup = typeText(STORY_SLIDES[currentSlide].text);
      const skipTimer = setTimeout(() => setShowSkip(true), 1000);
      return () => {
        cleanup();
        clearTimeout(skipTimer);
      };
    }
  }, [currentSlide, typeText]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        advance();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentSlide, isTyping]);

  const advance = () => {
    if (isTyping) {
      // Show full text immediately
      setDisplayedText(STORY_SLIDES[currentSlide]?.text || '');
      setIsTyping(false);
      return;
    }

    if (currentSlide < STORY_SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black"
      onClick={advance}>
      {/* Background image that changes with slides */}
      <div className="absolute inset-0 opacity-30 transition-all duration-1000"
        style={{
          backgroundImage: currentSlide < 3
            ? 'url(/assets/title_bg.jpg)'
            : currentSlide < 5
              ? 'url(/assets/zone_beach.jpg)'
              : 'url(/assets/zone_forest.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px)',
        }} />

      {/* Vignette */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, black 80%)' }} />

      {/* Text container */}
      <div className="relative z-10 max-w-3xl px-8 text-center">
        <p className="text-2xl md:text-3xl font-serif leading-relaxed min-h-[120px]"
          style={{
            color: '#F4E4C1',
            textShadow: '0 0 20px rgba(196, 30, 58, 0.5), 0 2px 4px rgba(0,0,0,0.8)',
          }}>
          {displayedText}
          {isTyping && <span className="animate-pulse" style={{ color: '#C41E3A' }}>|</span>}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-12">
          {STORY_SLIDES.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: i <= currentSlide ? '#C41E3A' : '#333',
                transform: i === currentSlide ? 'scale(1.5)' : 'scale(1)',
              }} />
          ))}
        </div>

        {/* Advance hint */}
        {!isTyping && (
          <p className="mt-8 text-sm animate-pulse" style={{ color: '#555' }}>
            [Нажмите Пробел, Enter или Клик]
          </p>
        )}
      </div>

      {/* Skip button */}
      {showSkip && (
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="absolute top-6 right-6 px-4 py-2 rounded text-sm transition-all hover:scale-105"
          style={{
            backgroundColor: 'rgba(45, 47, 69, 0.8)',
            color: '#A39B8B',
            border: '1px solid #555',
          }}>
          Пропустить
        </button>
      )}
    </div>
  );
}
