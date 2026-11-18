'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';

const HeroVideo = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const hideControlsTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasAudio, setHasAudio] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [feedback, setFeedback] = useState(null); // 'play' | 'pause'

  // Reliable autoplay & audio track detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay was blocked by browser policy (e.g., mobile battery saver)
          setIsPlaying(false);
        });
    }

    const checkAudio = () => {
      if (
        (video.audioTracks && video.audioTracks.length > 0) ||
        video.mozHasAudio ||
        Boolean(video.webkitAudioDecodedByteCount)
      ) {
        setHasAudio(true);
      }
    };

    video.addEventListener('loadedmetadata', checkAudio);

    return () => {
      video.removeEventListener('loadedmetadata', checkAudio);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  // Listen to browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(
        document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const triggerFeedback = (type) => {
    setFeedback(type);
    setTimeout(() => {
      setFeedback(null);
    }, 600);
  };

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          triggerFeedback('play');
        })
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      triggerFeedback('pause');
    }
  }, []);

  const handleRestart = useCallback((e) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video
      .play()
      .then(() => {
        setIsPlaying(true);
        triggerFeedback('play');
      })
      .catch(() => {});
  }, []);

  const handleToggleMute = useCallback((e) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  }, []);

  const handleToggleFullscreen = useCallback((e) => {
    e?.stopPropagation();
    const container = containerRef.current || videoRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(pct);
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video || !video.duration) return;

    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPct = Math.max(0, Math.min(1, clickX / rect.width));
    video.currentTime = newPct * video.duration;
    setProgress(newPct * 100);
  };

  const handleUserActivity = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 2800);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      handlePlayPause();
    } else if (e.key === 'f') {
      e.preventDefault();
      handleToggleFullscreen(e);
    } else if (e.key === 'm' && hasAudio) {
      e.preventDefault();
      handleToggleMute(e);
    }
  };

  return (
    <section
      id="home"
      aria-label="Kite Brand Motion Video Banner"
      className="relative w-full bg-[#050B14] overflow-hidden select-none"
    >
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseMove={handleUserActivity}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => {
          if (videoRef.current && !videoRef.current.paused) {
            setShowControls(false);
          }
        }}
        className="relative w-full aspect-video max-h-[85vh] 2xl:max-h-[88vh] mx-auto overflow-hidden group focus:outline-none focus:ring-1 focus:ring-[#00aeef]/40"
      >
        {/* Main Banner Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/videos/kite-motion-poster.jpg"
          onClick={handlePlayPause}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-label="Kite Motion Brand Video"
          className="w-full h-full object-cover object-center cursor-pointer block"
        >
          {/* Web-optimized 1080p faststart version first */}
          <source src="/videos/kite-motion-banner.mp4" type="video/mp4" />
          {/* Original file in /videos/ */}
          <source src="/videos/Kite Motion Banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Brand Badge - Sleek Corporate Indicator */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-6 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-semibold text-white/90 tracking-wider uppercase shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#00aeef] animate-pulse" />
            <span>House of Kite</span>
          </div>
        </div>

        {/* Center Play Button Overlay when paused */}
        {!isPlaying && (
          <div
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-10 cursor-pointer transition-opacity duration-300"
          >
            <button
              type="button"
              className="group/btn relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#00aeef]/90 hover:bg-[#00aeef] text-white shadow-2xl shadow-[#00aeef]/40 transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/30"
              aria-label="Play video"
            >
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Center Feedback Pulse on click */}
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="p-4 sm:p-5 rounded-full bg-black/70 text-white backdrop-blur-md shadow-2xl animate-scale-fade">
              {feedback === 'play' ? (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-0.5" />
              ) : (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </div>
          </div>
        )}

        {/* Bottom Shade Vignette for seamless section blend */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-[#050B14] via-[#050B14]/40 to-transparent pointer-events-none z-10" />

        {/* Floating Controls Bar (Bottom Right) */}
        <div
          className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-5 z-20 flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-300 ${
            showControls || !isPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            className="p-1.5 sm:p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            ) : (
              <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Replay Button */}
          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 sm:p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
            aria-label="Restart video"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Audio Mute/Unmute (if audio track present) */}
          {hasAudio && (
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-1.5 sm:p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-1.5 sm:p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            ) : (
              <Maximize className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            )}
          </button>
        </div>

        {/* Interactive Progress Bar */}
        <div
          ref={progressBarRef}
          role="slider"
          aria-label="Video playback progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onClick={handleProgressClick}
          className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-white/25 hover:h-2.5 transition-all duration-200 cursor-pointer z-30 group/progress"
        >
          <div
            className="h-full bg-gradient-to-r from-[#00aeef] via-[#38bdf8] to-[#ed028c] relative transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity -mr-1.5 ring-2 ring-[#00aeef]/60" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-fade {
          0% {
            opacity: 0;
            transform: scale(0.7);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(1.3);
          }
        }
        .animate-scale-fade {
          animation: scale-fade 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default HeroVideo;

