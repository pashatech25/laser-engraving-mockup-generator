import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Search } from 'lucide-react';

interface CommandProps {
  placeholder?: string;
  items: Array<{ value: string; label: string }>;
  onSelect?: (value: string) => void;
  className?: string;
}

export function Command({ placeholder = "Search...", items, onSelect, className }: CommandProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        onSelect?.(filteredItems[selectedIndex].value);
        setIsOpen(false);
        setSearch('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {isOpen && filteredItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-50">
          {filteredItems.map((item, index) => (
            <div
              key={item.value}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-gray-100",
                index === selectedIndex && "bg-blue-100"
              )}
              onClick={() => {
                onSelect?.(item.value);
                setIsOpen(false);
                setSearch('');
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
