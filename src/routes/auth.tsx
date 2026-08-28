import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Building2, Fuel, Gauge, Lock, Mail, Radio, Scale, ShieldCheck, Truck, User } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ANUSHRAWAN — Fleet Portal Login & Sign Up" },
      {
        name: "description",
        content:
          "Access your Anushrawan dashboard to monitor truck load sensors, live routes, and cargo theft alerts across Bharat's logistics fleet.",
      },
      { property: "og:title", content: "ANUSHRAWAN — Fleet Security Portal" },
      {
        property: "og:description",
        content: "Secure access to real-time cargo theft detection for Indian logistics fleets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const signupSchema = loginSchema
  .extend({
    name: z.string().trim().min(2, "Name is required").max(100),
    company: z.string().trim().min(2, "Company is required").max(120),
    confirm: z.string().max(128),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const result = mode === "login" ? loginSchema.safeParse(data) : signupSchema.safeParse(data);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    navigate({ to: "/dashboard" });
  }

  const field = (name: string) =>
    errors[name] ? <p className="mt-1 text-xs text-destructive">{errors[name]}</p> : null;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Branding panel */}
      <section className="relative hidden overflow-hidden bg-midnight p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, var(--cyan) 0 2px, transparent 2px), radial-gradient(circle at 70% 60%, var(--transport) 0 3px, transparent 3px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute -right-24 top-1/3 size-96 rounded-full bg-primary/25 blur-3xl" />

        <Link to="/" className="relative">
          <Logo />
        </Link>

        <div className="relative max-w-md">
          <span className="chakra-motif mb-6 block size-24 opacity-50" />
          <div className="inline-flex items-center gap-2 rounded-full border border-saffron/40 bg-saffron/10 px-3 py-0.5 text-xs font-semibold text-saffron mb-4">
            <span>Bharat Fleet Protection Grid</span>
          </div>

          <h2 className="font-display text-3xl font-bold leading-tight text-foreground lg:text-4xl">
            Every quintal <span className="text-accent text-glow">accounted for</span> on
            Bharat&apos;s highways.
          </h2>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Real-time chassis load cells, TPMS tire pressure telemetry, GSM communications, and
            remote fuel pipe solenoid valve immobilization engineered for Indian fleet operators.
          </p>

          <ul className="mt-8 space-y-3.5 text-sm">
            {[
              {
                icon: Scale,
                text: "Multi-point chassis load cells for real-time weight measuring",
              },
              {
                icon: Gauge,
                text: "Axle TPMS sensors for continuous tire pressure & temperature monitoring",
              },
              {
                icon: Radio,
                text: "Industrial GSM module for real-time cellular data uplink and commands",
              },
              {
                icon: Fuel,
                text: "Remote fuel line solenoid valve cut-off to immobilize corrupt drivers",
              },
            ].map((i) => (
              <li key={i.text} className="flex items-center gap-3">
                <span className="rounded-lg bg-accent/15 p-1 text-accent">
                  <i.icon className="size-4" />
                </span>
                <span className="text-foreground/90 text-xs font-medium">{i.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="tricolor-line h-1 w-36 rounded-full" />
          <p className="mt-2 text-[11px] text-muted-foreground">
            National Fleet Protection Grid · 4-Point Hardware Telemetry
          </p>
        </div>
      </section>

      {/* Form panel */}
      <section className="surface-light flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-panel">
          <div className="lg:hidden">
            <Logo className="mb-6" />
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setErrors({});
                }}
                className={`rounded-lg py-2 font-medium capitalize transition-colors ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Login" : "Sign up"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-2xl font-bold">
            {mode === "login" ? "Welcome back" : "Register Fleet Console"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "login"
              ? "Sign in to monitor your Indian highway fleet in real time."
              : "Set up load-sensor surveillance for your commercial carriers."}
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative mt-1.5">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      className="pl-9"
                      placeholder="Anushka Roy"
                      maxLength={100}
                    />
                  </div>
                  {field("name")}
                </div>

                <div>
                  <Label htmlFor="company">Logistics Enterprise</Label>
                  <div className="relative mt-1.5">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="company"
                      name="company"
                      className="pl-9"
                      placeholder="Bharat Roadlines Pvt Ltd"
                      maxLength={120}
                    />
                  </div>
                  {field("company")}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Fleet Email</Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="pl-9"
                  placeholder="ops@fleet.in"
                  maxLength={255}
                />
              </div>
              {field("email")}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="pl-9"
                  placeholder="••••••••"
                  maxLength={128}
                />
              </div>
              {field("password")}
            </div>

            {mode === "signup" && (
              <div>
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    className="pl-9"
                    placeholder="••••••••"
                    maxLength={128}
                  />
                </div>
                {field("confirm")}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
            >
              {mode === "login" ? "Login to dashboard" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Demo build — Any credentials open the simulated fleet dashboard.
          </p>
        </div>
      </section>
    </main>
  );
}
