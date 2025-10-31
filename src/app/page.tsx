"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Eye, FileSearch, BarChart3, Camera, AlertTriangle, Loader2 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect based on user role
  useEffect(() => {
    if (!isPending && session?.user) {
      if (session.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/student");
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If user is logged in, show loading while redirecting
  if (session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ExamGuardian
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            AI-Powered Exam Security
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Secure Online Exams with AI Proctoring
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Advanced real-time monitoring, plagiarism detection, and comprehensive analytics to ensure exam integrity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Eye className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20 bg-white/50 backdrop-blur-sm">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to ensure exam integrity and detect academic dishonesty
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real-Time Webcam Monitoring</h3>
            <p className="text-muted-foreground">
              AI-powered face detection monitors students continuously during exams with instant alerts for suspicious behavior.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Multi-Face Detection</h3>
            <p className="text-muted-foreground">
              Detects multiple people in frame, ensuring only the registered student is taking the exam.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-pink-200">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Tab Switching Detection</h3>
            <p className="text-muted-foreground">
              Tracks when students switch tabs or windows, helping identify potential cheating attempts.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileSearch className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Plagiarism Detection</h3>
            <p className="text-muted-foreground">
              NLP-based analysis using TF-IDF and cosine similarity to detect copied or paraphrased content.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Cheating Probability Score</h3>
            <p className="text-muted-foreground">
              AI-calculated score based on multiple factors to assess the likelihood of academic dishonesty.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Comprehensive Reports</h3>
            <p className="text-muted-foreground">
              Detailed analytics, timeline of violations, and exportable PDF reports for review and records.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple setup, powerful protection in three easy steps
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              1
            </div>
            <Card className="p-6 flex-1">
              <h3 className="text-2xl font-bold mb-2">Setup Exam</h3>
              <p className="text-muted-foreground">
                Create your exam with questions and configure monitoring settings. Set up plagiarism detection thresholds.
              </p>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              2
            </div>
            <Card className="p-6 flex-1">
              <h3 className="text-2xl font-bold mb-2">Students Take Exam</h3>
              <p className="text-muted-foreground">
                Students log in with webcam enabled. AI monitors in real-time for suspicious behavior, multiple faces, and tab switches.
              </p>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              3
            </div>
            <Card className="p-6 flex-1">
              <h3 className="text-2xl font-bold mb-2">Review Reports</h3>
              <p className="text-muted-foreground">
                Access comprehensive analytics with cheating probability scores, violation timelines, and downloadable reports.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="p-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Exams?</h2>
          <p className="text-xl mb-8 opacity-90">
            Sign up now to start proctoring your exams with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white/30">
                Sign In
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2024 ExamGuardian. AI-Powered Proctoring System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}