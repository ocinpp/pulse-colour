"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import styles from "./App.module.css";

const colorPalette = ["#00aba9", "#ff0097", "#a200ff", "#1ba1e2", "#f09609"];
const showDebug = false;

const getRandomColor = (exclude?: string) => {
  const availableColors = exclude
    ? colorPalette.filter((color) => color !== exclude)
    : colorPalette;
  return availableColors[Math.floor(Math.random() * availableColors.length)];
};

const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export default function App() {
  const [bgColor, setBgColor] = useState(() => getRandomColor());
  const [buttonColor, setButtonColor] = useState(() => getRandomColor(bgColor));
  const [debugInfo, setDebugInfo] = useState({ pressTime: 0 });
  const [hexCode, setHexCode] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const circleRef = useRef<HTMLDivElement>(null);
  const pressStartTime = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const isPressing = useRef(false);

  const generateColor = useCallback((duration: number) => {
    const baseHue = ((duration / 5000) * 360) % 360;
    const randomOffset = Math.random() * 60 - 30; // Random offset between -30 and 30
    const hue = (baseHue + randomOffset + 360) % 360;
    const saturation = 80 + Math.random() * 20; // Random saturation between 80% and 100%
    const lightness = 40 + Math.random() * 20; // Random lightness between 40% and 60%
    return hslToHex(hue, saturation, lightness);
  }, []);

  const animateHexCode = useCallback((color: string) => {
    setIsAnimating(true);
    const hex = color.startsWith("#") ? color : `#${color}`;
    const parts = ["#", hex.slice(1, 3), hex.slice(3, 5), hex.slice(5)];
    setHexCode([]);
    parts.forEach((part, index) => {
      setTimeout(() => {
        setHexCode((prev) => [...prev, part.toUpperCase()]);
        if (index === parts.length - 1) {
          setTimeout(() => setIsAnimating(false), 500); // Allow interaction after last part is shown
        }
      }, (index + 1) * 700);
    });
  }, []);

  const updateButtonColor = useCallback(() => {
    if (pressStartTime.current && isPressing.current) {
      const duration = Date.now() - pressStartTime.current;
      const color = generateColor(duration);
      setButtonColor(color);
      setDebugInfo({
        pressTime: duration,
      });
    }

    // Force repaint for Safari
    if (circleRef.current) {
      circleRef.current.style.display = "none";
      circleRef.current.offsetHeight; // Trigger a reflow
      circleRef.current.style.display = "";
    }

    if (isPressing.current) {
      animationFrameId.current = requestAnimationFrame(updateButtonColor);
    }
  }, [generateColor]);

  const handleInteractionStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (isAnimating) return; // Prevent interaction while animating
      e.preventDefault();
      isPressing.current = true;
      pressStartTime.current = Date.now();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      updateButtonColor();
    },
    [updateButtonColor, isAnimating]
  );

  const handleInteractionEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (isAnimating) return; // Prevent interaction while animating
      e.preventDefault();
      isPressing.current = false;
      if (pressStartTime.current) {
        const duration = Date.now() - pressStartTime.current;
        const color = generateColor(duration);
        setBgColor(color);
        animateHexCode(color);

        // Create ripple effect on release
        const circle = circleRef.current;
        if (circle) {
          const rect = circle.getBoundingClientRect();
          const x =
            ("clientX" in e ? e.clientX : e.changedTouches[0].clientX) -
            rect.left;
          const y =
            ("clientY" in e ? e.clientY : e.changedTouches[0].clientY) -
            rect.top;

          const ripple = document.createElement("div");
          ripple.className = styles.ripple;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;

          circle.appendChild(ripple);

          setTimeout(() => {
            ripple.remove();
          }, 1000);
        }
      }
      pressStartTime.current = null;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    },
    [generateColor, animateHexCode, isAnimating]
  );

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      handleInteractionStart(e as unknown as React.TouchEvent);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleInteractionEnd(e as unknown as React.TouchEvent);
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleInteractionStart(e as unknown as React.MouseEvent);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      handleInteractionEnd(e as unknown as React.MouseEvent);
    };

    circle.addEventListener("touchstart", handleTouchStart, { passive: false });
    circle.addEventListener("touchend", handleTouchEnd, { passive: false });
    circle.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      circle.removeEventListener("touchstart", handleTouchStart);
      circle.removeEventListener("touchend", handleTouchEnd);
      circle.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleInteractionStart, handleInteractionEnd]);

  return (
    <main className={styles.main} style={{ backgroundColor: bgColor }}>
      <div className={styles.hexCodeWrapper}>
        {hexCode.length > 0 && (
          <div className={styles.hexCodeContainer}>
            <div className={`${styles.hexCodeDescription} ${styles.slideIn1}`}>
              Your colour is
            </div>
            {/* {hexCode.map((part, index) => (
              <div
                key={index}
                className={`${styles.hexCodePart} ${styles.slideIn}`}
              >
                {part}
              </div>
            ))} */}
            <div className={`${styles.hexCodePart} ${styles.slideIn2}`}>
              {hexCode}
            </div>
          </div>
        )}
      </div>
      <div className={styles.circleWrapper}>
        <div
          ref={circleRef}
          className={`${styles.circle} ${isAnimating ? styles.disabled : ""}`}
          style={{ backgroundColor: buttonColor }}
        ></div>
      </div>
      {showDebug && (
        <div className={styles.debug}>
          <p>Background Color: {bgColor}</p>
          <p>Button Color: {buttonColor}</p>
          <p>Press Time: {debugInfo.pressTime}ms</p>
        </div>
      )}
    </main>
  );
}
