import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  BookOpen,
  X,
  AlertCircle,
} from 'lucide-react';
import { DifficultyLevel, SubjectCategory } from '../types';

interface UploadMaterialViewProps {
  onGenerateBlueprint: (payload: {
    title: string;
    subject: SubjectCategory;
    difficulty: DifficultyLevel;
    content: string;
    fileBase64?: string;
    mimeType?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  generationStep: string;
  error: string | null;
}

const SUBJECTS: SubjectCategory[] = [
  'Science',
  'Mathematics',
  'Computer Science',
  'Economics',
  'History',
  'Literature',
  'General',
];

const DIFFICULTIES: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export const UploadMaterialView: React.FC<UploadMaterialViewProps> = ({
  onGenerateBlueprint,
  isGenerating,
  generationStep,
  error,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectCategory>('Science');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [content, setContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    mimeType: string;
    base64?: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelection = async (file: File) => {
    setUploadProgress(25);
    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.slice(0, 120));
    }

    if (isPdf || isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const base64 = result.includes(',') ? result.split(',')[1] : '';
        setUploadedFile({
          name: file.name,
          size: file.size,
          mimeType: isPdf ? 'application/pdf' : file.type || 'image/png',
          base64,
        });
        setUploadProgress(100);
      };
      reader.readAsDataURL(file);
    } else {
      const text = await file.text();
      const extractedText = text
        .replace(/<[^>]+>/g, ' ')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (extractedText.length > 0 && !lowerName.endsWith('.docx')) {
        setContent((prev) =>
          prev ? `${prev}\n\n${extractedText.slice(0, 8000)}` : extractedText.slice(0, 8000)
        );
      }
      setUploadedFile({
        name: file.name,
        size: file.size,
        mimeType: 'text/plain',
      });
      setUploadProgress(100);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateBlueprint({
      title: title.trim() || 'Study Chapter',
      subject,
      difficulty,
      content: content.trim(),
      fileBase64: uploadedFile?.base64,
      mimeType: uploadedFile?.mimeType,
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#25243A]">
          What do you want to learn today?
        </h1>
        <p className="text-sm text-[#25243A]/65">
          Upload a PDF/DOCX file, paste your notes, or enter any topic below.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
              isDragging
                ? 'border-[#6546F5] bg-[#6546F5]/10'
                : 'border-[#6546F5]/30 bg-white hover:border-[#6546F5]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelection(file);
              }}
            />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6546F5] to-[#398BFF] text-white flex items-center justify-center mx-auto shadow-md">
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-[#25243A]">
              Drop PDF, DOCX, or TXT file here, or click to browse
            </p>
          </div>

          {uploadedFile && (
            <div className="p-4 rounded-2xl bg-white border border-emerald-500/30 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#25243A]">{uploadedFile.name}</p>
                    <p className="text-xs text-[#25243A]/60 tabular-nums">
                      {formatBytes(uploadedFile.size)} · {uploadProgress}%
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadProgress(0);
                  }}
                  className="p-1.5 rounded-lg text-[#25243A]/50 hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-5 border border-[#25243A]/10 space-y-2.5">
            <label className="text-sm font-bold text-[#25243A] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#6546F5]" />
              <span>Paste Notes or Enter Topic Content</span>
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your study notes, chapter text, or describe the topic you want to learn..."
              className="w-full p-3.5 rounded-2xl bg-[#F6F5FF] border border-transparent focus:border-[#6546F5] focus:bg-white text-sm text-[#25243A] leading-relaxed focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-[#25243A]/10 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#25243A]/75 mb-1.5">
                Chapter / Topic Title
              </label>
              <input
                type="text"
                required={!uploadedFile && !content}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter chapter or topic title..."
                className="w-full px-4 py-3 rounded-xl bg-[#F6F5FF] border border-transparent focus:border-[#6546F5] focus:bg-white text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A]/75 mb-1.5">
                Subject
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSubject(subj)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                      subject === subj
                        ? 'bg-[#6546F5] text-white'
                        : 'bg-[#F6F5FF] text-[#25243A]/80 hover:bg-[#6546F5]/10'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A]/75 mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      difficulty === diff
                        ? 'bg-[#398BFF] text-white'
                        : 'bg-[#F6F5FF] text-[#25243A]/80 hover:bg-[#398BFF]/10'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || (!title.trim() && !content.trim() && !uploadedFile)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6546F5] to-[#398BFF] hover:opacity-95 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{generationStep || 'Generating Blueprint...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate My Learning Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
