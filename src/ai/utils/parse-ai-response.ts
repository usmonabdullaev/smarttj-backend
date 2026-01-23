export const parseAIResponse = (text: string) => {
  const answer = text.match(
    /answer:\s*([\s\S]*?)(?:\nconfidence:|confidence:|$)/i,
  );
  const confidenceMatch = text.match(/confidence:\s*([0-9.]+)/i);

  return {
    text: answer?.[1]?.trim() ?? text.trim(),
    confidense: confidenceMatch
      ? Math.min(Math.max(Number(confidenceMatch[1]), 0), 1)
      : 0.5,
  };
};
