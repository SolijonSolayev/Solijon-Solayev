import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Code2, Layers, X } from 'lucide-react';
import { ProjectItem } from '../types/profile';
import { formatUzbekText, UzbekAlphabetMode } from '../utils/uzbekAlphabet';

interface ProjectLightboxProps {
  project: ProjectItem | null;
  onClose: () => void;
  alphabetMode: UzbekAlphabetMode;
}

export const ProjectLightbox: React.FC<ProjectLightboxProps> = ({
  project,
  onClose,
  alphabetMode,
}) => {
  const [imgError, setImgError] = useState(false);
  const tr = (text: string) => formatUzbekText(text, alphabetMode);

  useEffect(() => {
    setImgError(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-8 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-project-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl rounded-2xl bg-[#0F0F12] border border-zinc-800 overflow-hidden my-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800 bg-[#050505]/70">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{tr(project.category)}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{project.year}</span>
                <span aria-hidden="true">·</span>
                <span>{project.client}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={tr('Yopish')}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media showcase with Zero-Broken-Image fallback */}
            <div className="relative aspect-video w-full bg-[#050505] border-b border-zinc-800 overflow-hidden">
              {!imgError && project.imageUrl ? (
                <motion.img
                  initial={{ scale: 1.04 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  src={project.imageUrl}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-zinc-900 via-[#0F0F12] to-[#050505] text-center">
                  <Layers className="w-10 h-10 text-blue-500 mb-3" />
                  <p className="text-base font-medium text-zinc-200">{project.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {tr(project.category)} · {project.year}
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-blue-400 font-medium">{project.role}</p>
                  <h2 id="lightbox-project-title" className="text-xl md:text-2xl font-bold text-white mt-0.5">
                    {project.title}
                  </h2>
                </div>
                <div className="text-xs font-mono-tabular text-zinc-200 bg-black/70 border border-zinc-800 px-3 py-1.5 rounded-lg">
                  {tr('Natija:')} {project.impactMetric}
                </div>
              </div>
            </div>

            {/* Detailed case study body */}
            <div className="p-6 md:p-8 space-y-6">
              <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                {project.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-zinc-800/80">
                <div>
                  <h3 className="text-sm font-semibold text-white">{tr('Muammo va Vazifa')}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-2">
                    {project.challenge}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{tr('Arxitektura va Yechim')}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-2">
                    {project.solution}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">{tr("Qo'llanilgan texnologiyalar")}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono-tabular text-zinc-300">
                    {project.technologies.map((tech, idx) => (
                      <React.Fragment key={tech}>
                        <span>{tech}</span>
                        {idx < project.technologies.length - 1 && (
                          <span aria-hidden="true" className="text-zinc-600">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Code2 className="w-4 h-4" /> {tr('Manba kodi')}
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      {tr("Loyihani ko'rish")} <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
