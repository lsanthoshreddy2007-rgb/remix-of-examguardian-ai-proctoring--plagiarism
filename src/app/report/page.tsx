"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlagiarismChecker from "@/components/PlagiarismChecker";
import { 
  Shield, 
  Download, 
  ArrowLeft,
  AlertTriangle,
  Eye,
  Users,
  Clock,
  TrendingUp,
  FileText,
  Camera,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle
} from "lucide-react";

interface ViolationEvent {
  id: string;
  type: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  description: string;
}

const violationTimeline: ViolationEvent[] = [
  {
    id: "1",
    type: "Tab Switch",
    timestamp: "10:15:23 AM",
    severity: "medium",
    description: "Student switched to another browser tab"
  },
  {
    id: "2",
    type: "No Face Detected",
    timestamp: "10:22:45 AM",
    severity: "high",
    description: "Face was not visible in camera for 12 seconds"
  },
  {
    id: "3",
    type: "Tab Switch",
    timestamp: "10:35:12 AM",
    severity: "medium",
    description: "Student switched to another browser tab"
  },
  {
    id: "4",
    type: "Multiple Faces",
    timestamp: "10:48:30 AM",
    severity: "high",
    description: "Multiple people detected in camera frame"
  },
  {
    id: "5",
    type: "Tab Switch",
    timestamp: "11:02:18 AM",
    severity: "medium",
    description: "Student switched to another browser tab"
  },
  {
    id: "6",
    type: "Phone Detected",
    timestamp: "11:15:55 AM",
    severity: "high",
    description: "Mobile device detected in frame"
  }
];

export default function ReportPage() {
  const [selectedStudent, setSelectedStudent] = useState("Michael Brown");
  
  const cheatingScore = 67;
  const examDuration = "120 minutes";
  const completionTime = "118 minutes";
  const totalViolations = violationTimeline.length;

  const downloadPDFReport = () => {
    const reportData = {
      student: selectedStudent,
      examName: "CS101 Final Exam",
      date: new Date().toISOString(),
      cheatingScore,
      examDuration,
      completionTime,
      violations: violationTimeline,
      summary: {
        faceDetection: "95%",
        tabSwitches: 3,
        suspiciousActivity: "34%",
        attentionLevel: "78%"
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-report-${selectedStudent.replace(" ", "-")}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-orange-600";
    return "text-green-600";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-700 border-red-300";
      case "medium": return "bg-orange-100 text-orange-700 border-orange-300";
      case "low": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ExamGuardian
                </span>
              </div>
            </div>
            <Button onClick={downloadPDFReport} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Exam Analytics & Report</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive analysis and violation summary for CS101 Final Exam
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="plagiarism">Plagiarism Check</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Student Info Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedStudent}</h2>
                  <p className="text-muted-foreground">Student ID: STU003</p>
                </div>
                <Badge
                  variant={cheatingScore >= 70 ? "destructive" : "secondary"}
                  className="text-lg px-4 py-2"
                >
                  Risk Score: {cheatingScore}%
                </Badge>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Exam</span>
                  </div>
                  <p className="font-bold">CS101 Final</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">Duration</span>
                  </div>
                  <p className="font-bold">{examDuration}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <p className="font-bold">{completionTime}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-muted-foreground">Violations</span>
                  </div>
                  <p className="font-bold">{totalViolations}</p>
                </div>
              </div>
            </Card>

            {/* Cheating Score Analysis */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Cheating Probability Analysis
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-lg">Overall Risk Score</span>
                    <span className={`text-3xl font-bold ${getScoreColor(cheatingScore)}`}>
                      {cheatingScore}%
                    </span>
                  </div>
                  <Progress value={cheatingScore} className="h-4" />
                  <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm">
                      <strong>Assessment:</strong> Moderate to high risk detected. Multiple violations including tab 
                      switching, brief periods of no face detection, and suspicious activity. Manual review recommended.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Face Detection Rate</span>
                      <span className="font-bold text-green-600">95%</span>
                    </div>
                    <Progress value={95} className="h-2.5" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Suspicious Activity</span>
                      <span className="font-bold text-orange-600">34%</span>
                    </div>
                    <Progress value={34} className="h-2.5" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Attention Level</span>
                      <span className="font-bold text-blue-600">78%</span>
                    </div>
                    <Progress value={78} className="h-2.5" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Tab Switching Risk</span>
                      <span className="font-bold text-red-600">67%</span>
                    </div>
                    <Progress value={67} className="h-2.5" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Monitoring Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-blue-600" />
                  Video Monitoring
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Face Detected</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      95% of time
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Multiple Faces</span>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      1 incident
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium">No Face Detected</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      1 incident
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Phone Detected</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      1 incident
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-purple-600" />
                  Behavioral Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Tab Switches</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      3 times
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Stayed in Fullscreen</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Yes
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Avg. Question Time</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      8.5 minutes
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Questions Answered</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      14/14
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Recommendations
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
                  <span>
                    <strong>Manual Review Required:</strong> Multiple high-severity violations detected. 
                    Review recorded video footage for suspicious activity.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Eye className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>
                    <strong>Tab Switching:</strong> Student switched tabs 3 times. Investigate if external 
                    resources were accessed during these periods.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Camera className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
                  <span>
                    <strong>Face Detection Issues:</strong> Brief period where no face was detected. 
                    Check if student temporarily left their seat.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>
                    <strong>Answer Analysis:</strong> Run plagiarism check on written responses to verify originality.
                  </span>
                </li>
              </ul>
            </Card>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                  Violation Timeline
                </h3>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {totalViolations} Total Violations
                </Badge>
              </div>

              <div className="space-y-3">
                {violationTimeline.map((violation, index) => (
                  <div
                    key={violation.id}
                    className="flex items-start gap-4 p-4 border-l-4 rounded-lg hover:shadow-md transition-shadow"
                    style={{
                      borderColor: violation.severity === "high" ? "#dc2626" : 
                                   violation.severity === "medium" ? "#ea580c" : "#ca8a04"
                    }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg">{violation.type}</h4>
                        <Badge className={getSeverityColor(violation.severity)}>
                          {violation.severity}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{violation.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {violation.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {violationTimeline.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-bold mb-2">No Violations Detected</h3>
                  <p className="text-muted-foreground">
                    The student completed the exam without any violations.
                  </p>
                </div>
              )}
            </Card>

            {/* Violation Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">High Severity</span>
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {violationTimeline.filter(v => v.severity === "high").length}
                </p>
              </Card>

              <Card className="p-6 bg-orange-50 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Medium Severity</span>
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-600">
                  {violationTimeline.filter(v => v.severity === "medium").length}
                </p>
              </Card>

              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Low Severity</span>
                  <CheckCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">
                  {violationTimeline.filter(v => v.severity === "low").length}
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* Plagiarism Check Tab */}
          <TabsContent value="plagiarism">
            <PlagiarismChecker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
