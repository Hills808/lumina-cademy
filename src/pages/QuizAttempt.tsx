import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  question_order: number;
  points: number;
  quiz_options: {
    id: string;
    option_text: string;
    option_order: number;
    is_correct: boolean;
  }[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  passing_score: number;
}

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("id, title, description, passing_score")
        .eq("id", quizId)
        .single();

      if (quizError) throw quizError;

      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select(`
          id,
          question,
          question_order,
          points,
          quiz_options (
            id,
            option_text,
            option_order,
            is_correct
          )
        `)
        .eq("quiz_id", quizId)
        .order("question_order");

      if (questionsError) throw questionsError;

      setQuiz(quizData);
      setQuestions(questionsData as QuizQuestion[]);
    } catch (error) {
      console.error("Erro ao carregar quiz:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o quiz",
        variant: "destructive",
      });
      navigate("/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as questões antes de enviar",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Calcular pontuação
      let correctAnswers = 0;
      questions.forEach((question) => {
        const selectedOptionId = answers[question.id];
        const correctOption = question.quiz_options.find(opt => opt.is_correct);
        if (selectedOptionId === correctOption?.id) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / questions.length) * 100);
      const passed = score >= (quiz?.passing_score || 60);

      // Salvar tentativa
      const { error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId,
          student_id: user.id,
          score,
          total_points: questions.reduce((sum, q) => sum + (q.points || 0), 0),
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            question_id: questionId,
            option_id: optionId
          })),
          completed_at: new Date().toISOString()
        });

      if (attemptError) throw attemptError;

      setResult({ score, passed });

      toast({
        title: passed ? "Parabéns! 🎉" : "Quiz Completado",
        description: `Você acertou ${correctAnswers} de ${questions.length} questões (${score}%)`,
      });
    } catch (error) {
      console.error("Erro ao enviar quiz:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar suas respostas",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-96 w-full max-w-3xl" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Quiz não encontrado</p>
            <Button className="w-full mt-4" onClick={() => navigate("/quizzes")}>
              Voltar para Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            {result.passed ? (
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <CardTitle className="text-2xl">
              {result.passed ? "Aprovado!" : "Não Aprovado"}
            </CardTitle>
            <CardDescription>
              Sua pontuação: {result.score}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-6">
              {result.passed 
                ? `Parabéns! Você atingiu a nota mínima de ${quiz.passing_score}%`
                : `Você precisava de ${quiz.passing_score}% para ser aprovado`}
            </p>
            <Button className="w-full" onClick={() => navigate("/quizzes")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/quizzes")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Questão {currentQuestion.question_order}</CardTitle>
            <CardDescription>{currentQuestion.question}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.quiz_options
                .sort((a, b) => a.option_order - b.option_order)
                .map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Anterior
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length !== questions.length}
            >
              {submitting ? "Enviando..." : "Enviar Quiz"}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Próxima
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
