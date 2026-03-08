import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  FlaskConical,
  Loader2,
  LogIn,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useSaveUserProfile,
  useUserProfile,
  useUserRole,
} from "../hooks/useQueries";

interface LoginPageProps {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: userRole } = useUserRole();
  const saveProfile = useSaveUserProfile();

  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"pharmacist" | "admin">(
    "pharmacist",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // If identity exists and role is guest, move to profile step
  const showProfileStep =
    identity &&
    (userRole === UserRole.guest || !userProfile) &&
    !profileLoading;

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Please enter a username");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        role: selectedRole === "admin" ? UserRole.admin : UserRole.user,
      });
      toast.success("Profile saved! Welcome to PharmaCare.");
      onSuccess();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "oklch(0.32 0.07 168)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-8"
          style={{ background: "oklch(0.72 0.14 168)" }}
        />
        <div
          className="absolute top-1/3 left-10 w-2 h-32 rounded-full opacity-20"
          style={{ background: "oklch(0.88 0.08 85)" }}
        />
        <div
          className="absolute bottom-1/3 right-16 w-2 h-24 rounded-full opacity-20"
          style={{ background: "oklch(0.88 0.08 85)" }}
        />
      </div>

      <div className="w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Logo & Brand */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden"
              style={{ background: "oklch(0.32 0.07 168)" }}
            >
              <img
                src="/assets/generated/pharmacare-logo-transparent.dim_80x80.png"
                alt="PharmaCare"
                className="w-12 h-12 object-contain"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-display font-bold text-foreground"
            >
              PharmaCare
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm mt-1"
            >
              Pharmacy Management System
            </motion.p>
          </div>

          {!identity && !showProfileStep ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-display">
                    Welcome Back
                  </CardTitle>
                  <CardDescription>
                    Sign in to access the pharmacy management system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Username field */}
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && login()}
                      autoComplete="username"
                      data-ocid="login.username.input"
                    />
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && login()}
                        autoComplete="current-password"
                        className="pr-10"
                        data-ocid="login.password.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        data-ocid="login.password_toggle.button"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Login button */}
                  <Button
                    onClick={login}
                    disabled={isLoggingIn || isInitializing}
                    className="w-full h-11 font-medium"
                    data-ocid="login.primary_button"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </>
                    )}
                  </Button>

                  {/* Secure badge */}
                  <div className="bg-secondary rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                      <ShieldCheck className="w-4 h-4" />
                      Secure &amp; Decentralized
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your data is stored on the Internet Computer blockchain.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">
                      Features
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: FlaskConical, label: "Inventory" },
                      { icon: User, label: "Sales" },
                      { icon: ShieldCheck, label: "Reports" },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted"
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : showProfileStep ? (
            <motion.div
              key="profile-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-display">
                      Set Up Your Profile
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      New User
                    </Badge>
                  </div>
                  <CardDescription>
                    Tell us about yourself to personalize your experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Username</Label>
                    <Input
                      id="name"
                      placeholder="Choose a username"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSaveProfile()
                      }
                      data-ocid="login.name.input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Your Role</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          value: "pharmacist" as const,
                          label: "Pharmacist",
                          desc: "Manage inventory, process sales",
                          icon: FlaskConical,
                        },
                        {
                          value: "admin" as const,
                          label: "Administrator",
                          desc: "Full system access & reports",
                          icon: ShieldCheck,
                        },
                      ].map(({ value, label, desc, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelectedRole(value)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            selectedRole === value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground"
                          }`}
                          data-ocid={`login.${value}.toggle`}
                        >
                          <Icon
                            className={`w-5 h-5 mb-1 ${selectedRole === value ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <div className="font-medium text-sm">{label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={saveProfile.isPending || !name.trim()}
                    className="w-full h-11 font-medium"
                    data-ocid="login.submit_button"
                  >
                    {saveProfile.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Complete Setup & Enter PharmaCare"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
