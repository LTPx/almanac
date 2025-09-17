interface Props {
  selected: string;
  setSelected: (val: string) => void;
  hasAnswered: boolean;
  showResult: boolean;
  isCorrect: boolean;
}

export function FillInBlankQuestion({
  selected,
  setSelected,
  hasAnswered,
  showResult,
  isCorrect
}: Props) {
  let resultClasses = "";
  if (showResult && isCorrect) {
    resultClasses =
      "bg-[#32C781] border-[#32C781] text-white placeholder-white";
  } else if (showResult && !isCorrect) {
    resultClasses = "bg-red-500 border-red-500 text-white placeholder-white";
  } else {
    resultClasses = "text-white placeholder-gray-400 focus:border-[#1983DD]";
  }

  return (
    <input
      type="text"
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      disabled={hasAnswered}
      placeholder="Escribe tu respuesta..."
      className={`w-full p-4 rounded-lg border-2 transition-colors ${resultClasses}`}
    />
  );
}
