"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { isValidSubdomain, isReservedName } from "@/lib/utils";
import { validateNameservers } from "@/lib/validate-nameservers";

const STEPS = ["Name", "Setup", "Verify", "Rules", "Done"];

export default function NewSubdomainPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState("");
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [dnsMode, setDnsMode] = useState<"STANDARD" | "DELEGATED">("STANDARD");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("CNAME");
  const [proxied, setProxied] = useState(false);
  const [nameservers, setNameservers] = useState<string[]>([""]);

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("Personal");

  const [agreedRules, setAgreedRules] = useState(false);
  const [agreedEnforcement, setAgreedEnforcement] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/domains")
      .then((r) => r.json())
      .then((data) => {
        if (data.domains?.length) {
          setAvailableDomains(data.domains);
          setDomain(data.defaultDomain ?? data.domains[0]);
        }
      })
      .catch(() => {});
  }, []);

  function checkAvailability() {
    if (!name) { setError("Enter a subdomain name first"); return; }
    if (!isValidSubdomain(name)) { setError("Invalid subdomain name. Use only lowercase letters, numbers, and hyphens."); setNameAvailable(false); return; }
    if (isReservedName(name)) { setError("This subdomain name is reserved."); setNameAvailable(false); return; }
    setNameAvailable(true);
    setError("");
  }

  function validateStep1() {
    if (!name) { setError("Subdomain name is required"); return false; }
    if (!isValidSubdomain(name)) { setError("Invalid subdomain name. Use only lowercase letters, numbers, and hyphens (cannot start or end with a hyphen)."); return false; }
    if (isReservedName(name)) { setError("This subdomain name is reserved."); return false; }
    setError("");
    return true;
  }

  function validateStep2() {
    if (dnsMode === "STANDARD" && !target) { setError("Target is required for standard DNS mode"); return false; }
    if (dnsMode === "DELEGATED") {
      const result = validateNameservers(nameservers);
      if (!result.ok) { setError(result.error); return false; }
      setNameservers(result.nameservers);
    }
    setError("");
    return true;
  }

  function validateStep3() {
    if (!fullName.trim()) { setError("Full name is required"); return false; }
    if (!dateOfBirth.trim()) { setError("Date of birth is required"); return false; }
    if (!address.trim()) { setError("Address is required"); return false; }
    if (!phone.trim()) { setError("Mobile number is required"); return false; }
    if (!purpose.trim()) { setError("Purpose is required"); return false; }
    setError("");
    return true;
  }

  function goNext() {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    if (step === 2 && !validateStep3()) return;
    setError("");
    setStep((s) => Math.min(s + 1, 4));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!agreedRules || !agreedEnforcement) {
      setError("You must agree to both rules before launching");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const kycRes = await fetch("/api/user/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, dateOfBirth, address, phone, purpose }),
      });
      if (!kycRes.ok) {
        const kycErr = await kycRes.json().catch(() => ({}));
        setError(kycErr.error || "Identity verification failed");
        setLoading(false);
        return;
      }
      for (const agreementType of ["aup", "terms_of_service"]) {
        await fetch("/api/user/agreements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agreementType }),
        }).catch(() => {});
      }
      const res = await fetch("/api/subdomains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          target,
          type,
          proxied,
          domain,
          dnsMode,
          nameservers: dnsMode === "DELEGATED" ? nameservers.filter((ns) => ns.trim()) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to create subdomain (${res.status})`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCreatedId(data.subdomain?.id || null);
      router.refresh();
      setStep(4);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/subdomains">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Subdomain</h1>
          <p className="text-sm text-muted-foreground">Claim a free subdomain</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-0">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "border-2 border-primary text-primary" :
                "border border-border text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/50" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Name</CardTitle>
            <CardDescription>Pick a subdomain name for your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subdomain</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="your-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    setNameAvailable(null);
                  }}
                  required
                  maxLength={63}
                  className="font-mono"
                />
                <span className="shrink-0 text-sm text-muted-foreground">.{domain || "m2hio.in"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only. Max 63 characters.</p>
            </div>
            <Button
              variant="secondary"
              onClick={checkAvailability}
              disabled={!name}
              className="w-full"
            >
              <Search className="mr-2 h-4 w-4" />
              Check Availability
            </Button>
            {nameAvailable === true && (
              <p className="text-sm text-green-600 dark:text-green-400">{name}.{domain || "m2hio.in"} is available!</p>
            )}
            {nameAvailable === false && !error && (
              <p className="text-sm text-red-600 dark:text-red-400">This name is not available. Try another.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={goNext} className="ml-auto">Next: Choose Setup</Button>
          </CardFooter>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Setup</CardTitle>
            <CardDescription>Select how DNS is managed for this subdomain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">DNS Mode</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDnsMode("STANDARD")}
                  className={`flex-1 rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                    dnsMode === "STANDARD" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                  }`}>
                  <span className="block font-medium">Standard</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">Direct traffic using standard IP or CNAME records.</span>
                </button>
                <button type="button" onClick={() => setDnsMode("DELEGATED")}
                  className={`flex-1 rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                    dnsMode === "DELEGATED" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                  }`}>
                  <span className="block font-medium">Advanced (Delegation)</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">Use your own external hosting nameservers.</span>
                </button>
              </div>
            </div>

            {dnsMode === "STANDARD" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target</label>
                  <Input placeholder="your-app.onrender.com" value={target} onChange={(e) => setTarget(e.target.value)} className="font-mono" />
                  <p className="text-xs text-muted-foreground">IP address (A) or hostname (CNAME) your subdomain points to</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Record Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="A">A - IPv4 address</option>
                    <option value="AAAA">AAAA - IPv6 address</option>
                    <option value="CNAME">CNAME - Canonical name</option>
                  </select>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={proxied} onChange={(e) => setProxied(e.target.checked)}
                    className="h-4 w-4 rounded border-border" />
                  <span className="text-sm">Proxy through Cloudflare (orange cloud)</span>
                </label>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nameservers</label>
                {nameservers.map((ns, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder={`ns${i + 1}.example.com`} value={ns}
                      onChange={(e) => {
                        const next = [...nameservers];
                        next[i] = e.target.value;
                        setNameservers(next);
                      }}
                      className="font-mono" />
                    {nameservers.length > 1 && (
                      <Button type="button" variant="outline" size="icon"
                        onClick={() => setNameservers(nameservers.filter((_, j) => j !== i))}>
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm"
                  onClick={() => setNameservers([...nameservers, ""])}>
                  + Add nameserver
                </Button>
                <p className="text-xs text-muted-foreground">The nameservers where your DNS records are managed</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={goBack}>Back</Button>
            <Button onClick={goNext}>Next: Identity Verification</Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>We need a few details before creating your subdomain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth</label>
              <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input placeholder="123 Main St, City" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="Personal">Personal</option>
                <option value="Business">Business</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Project">Project</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={goBack}>Back</Button>
            <Button onClick={goNext}>Next: Agree to Rules</Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Agree to Rules</CardTitle>
            <CardDescription>You must agree to our terms before launching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:border-primary/50 transition-colors">
              <input type="checkbox" checked={agreedRules} onChange={(e) => setAgreedRules(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border" />
              <span className="text-sm">
                I will not use this subdomain for spam, scams, or phishing.{' '}
                <Link href="/legal/aup" className="text-primary underline">View Acceptable Use Policy →</Link>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:border-primary/50 transition-colors">
              <input type="checkbox" checked={agreedEnforcement} onChange={(e) => setAgreedEnforcement(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border" />
              <span className="text-sm">
                I understand SubDNS can instantly delete my site if I break the{' '}
                <Link href="/legal/terms" className="text-primary underline">Terms of Service</Link>.{' '}
                Read our <Link href="/legal/privacy" className="text-primary underline">Privacy Policy</Link>.
              </span>
            </label>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={goBack} disabled={loading}>Back</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching...</> : "Launch Subdomain"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Review & Done</CardTitle>
                <CardDescription>Your subdomain is being configured</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subdomain</span>
                <span className="font-mono font-medium">{name}.{domain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">DNS Mode</span>
                <span>{dnsMode === "STANDARD" ? "Standard (Cloudflare managed)" : "Delegated (custom nameservers)"}</span>
              </div>
              {dnsMode === "STANDARD" && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-mono">{target}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Record Type</span>
                    <span>{type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Proxied</span>
                    <span>{proxied ? "Yes" : "No"}</span>
                  </div>
                </>
              )}
              {dnsMode === "DELEGATED" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nameservers</span>
                  <span className="font-mono text-right">{nameservers.filter((ns) => ns.trim()).join(", ")}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">DNS propagation may take a few minutes.</p>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard/subdomains")}>
              Back to Subdomains
            </Button>
            {createdId && (
              <Button onClick={() => router.push(`/dashboard/subdomains/${createdId}`)}>
                View Details
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
