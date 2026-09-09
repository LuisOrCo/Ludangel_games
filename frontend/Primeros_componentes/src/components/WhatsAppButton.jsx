function WhatsAppButton() {
  const mensaje = encodeURIComponent(
    "Hola, quisiera obtener más información sobre LUDANGEL Games."
  );

  return (
    <a
      href={`https://wa.me/573238797189?text=${mensaje}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-3xl text-white shadow-xl shadow-emerald-950/50 transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-current" aria-hidden="true">
        <path d="M16.01 3.2c-7.08 0-12.8 5.72-12.8 12.8 0 2.25.59 4.45 1.7 6.38L3.1 28.8l6.57-1.72a12.76 12.76 0 0 0 6.34 1.69h.01c7.07 0 12.79-5.72 12.79-12.8S23.08 3.2 16.01 3.2Zm0 23.43h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.9 1.02 1.04-3.8-.25-.4a10.65 10.65 0 1 1 8.91 4.89Zm5.84-7.98c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.52-.16-.74.16-.22.32-.85 1.05-1.04 1.27-.19.21-.39.24-.71.08-.32-.16-1.36-.5-2.59-1.59-.96-.85-1.61-1.9-1.8-2.22-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.21 0-.56.08-.85.4-.29.32-1.12 1.1-1.12 2.67 0 1.57 1.15 3.09 1.31 3.3.16.21 2.25 3.43 5.45 4.82.76.33 1.35.52 1.81.67.76.24 1.45.2 2 .12.61-.09 1.9-.78 2.17-1.54.27-.75.27-1.4.19-1.54-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}

export default WhatsAppButton;
