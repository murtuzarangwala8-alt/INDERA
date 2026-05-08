import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Star, GripVertical, Image } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange, maxImages = 6 }) => {
  const [draggingOver, setDraggingOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File drop / select ──────────────────────────────────────
  const readFiles = (files: FileList) => {
    const remaining = maxImages - images.length;
    const toRead = Array.from(files).slice(0, remaining);
    if (toRead.length === 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    toRead.forEach((file) => {
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange([...images, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    if (e.dataTransfer.files.length > 0) {
      readFiles(e.dataTransfer.files);
    }
  }, [images]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDraggingOver(true); };
  const onDragLeave = () => setDraggingOver(false);

  // ── URL add ─────────────────────────────────────────────────
  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (images.length >= maxImages) { toast.error(`Maximum ${maxImages} images`); return; }
    if (images.includes(url)) { toast.error('Image already added'); return; }
    onChange([...images, url]);
    setUrlInput('');
  };

  // ── Remove ──────────────────────────────────────────────────
  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // ── Set primary (move to index 0) ───────────────────────────
  const setPrimary = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [item] = updated.splice(index, 1);
    updated.unshift(item);
    onChange(updated);
    toast.success('Set as primary image');
  };

  // ── Drag to reorder ─────────────────────────────────────────
  const onItemDragStart = (index: number) => setDragIndex(index);
  const onItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const onItemDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) { setDragIndex(null); setDragOverIndex(null); return; }
    const updated = [...images];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, dragged);
    onChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const onItemDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all duration-300 ${
          draggingOver
            ? 'border-gold-400 bg-gold-400/5'
            : 'border-ivory/10 hover:border-gold-400/40 hover:bg-ivory/2'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && readFiles(e.target.files)}
        />
        <motion.div animate={{ scale: draggingOver ? 1.05 : 1 }} transition={{ duration: 0.2 }}>
          <Upload size={28} className={`mx-auto mb-3 transition-colors ${draggingOver ? 'text-gold-400' : 'text-ivory/20'}`} />
          <p className={`font-sans text-sm transition-colors ${draggingOver ? 'text-gold-400' : 'text-ivory/40'}`}>
            {draggingOver ? 'Drop images here' : 'Drag & drop images or click to browse'}
          </p>
          <p className="text-ivory/20 text-[10px] tracking-widest uppercase font-sans mt-2">
            JPG, PNG, WEBP — Max {maxImages} images
          </p>
        </motion.div>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Image size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/20" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            placeholder="Or paste image URL and press Enter..."
            className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 pl-9 pr-4 py-2.5 text-xs font-sans outline-none focus:border-gold-400/50 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          className="px-4 py-2.5 border border-gold-400/30 text-gold-400 text-xs tracking-widest uppercase font-sans hover:bg-gold-400/10 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Image Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {images.map((img, i) => (
              <motion.div
                key={img}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                draggable
                onDragStart={() => onItemDragStart(i)}
                onDragOver={(e) => onItemDragOver(e, i)}
                onDrop={(e) => onItemDrop(e, i)}
                onDragEnd={onItemDragEnd}
                className={`relative group aspect-square rounded-sm overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 ${
                  dragOverIndex === i && dragIndex !== i ? 'ring-2 ring-gold-400 scale-105' : ''
                } ${dragIndex === i ? 'opacity-40' : ''}`}
                style={{ border: i === 0 ? '2px solid rgba(201,168,76,0.6)' : '1px solid rgba(255,255,255,0.05)' }}
              >
                <img src={img} alt={`Product image ${i + 1}`} className="w-full h-full object-cover" />

                {/* Primary badge */}
                {i === 0 && (
                  <div className="absolute top-1.5 left-1.5 bg-gold-400 text-obsidian text-[8px] tracking-widest uppercase font-sans px-1.5 py-0.5 flex items-center gap-1">
                    <Star size={8} className="fill-current" /> Primary
                  </div>
                )}

                {/* Drag handle */}
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-obsidian/70 p-1 rounded-sm">
                    <GripVertical size={12} className="text-ivory/60" />
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/50 transition-all duration-300 flex items-center justify-center gap-2">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimary(i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-gold-400 text-obsidian p-1.5 rounded-sm hover:bg-gold-300"
                      title="Set as primary"
                    >
                      <Star size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-terracotta text-ivory p-1.5 rounded-sm hover:bg-terracotta/80"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Image number */}
                <div className="absolute bottom-1.5 right-1.5 bg-obsidian/60 text-ivory/50 text-[9px] font-sans px-1.5 py-0.5 rounded-sm">
                  {i + 1}/{images.length}
                </div>
              </motion.div>
            ))}

            {/* Add more slot */}
            {images.length < maxImages && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border border-dashed border-ivory/10 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-gold-400/40 hover:bg-ivory/2 transition-all"
              >
                <Upload size={18} className="text-ivory/20 mb-1" />
                <span className="text-ivory/20 text-[9px] tracking-widest uppercase font-sans">Add More</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {images.length > 0 && (
        <p className="text-ivory/20 text-[10px] font-sans">
          {images.length}/{maxImages} images · Drag to reorder · First image is the primary display image
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
