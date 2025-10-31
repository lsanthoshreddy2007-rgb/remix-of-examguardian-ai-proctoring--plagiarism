"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, KeyRound, Clock, FileText, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function JoinExamPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [classCode, setClassCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [examPreview, setExamPreview] = useState<any>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/join-exam");
    }
  }, [session, isPending, router]);

  const handleCheckCode = async () => {
    if (!classCode.trim()) {
      toast.error("Please enter a class code");
      return;
    }

    setIsCheckingCode(true);
    try {
      const response = await fetch(`/api/exams/by-code/${classCode.trim()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExamPreview(data);
        toast.success("Exam found!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Invalid class code");
        setExamPreview(null);
      }
    } catch (error) {
      toast.error("Failed to verify class code");
      setExamPreview(null);
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleJoinExam = async () => {
    if (!session?.user?.id || !examPreview) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/exams/join-with-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          classCode: classCode.trim(),
          studentId: session.user.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Successfully joined the exam!");
        // Store session ID in localStorage for the exam page
        localStorage.setItem("current_exam_session", JSON.stringify(data.session));
        router.push(`/exam?session=${data.session.id}`);
      } else {
        const error = await response.json();
        if (error.code === "SESSION_ALREADY_EXISTS") {
          toast.error("You have already joined this exam");
        } else {
          toast.error(error.error || "Failed to join exam");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ExamGuardian
            </span>
          </div>
          <h1 className="text-2xl font-bold text-center">Join Exam</h1>
          <p className="text-muted-foreground text-center mt-2">
            Enter the class code provided by your instructor
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="classCode">Class Code</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="classCode"
                  type="text"
                  placeholder="e.g., EXAM001"
                  className="pl-10 uppercase"
                  value={classCode}
                  onChange={(e) => {
                    setClassCode(e.target.value.toUpperCase());
                    setExamPreview(null);
                  }}
                  disabled={isCheckingCode || isLoading}
                />
              </div>
              <Button
                onClick={handleCheckCode}
                disabled={!classCode.trim() || isCheckingCode || isLoading}
                variant="outline"
              >
                {isCheckingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </div>

          {examPreview && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{examPreview.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {examPreview.description}
                    </p>
                  </div>
                  <Badge className="bg-blue-600">
                    {examPreview.classCode}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold">{examPreview.durationMinutes} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Questions</p>
                      <p className="font-semibold">
                        {Array.isArray(examPreview.questions) ? examPreview.questions.length : 0} questions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Exam Rules
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Keep your face visible at all times</li>
                    <li>• Do not switch tabs or windows</li>
                    <li>• No mobile phones or external devices</li>
                    <li>• Answer all questions before submitting</li>
                  </ul>
                </div>

                <Button
                  onClick={handleJoinExam}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Start Exam"
                  )}
                </Button>
              </div>
            </Card>
          )}

          {!examPreview && (
            <div className="text-center py-8 text-muted-foreground">
              <KeyRound className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Enter a class code to see exam details</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
