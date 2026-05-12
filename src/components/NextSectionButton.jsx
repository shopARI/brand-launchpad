export default function NextSectionButton({ nextSection, nextLabel, setActiveSection }) {
  if (!nextSection) return null;

  return (
    <div className="mt-8 pt-6 border-t border-border/30">
      <button
        onClick={() => setActiveSection(nextSection)}
        className="w-full py-4 bg-accent text-white rounded-xl text-lg font-semibold hover:bg-accent/90 transition-all group"
      >
        Next: {nextLabel}
        <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
      </button>
    </div>
  );
}
