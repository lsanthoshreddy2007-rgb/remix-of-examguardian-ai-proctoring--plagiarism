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
  Users, 
  BookOpen,
  ArrowLeft,
  LogOut,
  Loader2,
  Plus,
  Copy,
  Check,
  GraduationCap,
  FileText,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
}

interface Student {
  id: number;
  name: string;
  email: string;
  role: string;
  enrolledAt: string;
}

interface Exam {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  classCode: string;
  classId: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/admin");
    } else if (!isPending && session?.user?.role !== "admin") {
      toast.error("Admin access required");
      router.push("/");
    }
  }, [session, isPending, router]);

  // Fetch classes
  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchClasses();
    }
  }, [session]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/classes?adminId=${session?.user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        toast.error("Failed to fetch classes");
      }
    } catch (error) {
      toast.error("Error loading classes");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch students for selected class
  const fetchStudents = async (classId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/classes/${classId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      toast.error("Error loading students");
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
        setExams(data);
      }
    } catch (error) {
      toast.error("Error loading exams");
    }
  };

  // Handle class selection
  const handleSelectClass = (classItem: Class) => {
    setSelectedClass(classItem);
    fetchStudents(classItem.id);
    fetchExams(classItem.id);
  };

  // Create new class
  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast.error("Class name is required");
      return;
    }

    try {
      setIsCreatingClass(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newClassName,
          description: newClassDescription || null,
        }),
      });

      if (response.ok) {
        const newClass = await response.json();
        toast.success(`Class created! Code: ${newClass.code}`);
        setNewClassName("");
        setNewClassDescription("");
        setIsCreateDialogOpen(false);
        fetchClasses();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create class");
      }
    } catch (error) {
      toast.error("Error creating class");
    } finally {
      setIsCreatingClass(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Class code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
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

  if (!session?.user || session?.user?.role !== "admin") {
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
                  ExamGuardian Admin
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
              Welcome back, <span className="font-semibold">{session.user.name || session.user.email}</span>
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
                <p className="text-sm text-muted-foreground mb-1">Total Classes</p>
                <p className="text-3xl font-bold">{classes.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold">{students.length}</p>
              </div>
              <Users className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Exams</p>
                <p className="text-3xl font-bold">{exams.length}</p>
              </div>
              <FileText className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
          </TabsList>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Classes</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                    <DialogDescription>
                      Create a new class and get a unique code for students to join.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="className">Class Name *</Label>
                      <Input
                        id="className"
                        placeholder="e.g., Computer Science 101"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="classDescription">Description</Label>
                      <Textarea
                        id="classDescription"
                        placeholder="Brief description of the class..."
                        value={newClassDescription}
                        onChange={(e) => setNewClassDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateClass} disabled={isCreatingClass}>
                      {isCreatingClass ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Class"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {classes.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Classes Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first class to start managing students and exams.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Class
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
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
                    
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Class Code</p>
                        <p className="text-xl font-bold font-mono">{classItem.code}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(classItem.code);
                        }}
                      >
                        {copiedCode === classItem.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium">
                          {new Date(classItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Students</h2>
              {selectedClass && (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {selectedClass.name}
                </Badge>
              )}
            </div>

            {!selectedClass ? (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Class Selected</h3>
                <p className="text-muted-foreground">
                  Select a class from the Classes tab to view enrolled students.
                </p>
              </Card>
            ) : students.length === 0 ? (
              <Card className="p-12 text-center">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Students Enrolled</h3>
                <p className="text-muted-foreground mb-4">
                  Share the class code <span className="font-mono font-bold">{selectedClass.code}</span> with students to join.
                </p>
                <Button variant="outline" onClick={() => copyToClipboard(selectedClass.code)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Class Code
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {students.map((student) => (
                  <Card key={student.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Enrolled</p>
                        <p className="text-sm font-medium">
                          {new Date(student.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Exams</h2>
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
                  Select a class from the Classes tab to view and manage exams.
                </p>
              </Card>
            ) : (
              <>
                {exams.length === 0 ? (
                  <Card className="p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Exams Created</h3>
                    <p className="text-muted-foreground mb-6">
                      Create exams for this class to start monitoring student performance.
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {exams.map((exam) => (
                      <Card key={exam.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2">{exam.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {exam.description || "No description"}
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                              <div>
                                <span className="text-muted-foreground">Duration: </span>
                                <span className="font-medium">{exam.durationMinutes} minutes</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Created: </span>
                                <span className="font-medium">
                                  {new Date(exam.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Link href={`/report?examId=${exam.id}`}>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Reports
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}