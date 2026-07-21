import { useRef, useEffect, useState, useCallback } from 'react'

export default function WysiwygEditor({ value, onChange, placeholder = 'Tulis isi pengumuman di sini...' }) {
  const editorRef = useRef(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const savedRangeRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const saveSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
    }
  }, [])

  const restoreSelection = useCallback(() => {
    if (savedRangeRef.current) {
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(savedRangeRef.current)
    }
  }, [])

  const exec = (command, value = null) => {
    editorRef.current?.focus()
    restoreSelection()
    document.execCommand(command, false, value)
    handleInput()
  }

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const ToolbarButton = ({ command, icon, title, value = null, onClick }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        saveSelection()
        if (onClick) {
          onClick()
        } else {
          exec(command, value)
        }
      }}
      title={title}
      className="p-2 rounded hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface"
    >
      <span dangerouslySetInnerHTML={{ __html: icon }} />
    </button>
  )

  const handleLinkClick = () => {
    const selection = window.getSelection()
    const selectedText = selection.toString()

    if (selectedText) {
      saveSelection()
      setShowLinkInput(true)
      setLinkUrl('')
    } else {
      alert('Pilih teks terlebih dahulu untuk membuat hyperlink')
    }
  }

  const handleLinkSubmit = () => {
    if (linkUrl) {
      let url = linkUrl
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      restoreSelection()
      editorRef.current?.focus()
      document.execCommand('createLink', false, url)
      handleInput()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }

  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-surface-container-low border-b border-outline-variant">
        <ToolbarButton command="bold" title="Bold" icon="<b>B</b>" />
        <ToolbarButton command="italic" title="Italic" icon="<i>I</i>" />
        <ToolbarButton command="underline" title="Underline" icon="<u>U</u>" />
        <ToolbarButton command="strikeThrough" title="Strikethrough" icon="<s>S</s>" />

        <div className="w-px h-6 bg-outline-variant mx-1" />

        <ToolbarButton command="insertUnorderedList" title="Bullet List" icon="&#8226; List" />
        <ToolbarButton command="insertOrderedList" title="Numbered List" icon="1. List" />

        <div className="w-px h-6 bg-outline-variant mx-1" />

        <ToolbarButton command="justifyLeft" title="Rata Kiri" icon="&#8676;" />
        <ToolbarButton command="justifyCenter" title="Rata Tengah" icon="&#8596;" />
        <ToolbarButton command="justifyRight" title="Rata Kanan" icon="&#8677;" />
        <ToolbarButton command="justifyFull" title="Rata Kiri-Kanan" icon="&#10053;" />

        <div className="w-px h-6 bg-outline-variant mx-1" />

        <ToolbarButton command="removeFormat" title="Clear Formatting" icon="&#10005;" />
        <ToolbarButton command="createLink" title="Insert Link" icon="&#128279;" onClick={handleLinkClick} />
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 p-2 bg-surface-container-high border-b border-outline-variant">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Masukkan URL (contoh: https://example.com)"
            className="flex-1 px-3 py-1.5 text-sm border border-outline-variant rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLinkSubmit()
              } else if (e.key === 'Escape') {
                setShowLinkInput(false)
                setLinkUrl('')
              }
            }}
          />
          <button
            type="button"
            onClick={handleLinkSubmit}
            className="px-3 py-1.5 text-sm bg-primary text-on-primary rounded hover:opacity-90 transition-opacity"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkInput(false)
              setLinkUrl('')
            }}
            className="px-3 py-1.5 text-sm border border-outline-variant rounded hover:bg-surface-variant transition-colors"
          >
            Batal
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[200px] p-4 bg-surface focus:outline-none prose prose-sm max-w-none"
        style={{ fontFamily: 'inherit' }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9e9e9e;
          pointer-events: none;
        }
        [contenteditable] ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        [contenteditable] ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
