import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
  language: 'en' | 'es';
}

export function UploadDropzone({ onFileSelect, isAnalyzing, language }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (
        file &&
        (file.type === 'application/pdf' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      ) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const text = {
    en: {
      dropHere: 'Drop your file here',
      or: 'or',
      browse: 'Choose file',
      formats: 'PDF or Word (.docx), max. 10 MB',
      uploading: 'Working on it…',
    },
    es: {
      dropHere: 'Suelta tu archivo aquí',
      or: 'o si prefieres',
      browse: 'Elegir archivo',
      formats: 'PDF o Word (.docx), máximo 10 MB',
      uploading: 'Trabajando en ello…',
    },
  };

  const t = text[language];

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative min-h-[220px] rounded-2xl border-2 border-dashed transition-colors md:min-h-[260px] ${
        isDragging
          ? 'border-primary bg-accent/50'
          : 'border-border bg-card hover:border-primary/35 hover:bg-muted/30'
      }`}
    >
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-6 px-5 py-10 md:min-h-[260px] md:px-10 md:py-12">
        {isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5"
          >
            <Loader2 className="text-primary size-14 animate-spin" aria-hidden />
            <p className="text-foreground text-center text-lg font-medium">{t.uploading}</p>
          </motion.div>
        ) : (
          <>
            <div
              className={`flex h-[72px] w-[72px] items-center justify-center rounded-2xl transition-colors ${
                isDragging ? 'bg-primary/15' : 'bg-primary/10'
              }`}
            >
              {isDragging ? (
                <FileText className="text-primary size-9" aria-hidden />
              ) : (
                <Upload className="text-primary size-9" aria-hidden />
              )}
            </div>

            <div className="max-w-md text-center">
              <p className="text-foreground mb-2 text-lg font-semibold md:text-xl">{t.dropHere}</p>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">{t.or}</p>

              <label htmlFor="file-upload" className="inline-block">
                <span className="bg-primary text-primary-foreground focus-within:ring-primary inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-8 text-base font-semibold shadow-sm focus-within:ring-2 focus-within:ring-offset-2">
                  {t.browse}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                  className="sr-only"
                />
              </label>

              <p className="text-muted-foreground mt-6 text-sm leading-relaxed md:text-base">
                {t.formats}
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
