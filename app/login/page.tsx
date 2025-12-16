import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen epic-gradient relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.65 0.25 285) 0%, transparent 70%)",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.68 0.22 320) 0%, transparent 70%)",
            animationDuration: "5s",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.70 0.25 260) 0%, transparent 70%)",
            animationDuration: "6s",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Particle Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "radial-gradient(circle, oklch(0.98 0.01 285) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}
