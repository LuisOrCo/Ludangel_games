function FormModal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cyan-500/30 bg-[#0f172a] p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="form-modal-title" className="text-xl font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default FormModal;
