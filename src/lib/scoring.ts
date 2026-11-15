export type ScorableAnswer = { selectedIndex:number|null; correctIndex:number };

export function scoreAnswers(answers:ScorableAnswer[], totalQuestions=answers.length) {
  const correct = answers.reduce((count, answer) => count + (answer.selectedIndex !== null && answer.selectedIndex === answer.correctIndex ? 1 : 0), 0);
  const unanswered = answers.reduce((count, answer) => count + (answer.selectedIndex === null ? 1 : 0), 0);
  return { correct, unanswered, score: totalQuestions > 0 ? Math.round(correct / totalQuestions * 100) : 0 };
}
