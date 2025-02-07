"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import "./App.css";

export default function App() {
  const [bgColor, setBgColor] = useState("white");
  const [buttonColor, setButtonColor] = useState("red");
  const [debugInfo, setDebugInfo] = useState({ hex: "#FF0000", pressTime: 0 });
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
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }, []);

  const updateButtonColor = useCallback(() => {
    if (pressStartTime.current && isPressing.current) {
      const duration = Date.now() - pressStartTime.current;
      const color = generateColor(duration);
      setButtonColor(color);
      setDebugInfo({
        hex: color,
        pressTime: duration,
      });
    }

    if (isPressing.current) {
      animationFrameId.current = requestAnimationFrame(updateButtonColor);
    }
  }, [generateColor]);

  const handleInteractionStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      isPressing.current = true;
      pressStartTime.current = Date.now();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      updateButtonColor();
    },
    [updateButtonColor]
  );

  const handleInteractionEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      isPressing.current = false;
      if (pressStartTime.current) {
        const duration = Date.now() - pressStartTime.current;
        const color = generateColor(duration);
        setBgColor(color);

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
          ripple.className = "ripple";
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
      setButtonColor("red");
      setDebugInfo({ hex: "#FF0000", pressTime: 0 });
    },
    [generateColor]
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
    <main className="main" style={{ backgroundColor: bgColor }}>
      <div
        ref={circleRef}
        className={`circle ${isPressing.current ? "pressed" : ""}`}
        style={{ backgroundColor: buttonColor }}
      ></div>
      <div className="debug">
        {/* <p>Button Color: {debugInfo.hex}</p> */}
        <p>Press Time: {debugInfo.pressTime}ms</p>
      </div>
    </main>
  );
}
