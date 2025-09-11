interface Props {
  selected: string;
  setSelected: (val: string) => void;
  hasAnswered: boolean;
}

export function FillInBlankQuestion({
  selected,
  setSelected,
  hasAnswered
}: Props) {
  return (
    <input
      type="text"
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      disabled={hasAnswered}
      placeholder="Escribe tu respuesta..."
      className="w-full p-4 rounded-lg bg-[464952] border-2 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:opacity-50"
    />
  );
}
