"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Camera, 
  AlertTriangle, 
  Clock,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  Send
} from "lucide-react";

interface Question {
  id: number;
  question: string;
  type: "mcq" | "text";
  options?: string[];
}

const examQuestions: Question[] = [
  {
    id: 1,
    question: "What is the time complexity of Binary Search algorithm?",
    type: "mcq",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"]
  },
  {
    id: 2,
    question: "Explain the difference between stack and queue data structures.",
    type: "text"
  },
  {
    id: 3,
    question: "Which sorting algorithm has the best average-case time complexity?",
    type: "mcq",
    options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"]
  },
  {
    id: 4,
    question: "Describe the concept of inheritance in Object-Oriented Programming with an example.",
    type: "text"
  }
];

export default function ExamPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [faceDetected, setFaceDetected] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Webcam setup
  useEffect(() => {
    if (webcamEnabled && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          console.log("Webcam not available");
          addAlert("Webcam access denied - exam monitoring disabled");
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamEnabled]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        addAlert("Tab switch detected - this will be reported");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Simulated AI monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random();
      
      if (random < 0.05) {
        setFaceDetected(false);
        addAlert("No face detected - please stay in frame");
        setTimeout(() => setFaceDetected(true), 3000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const addAlert = (message: string) => {
    setAlerts(prev => [message, ...prev].slice(0, 5));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    const confirmed = confirm("Are you sure you want to submit your exam? This action cannot be undone.");
    if (confirmed) {
      alert("Exam submitted successfully! Your responses have been recorded.");
      // In a real app, this would send data to backend
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const progress = ((currentQuestion + 1) / examQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ExamGuardian
                </span>
              </div>
              <Badge variant="default" className="px-3 py-1">
                CS101 Final Exam
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold">
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
              <Badge variant={faceDetected ? "default" : "destructive"}>
                {faceDetected ? "✓ Monitored" : "⚠ No Face"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Exam Questions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Exam Progress</h2>
                <span className="text-sm text-muted-foreground">
                  {answeredCount} of {examQuestions.length} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </Card>

            {/* Question Card */}
            <Card className="p-8">
              <div className="mb-6">
                <Badge variant="secondary" className="mb-4">
                  Question {currentQuestion + 1} of {examQuestions.length}
                </Badge>
                <h2 className="text-2xl font-bold mb-2">
                  {examQuestions[currentQuestion].question}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {examQuestions[currentQuestion].type === "mcq" ? "Select one answer" : "Type your answer below"}
                </p>
              </div>

              {/* Answer Input */}
              <div className="mb-8">
                {examQuestions[currentQuestion].type === "mcq" ? (
                  <RadioGroup
                    value={answers[examQuestions[currentQuestion].id] || ""}
                    onValueChange={(value) => handleAnswerChange(examQuestions[currentQuestion].id, value)}
                  >
                    <div className="space-y-3">
                      {examQuestions[currentQuestion].options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 transition-colors">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-medium">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <Textarea
                    value={answers[examQuestions[currentQuestion].id] || ""}
                    onChange={(e) => handleAnswerChange(examQuestions[currentQuestion].id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[200px] text-base"
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                
                {currentQuestion === examQuestions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Exam
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(prev => Math.min(examQuestions.length - 1, prev + 1))}
                  >
                    Next
                  </Button>
                )}
              </div>
            </Card>

            {/* Question Navigator */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Question Navigator</h3>
              <div className="grid grid-cols-8 gap-2">
                {examQuestions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`aspect-square rounded-lg font-semibold transition-all ${
                      currentQuestion === index
                        ? "bg-blue-600 text-white scale-110"
                        : answers[q.id]
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                  <span className="text-muted-foreground">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
                  <span className="text-muted-foreground">Not Answered</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Webcam & Monitoring */}
          <div className="space-y-6">
            {/* Webcam Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold">Proctoring Feed</h3>
                </div>
                <Badge variant={faceDetected ? "default" : "destructive"} className="text-xs">
                  {faceDetected ? "Active" : "Warning"}
                </Badge>
              </div>

              <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {webcamEnabled && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    REC
                  </div>
                )}
                {!faceDetected && (
                  <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-semibold">No Face Detected</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Camera Status:</span>
                <div className="flex items-center gap-2">
                  {webcamEnabled ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {webcamEnabled ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Monitoring Status */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Monitoring Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Face Detection</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Screen Recording</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Tab Switches</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                    {tabSwitches}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Alerts */}
            {alerts.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold">Recent Alerts</h3>
                </div>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded text-sm"
                    >
                      {alert}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Instructions */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Exam Rules
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Keep your face visible at all times</li>
                <li>• Do not switch tabs or windows</li>
                <li>• No mobile phones or external devices</li>
                <li>• Stay in a quiet, well-lit environment</li>
                <li>• Answer all questions before submitting</li>
              </ul>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </Button>
              <Link href="/admin">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit Exam (Admin)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
