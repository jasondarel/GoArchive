"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Injected once — custom scrollbar for the select list
const SELECT_SCROLL_CLASS = "select-input-scroll";
if (typeof document !== "undefined") {
  const styleId = "select-input-scroll-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .${SELECT_SCROLL_CLASS}::-webkit-scrollbar { width: 4px; }
      .${SELECT_SCROLL_CLASS}::-webkit-scrollbar-track { background: transparent; margin-block: 4px; }
      .${SELECT_SCROLL_CLASS}::-webkit-scrollbar-thumb { background: #d4b896; border-radius: 0; }
      .${SELECT_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover { background: #b8956e; }
    `;
    document.head.appendChild(style);
  }
}

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  placement?: "top" | "bottom";
  searchable?: boolean;
  onCreateNew?: (inputValue: string) => void;
  createNewText?: string;
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder = "— Select —",
  disabled,
  placement = "bottom",
  searchable = false,
  onCreateNew,
  createNewText = "Add new",
}: SelectInputProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const [searchQuery, setSearchQuery] = useState(
    selected ? selected.label : "",
  );

  useEffect(() => {
    if (selected) {
      setSearchQuery(selected.label);
    } else {
      setSearchQuery("");
    }
  }, [selected]);

  useEffect(() => {
    if (!open) {
      setSearchQuery(selected ? selected.label : "");
    }
  }, [open, selected]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <div
        className={[
          "w-full flex items-center justify-between border-b pb-2.5 text-[0.9375rem] transition-colors focus-within:border-[#1a1714]",
          open
            ? "border-[#1a1714]"
            : "border-[#c4a882]/50 hover:border-[#c4a882]",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-text",
        ].join(" ")}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            if (searchable && searchInputRef.current) {
              searchInputRef.current.focus();
            }
          }
        }}
      >
        {searchable ? (
          <input
            ref={searchInputRef}
            type="text"
            disabled={disabled}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent focus:outline-none text-[#1a1714] placeholder-[#c4a882]/50 disabled:cursor-not-allowed"
          />
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            className={`w-full text-left focus:outline-none ${
              selected ? "text-[#1a1714]" : "text-[#c4a882]/50"
            }`}
          >
            {selected ? selected.label : placeholder}
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="ml-2 focus:outline-none"
        >
          <ChevronDown
            size={14}
            className={`text-[#c4a882] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          className={`absolute left-0 right-0 z-50 bg-[#f5f0e8] border border-[#d4b896]/40 shadow-[0_8px_24px_rgba(26,23,20,0.12)] overflow-hidden flex flex-col ${
            placement === "top" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {placement !== "top" && (
            <>
              {/* Placeholder / clear option */}
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={[
                  "w-full text-left px-4 py-2.5 text-[0.8rem] tracking-wide transition-colors",
                  !value
                    ? "text-[#8a7968] bg-[#ede8de]"
                    : "text-[#c4a882]/60 hover:bg-[#ede8de]/60 hover:text-[#8a7968]",
                ].join(" ")}
              >
                {placeholder}
              </button>

              {/* Divider */}
              <div className="h-px bg-[#d4b896]/30 mx-3" />
            </>
          )}

          {/* Options */}
          <div
            className={`max-h-48 overflow-y-auto pr-1 ${SELECT_SCROLL_CLASS}`}
            style={
              {
                scrollbarWidth: "thin",
                scrollbarColor: "#d4b896 transparent",
              } as React.CSSProperties
            }
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center flex flex-col items-center gap-2">
                <span className="text-[0.8rem] text-[#8a7968] italic">
                  No results found
                </span>
                {onCreateNew && searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                      onCreateNew(searchQuery.trim());
                    }}
                    className="text-[0.7rem] tracking-widest uppercase font-medium bg-[#1a1714] text-[#f5f0e8] hover:bg-[#d4b896] hover:text-[#1a1714] transition-colors duration-300 px-4 py-1.5 rounded-sm"
                  >
                    {createNewText} "{searchQuery.trim()}"
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={[
                      "w-full text-left px-4 py-2.5 text-[0.9rem] transition-colors flex items-center justify-between group",
                      isActive
                        ? "bg-[#1a1714] text-[#f5f0e8]"
                        : "text-[#1a1714] hover:bg-[#ede8de]",
                    ].join(" ")}
                  >
                    <span>{opt.label}</span>
                    {isActive && (
                      <span className="text-[#c4a882] text-[0.6rem] tracking-[0.15em] uppercase">
                        selected
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {placement === "top" && (
            <>
              {/* Divider */}
              <div className="h-px bg-[#d4b896]/30 mx-3" />

              {/* Placeholder / clear option */}
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={[
                  "w-full text-left px-4 py-2.5 text-[0.8rem] tracking-wide transition-colors",
                  !value
                    ? "text-[#8a7968] bg-[#ede8de]"
                    : "text-[#c4a882]/60 hover:bg-[#ede8de]/60 hover:text-[#8a7968]",
                ].join(" ")}
              >
                {placeholder}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
