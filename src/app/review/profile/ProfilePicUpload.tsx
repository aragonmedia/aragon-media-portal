"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "am_profile_pic";
const EVENT = "am_profile_pic_changed";
const MAX_BYTES = 512 * 1024; // 512KB — comfortable for a small localStorage payload

export default function ProfilePicUpload({ initials }: { initials: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setDataUrl(stored);
    } catch {}
  }, []);

  function broadcast(next: string | null) {
    try {
      if (next) localStorage.setItem(KEY, next);
      else localStorage.removeItem(KEY);
    } catch {}
    // Same-tab listeners
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 512KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setDataUrl(url);
      broadcast(url);
    };
    reader.onerror = () => setError("Couldn't read that file.");
    reader.readAsDataURL(file);
  }

  function remove() {
    setDataUrl(null);
    broadcast(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="pp-wrap">
      <div className="pp-current" aria-hidden={!dataUrl}>
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Profile picture preview" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="pp-body">
        <p className="pp-title">Profile picture</p>
        <p className="pp-sub">
          Shown in your sidebar avatar. PNG or JPG, up to 512KB.
        </p>
        <div className="pp-row">
          <label className="pp-upload">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onFile}
              hidden
            />
            {dataUrl ? "Change photo" : "Upload photo"}
          </label>
          {dataUrl && (
            <button type="button" className="pp-remove" onClick={remove}>
              Remove
            </button>
          )}
        </div>
        {error && <p className="pp-err">{error}</p>}
      </div>

      <style jsx>{`
        .pp-wrap {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 18px;
          align-items: center;
          padding: 14px 0 4px;
          border-top: 1px solid var(--border-soft);
          margin-top: 14px;
        }
        .pp-current {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%);
          color: var(--bg);
          display: inline-flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 24px; letter-spacing: -0.02em;
          overflow: hidden;
          border: 1px solid var(--border);
          flex-shrink: 0;
        }
        .pp-current img {
          width: 100%; height: 100%; object-fit: cover;
          display: block;
        }
        .pp-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--text); }
        .pp-sub { margin: 3px 0 10px; font-size: 12.5px; color: var(--text-muted); }
        .pp-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .pp-upload, .pp-remove {
          font: inherit; font-size: 12.5px; font-weight: 700;
          padding: 8px 14px; border-radius: 8px;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, color 120ms ease;
        }
        .pp-upload {
          background: var(--gold);
          border: 1px solid var(--gold);
          color: #0B0B0B;
          display: inline-flex; align-items: center;
        }
        .pp-upload:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px -8px rgba(201, 168, 76, 0.6);
        }
        .pp-remove {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
        .pp-remove:hover { border-color: var(--red); color: var(--red); }
        .pp-err { margin: 8px 0 0; color: var(--red); font-size: 12px; }
      `}</style>
    </div>
  );
}
