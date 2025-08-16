import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface InputOTPProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function InputOTP({ length = 6, value = '', onChange, className }: InputOTPProps) {
  const [otp, setOtp] = useState(value.split('').slice(0, length));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const newOtp = value.split('').slice(0, length);
    setOtp([...newOtp, ...Array(length - newOtp.length).fill('')]);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    if (digit.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Move to next input if digit is entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Move to previous input if digit is deleted
    if (!digit && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    onChange?.(newOtp.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (i < length) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
    onChange?.(newOtp.join(''));
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="h-12 w-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      ))}
    </div>
  );
}
