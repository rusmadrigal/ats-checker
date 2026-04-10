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
      dropHere: 'Drop your resume here',
      or: 'or',
      browse: 'Browse files',
      formats: 'PDF or DOCX up to 10MB',
      uploading: 'Analyzing...',
    },
    es: {
      dropHere: 'Arrastra tu CV aquí',
      or: 'o',
      browse: 'Examinar archivos',
      formats: 'PDF o DOCX hasta 10MB',
      uploading: 'Analizando...',
    },
  };

  const t = text[language];

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl border-2 border-dashed p-8 transition-all md:p-12 ${
        isDragging
          ? 'border-primary bg-accent/50 scale-105'
          : 'border-border bg-card hover:border-primary/50 hover:bg-accent/20'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="text-primary h-12 w-12 animate-spin" />
            <p className="text-foreground font-medium">{t.uploading}</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              animate={{ y: isDragging ? -8 : 0 }}
              transition={{ duration: 0.2 }}
              className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl"
            >
              {isDragging ? (
                <FileText className="text-primary h-8 w-8" />
              ) : (
                <Upload className="text-primary h-8 w-8" />
              )}
            </motion.div>

            <div className="text-center">
              <p className="text-foreground mb-2 text-base font-semibold md:text-lg">
                {t.dropHere}
              </p>
              <p className="text-muted-foreground mb-4 text-xs md:text-sm">{t.or}</p>

              <label htmlFor="file-upload">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30 inline-block cursor-pointer rounded-xl px-6 py-3 font-semibold shadow-lg transition-all hover:shadow-xl"
                >
                  {t.browse}
                </motion.span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>

              <p className="text-muted-foreground mt-4 text-sm">{t.formats}</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
