import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Brain,
  FileText,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Shield,
  Send,
  Clock,
  Mountain,
  Calendar,
  Trophy,
  Flame,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import jobSherpaLogo from "@assets/icon_transparent_1765527804321.png";
import jobScoutScreenshot from "@assets/Job_Scout_1765527804322.jpg";
import resumeTemplatesScreenshot from "@assets/Resume_Templates_1765527804323.jpg";
import trackingScreenshot from "@assets/Tracking_1765527804323.jpg";
import trackingDetailsScreenshot from "@assets/Tracking_-_Details_1765528423312.jpg";
import knowledgeEngineScreenshot from "@assets/knowledge_engine_1765528629729.jpg";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Landing() {
  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToJourney = () => {
    document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" });
  };

  const testimonials = [
    {
      quote: "The tailoring finally made my experience read like the job description — response rate jumped immediately.",
      author: "Marcus T.",
      role: "VP Revenue Operations",
      rating: 5,
    },
    {
      quote: "The tracker is the first time I've felt in control of my pipeline.",
      author: "Priya S.",
      role: "Product Manager",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <img src={jobSherpaLogo} alt="JobSherpa" className="h-9 w-9 rounded-md object-contain" />
            <span className="text-xl font-bold tracking-tight">JobSherpa</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-product">
              Product
            </a>
            <a href="#journey" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-how-it-works">
              How It Works
            </a>
            <a href="#outcomes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-outcomes">
              Outcomes
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-faq">
              FAQ
            </a>
            <Link href="/dashboard">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-nav-login">
                Log In
              </span>
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={scrollToWaitlist} data-testid="button-get-started-nav">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
          {/* Background with city silhouettes */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5" />
            <div className="absolute bottom-0 left-0 h-32 w-48 opacity-[0.07]">
              <svg viewBox="0 0 200 100" className="h-full w-full fill-foreground">
                <rect x="10" y="40" width="15" height="60" />
                <rect x="30" y="20" width="12" height="80" />
                <rect x="47" y="50" width="18" height="50" />
                <rect x="70" y="10" width="10" height="90" />
                <rect x="85" y="35" width="14" height="65" />
                <polygon points="95,35 102,0 109,35" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 h-32 w-48 opacity-[0.07]">
              <svg viewBox="0 0 200 100" className="h-full w-full fill-foreground">
                <rect x="20" y="50" width="20" height="50" />
                <rect x="50" y="40" width="15" height="60" />
                <rect x="75" y="55" width="25" height="45" />
                <rect x="110" y="30" width="12" height="70" />
                <circle cx="150" cy="60" r="30" />
                <rect x="145" y="60" width="10" height="40" />
              </svg>
            </div>
          </div>
          
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left side - Content */}
              <div className="text-center lg:text-left">
                <span className="text-sm font-medium text-primary mb-4 block">
                  AI-powered career companion
                </span>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Stop Sending Resumes Into the Void.
                </h1>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  JobSherpa learns your experience, scouts high-fit roles, and guides every application — so you stop guessing and start getting interviews.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <Button size="lg" className="gap-2" onClick={scrollToWaitlist} data-testid="button-get-started-hero">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button 
                    onClick={scrollToJourney}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    data-testid="button-see-how-works"
                  >
                    See how it works <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  No credit card required.
                </p>
              </div>

              {/* Right side - Product Mockup */}
              <div className="relative" data-testid="hero-product-mockup">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Main Dashboard Screenshot */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="overflow-hidden rounded-lg border border-border shadow-2xl cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-3xl" data-testid="card-dashboard-preview">
                        <img 
                          src={trackingDetailsScreenshot} 
                          alt="JobSherpa Tracking Details - Application timeline and status" 
                          className="w-full h-auto"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden">
                      <VisuallyHidden>
                        <DialogTitle>Tracking Details Screenshot</DialogTitle>
                      </VisuallyHidden>
                      <img 
                        src={trackingDetailsScreenshot} 
                        alt="JobSherpa Tracking Details - Application timeline and status" 
                        className="w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Floating Sherpa Dog */}
                  <div className="absolute -bottom-4 -left-4 sm:-left-8">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background border-4 border-background shadow-lg overflow-hidden">
                      <img src={jobSherpaLogo} alt="JobSherpa" className="h-20 w-20 object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Pillars */}
        <section id="features" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                A Full Job Search System — Not Another Resume Tool
              </h2>
            </div>
            <div className="space-y-24">
              {/* Knowledge Engine */}
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16" data-testid="section-feature-knowledge">
                <div>
                  {/* SectionHeader: icon left of headline, baseline aligned */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Your career brain, structured</h3>
                  </div>
                  <ul className="space-y-3 ml-[52px]">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Turns your experience into reusable "career blocks"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Stores metrics, outcomes, projects, and stories</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Powers matching, tailoring, and outreach</span>
                    </li>
                  </ul>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="overflow-hidden rounded-lg border border-border shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                      <img 
                        src={knowledgeEngineScreenshot} 
                        alt="Knowledge Engine - Your career brain in one place" 
                        className="w-full h-auto"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <VisuallyHidden>
                      <DialogTitle>Knowledge Engine Screenshot</DialogTitle>
                    </VisuallyHidden>
                    <img 
                      src={knowledgeEngineScreenshot} 
                      alt="Knowledge Engine - Your career brain in one place" 
                      className="w-full h-auto"
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Resume Builder */}
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16" data-testid="section-feature-resume">
                <div className="lg:order-2">
                  {/* SectionHeader: icon left of headline, baseline aligned */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
                      <FileText className="h-5 w-5 text-chart-3" />
                    </div>
                    <h3 className="text-2xl font-bold">Tailored in seconds</h3>
                  </div>
                  <ul className="space-y-3 ml-[52px]">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Matches role language without keyword stuffing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Produces ATS-ready formatting</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Keeps your strongest proof points upfront</span>
                    </li>
                  </ul>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="overflow-hidden rounded-lg border border-border shadow-lg lg:order-1 cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                      <img 
                        src={resumeTemplatesScreenshot} 
                        alt="Resume Templates - Choose from professional templates" 
                        className="w-full h-auto"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <VisuallyHidden>
                      <DialogTitle>Resume Templates Screenshot</DialogTitle>
                    </VisuallyHidden>
                    <img 
                      src={resumeTemplatesScreenshot} 
                      alt="Resume Templates - Choose from professional templates" 
                      className="w-full h-auto"
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Job Scout */}
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16" data-testid="section-feature-scout">
                <div>
                  {/* SectionHeader: icon left of headline, baseline aligned */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
                      <Target className="h-5 w-5 text-chart-4" />
                    </div>
                    <h3 className="text-2xl font-bold">High-signal matches</h3>
                  </div>
                  <ul className="space-y-3 ml-[52px]">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Surfaces roles aligned to your trajectory</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Explains fit + gaps clearly</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Works across markets (NYC & London shown as examples)</span>
                    </li>
                  </ul>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="overflow-hidden rounded-lg border border-border shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                      <img 
                        src={jobScoutScreenshot} 
                        alt="Job Scout - AI-powered job matches" 
                        className="w-full h-auto"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <VisuallyHidden>
                      <DialogTitle>Job Scout Screenshot</DialogTitle>
                    </VisuallyHidden>
                    <img 
                      src={jobScoutScreenshot} 
                      alt="Job Scout - AI-powered job matches" 
                      className="w-full h-auto"
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Apply Agent + Tracker */}
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16" data-testid="section-feature-apply">
                <div className="lg:order-2">
                  {/* SectionHeader: icon left of headline, baseline aligned */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Apply + track without chaos</h3>
                  </div>
                  <ul className="space-y-3 ml-[52px]">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Captures confirmations and status signals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Tracks next steps and follow-ups</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-3 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Keeps your pipeline moving toward interviews</span>
                    </li>
                  </ul>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="overflow-hidden rounded-lg border border-border shadow-lg lg:order-1 cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                      <img 
                        src={trackingScreenshot} 
                        alt="Apply Agent + Tracker" 
                        className="w-full h-auto"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <VisuallyHidden>
                      <DialogTitle>Apply Agent and Tracker Screenshot</DialogTitle>
                    </VisuallyHidden>
                    <img 
                      src={trackingScreenshot} 
                      alt="Apply Agent + Tracker" 
                      className="w-full h-auto"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>

        {/* Sherpa Journey Section */}
        <section id="journey" className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            {/* Section header with Sherpa icon left of title */}
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background shadow-md overflow-hidden">
                <img src={jobSherpaLogo} alt="JobSherpa" className="h-8 w-8 object-contain" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your Sherpa Keeps You Moving
              </h2>
            </div>

            {/* Premium Trail with Hover Tooltips */}
            <div className="flex items-center justify-center mb-12" data-testid="trail-journey">
              {/* Basecamp */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex flex-col items-center group cursor-pointer" data-testid="trail-basecamp">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all group-hover:shadow-lg group-hover:scale-105">
                      <Mountain className="h-5 w-5" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-foreground">Basecamp</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[280px] p-3">
                  <p className="text-sm">Upload your resume or connect LinkedIn. JobSherpa builds your Knowledge Engine.</p>
                </TooltipContent>
              </Tooltip>

              {/* Connector 1 */}
              <div className="h-1.5 w-16 sm:w-24 rounded-full bg-gradient-to-r from-primary to-chart-4 mx-2" />

              {/* Midpoint */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex flex-col items-center group cursor-pointer" data-testid="trail-midpoint">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-4 text-white shadow-md transition-all group-hover:shadow-lg group-hover:scale-105">
                      <Flame className="h-5 w-5" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-foreground">Midpoint</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[280px] p-3">
                  <p className="text-sm mb-2">Find high-fit roles and see why they match — strengths, gaps, and priorities.</p>
                  <p className="text-sm">Tailor resumes in seconds and generate application-ready materials with one click.</p>
                </TooltipContent>
              </Tooltip>

              {/* Connector 2 */}
              <div className="h-1.5 w-16 sm:w-24 rounded-full bg-gradient-to-r from-chart-4 to-chart-3 mx-2" />

              {/* Summit */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex flex-col items-center group cursor-pointer" data-testid="trail-summit">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3 text-white shadow-md transition-all group-hover:shadow-lg group-hover:scale-105">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-foreground">Summit</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[280px] p-3">
                  <p className="text-sm">Every outcome improves your model and clarifies your next best move.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Compact Perks Row */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2" data-testid="perk-daily">
                <Calendar className="h-4 w-4 text-chart-4" />
                <span>Daily role recommendations</span>
              </div>
              <div className="flex items-center gap-2" data-testid="perk-energy">
                <Clock className="h-4 w-4 text-chart-3" />
                <span>Time saved tracker</span>
              </div>
              <div className="flex items-center gap-2" data-testid="perk-summit">
                <Trophy className="h-4 w-4 text-primary" />
                <span>Milestone celebrations</span>
              </div>
            </div>
          </div>
        </section>

        {/* Outcomes Section */}
        <section id="outcomes" className="border-y border-border bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Built for outcomes that matter
              </h2>
            </div>

            {/* Outcome Tiles */}
            <div className="grid gap-6 sm:grid-cols-3 mb-12">
              <Card data-testid="card-outcome-clarity">
                <CardContent className="p-5">
                  {/* Card header: icon left of title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold">Clarity</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-11">
                    Know what to apply to and why.
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-outcome-speed">
                <CardContent className="p-5">
                  {/* Card header: icon left of title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
                      <Zap className="h-4 w-4 text-chart-3" />
                    </div>
                    <h3 className="font-semibold">Speed</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-11">
                    Tailor and submit faster.
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-outcome-momentum">
                <CardContent className="p-5">
                  {/* Card header: icon left of title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
                      <TrendingUp className="h-4 w-4 text-chart-4" />
                    </div>
                    <h3 className="font-semibold">Momentum</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-11">
                    Always know the next step.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Testimonials */}
            <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} data-testid={`card-testimonial-${index}`}>
                  <CardContent className="p-5">
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-chart-4 text-chart-4" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="waitlist" className="py-16 sm:py-20 bg-primary/5">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-4">
                Climb smarter. Land faster.
              </h2>
              <p className="text-muted-foreground mb-8">
                JobSherpa turns your search into a guided system — from first match to final offer.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2" data-testid="button-get-started-final">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <button 
                  onClick={scrollToJourney}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  data-testid="button-see-how-works-final"
                >
                  See how it works <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                No credit card required.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <img src={jobSherpaLogo} alt="JobSherpa" className="h-8 w-8 rounded-md object-contain" />
              <span className="text-sm text-muted-foreground">
                jobsherpa.ai
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-product">
                Product
              </a>
              <a href="#journey" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-how-it-works">
                How It Works
              </a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-faq">
                FAQ
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
