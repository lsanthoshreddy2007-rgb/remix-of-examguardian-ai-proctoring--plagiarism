"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  BookOpen,
  ArrowLeft,
  LogOut,
  Loader2,
  Plus,
  GraduationCap,
  FileText,
  KeyRound,
  Clock,
  CalendarDays,
  Check,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Class {
  id: number;
  name: string;
  code: string;
  description: string | null;
  adminId: number;
  createdAt: string;
  updatedAt: string;
  enrolledAt?: string;
}

interface Exam {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  classCode: string;
  classId: number;
  createdAt: string;
  questions: any[];
}

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([]);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedClass, setVerifiedClass] = useState<Class | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/student");
    } else if (!isPending && session?.user?.role === "admin") {
      router.push("/admin");
    }
  }, [session, isPending, router]);

  // Fetch enrolled classes
  useEffect(() => {
    if (session?.user?.id) {
      fetchEnrolledClasses();
    }
  }, [session]);

  const fetchEnrolledClasses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("bearer_token");
      
      // Get all classes
      const response = await fetch("/api/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const allClasses = await response.json();
        
        // For each class, check if student is enrolled
        const enrollmentChecks = await Promise.all(
          allClasses.map(async (classItem: Class) => {
            const studentsResponse = await fetch(`/api/classes/${classItem.id}/students`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (studentsResponse.ok) {
              const students = await studentsResponse.json();
              const isEnrolled = students.some((s: any) => s.id === session?.user?.id);
              
              if (isEnrolled) {
                const enrolledStudent = students.find((s: any) => s.id === session?.user?.id);
                return { ...classItem, enrolledAt: enrolledStudent?.enrolledAt };
              }
            }
            return null;
          })
        );
        
        const enrolled = enrollmentChecks.filter((c): c is Class => c !== null);
        setEnrolledClasses(enrolled);
        
        // Auto-select first class if available
        if (enrolled.length > 0) {
          handleSelectClass(enrolled[0]);
        }
      }
    } catch (error) {
      toast.error("Error loading classes");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exams for selected class
  const fetchExams = async (classId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/classes/${classId}/exams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableExams(data);
      }
    } catch (error) {
      toast.error("Error loading exams");
    }
  };

  const handleSelectClass = (classItem: Class) => {
    setSelectedClass(classItem);
    fetchExams(classItem.id);
  };

  // Verify class code
  const handleVerifyCode = async () => {
    if (!classCode.trim() || classCode.trim().length !== 6) {
      toast.error("Please enter a valid 6-character class code");
      return;
    }

    setIsVerifying(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/classes/by-code/${classCode.trim()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const classData = await response.json();
        setVerifiedClass(classData);
        toast.success("Class found!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Invalid class code");
        setVerifiedClass(null);
      }
    } catch (error) {
      toast.error("Failed to verify class code");
      setVerifiedClass(null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Join class with code
  const handleJoinClass = async () => {
    if (!verifiedClass) return;

    setIsJoining(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classCode: classCode.trim(),
        }),
      });

      if (response.ok) {
        toast.success(`Successfully joined ${verifiedClass.name}!`);
        setIsJoinDialogOpen(false);
        setClassCode("");
        setVerifiedClass(null);
        fetchEnrolledClasses();
      } else {
        const error = await response.json();
        if (error.code === "ALREADY_ENROLLED") {
          toast.error("You are already enrolled in this class");
        } else {
          toast.error(error.error || "Failed to join class");
        }
      }
    } catch (error) {
      toast.error("Error joining class");
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartExam = (exam: Exam) => {
    // Store exam data and navigate to exam page
    localStorage.setItem("current_exam", JSON.stringify(exam));
    router.push(`/exam?examId=${exam.id}`);
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Signed out successfully");
      router.push("/");
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ExamGuardian
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          {session?.user && (
            <div className="mt-2 text-sm text-muted-foreground">
              Welcome, <span className="font-semibold">{session.user.name || session.user.email}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Enrolled Classes</p>
                <p className="text-3xl font-bold">{enrolledClasses.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Exams</p>
                <p className="text-3xl font-bold">{availableExams.length}</p>
              </div>
              <FileText className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Class</p>
                <p className="text-xl font-bold truncate">{selectedClass?.name || "None"}</p>
              </div>
              <GraduationCap className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="classes">My Classes</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
          </TabsList>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Classes</h2>
              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Join Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Class</DialogTitle>
                    <DialogDescription>
                      Enter the 6-character class code provided by your instructor.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="classCode">Class Code</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="classCode"
                            placeholder="e.g., CS101A"
                            className="pl-10 uppercase font-mono"
                            value={classCode}
                            onChange={(e) => {
                              setClassCode(e.target.value.toUpperCase());
                              setVerifiedClass(null);
                            }}
                            maxLength={6}
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleVerifyCode}
                          disabled={isVerifying || classCode.trim().length !== 6}
                        >
                          {isVerifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                    </div>

                    {verifiedClass && (
                      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{verifiedClass.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {verifiedClass.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsJoinDialogOpen(false);
                        setClassCode("");
                        setVerifiedClass(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleJoinClass} 
                      disabled={!verifiedClass || isJoining}
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        "Join Class"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {enrolledClasses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Classes Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Join your first class using the code provided by your instructor.
                </p>
                <Button onClick={() => setIsJoinDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Join Your First Class
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledClasses.map((classItem) => (
                  <Card
                    key={classItem.id}
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedClass?.id === classItem.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => handleSelectClass(classItem)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{classItem.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {classItem.description || "No description"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Class Code</p>
                      <p className="text-lg font-bold font-mono">{classItem.code}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-3 border-t">
                      <span className="text-muted-foreground">Enrolled</span>
                      <span className="font-medium">
                        {classItem.enrolledAt 
                          ? new Date(classItem.enrolledAt).toLocaleDateString()
                          : "Recently"
                        }
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Exams</h2>
              {selectedClass && (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {selectedClass.name}
                </Badge>
              )}
            </div>

            {!selectedClass ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Class Selected</h3>
                <p className="text-muted-foreground">
                  Select a class from the My Classes tab to view available exams.
                </p>
              </Card>
            ) : availableExams.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Exams Available</h3>
                <p className="text-muted-foreground">
                  Your instructor hasn't created any exams for this class yet.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {availableExams.map((exam) => (
                  <Card key={exam.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl">{exam.title}</h3>
                          <Badge variant="secondary" className="font-mono">
                            {exam.classCode}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {exam.description || "No description available"}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{exam.durationMinutes} minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span>{Array.isArray(exam.questions) ? exam.questions.length : 0} questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleStartExam(exam)}
                        className="ml-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Start Exam
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
