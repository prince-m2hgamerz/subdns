"use client";

import { useEffect, useState, use } from "react";
import { Search, Shield, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

interface CertificateData {
  certId: string;
  ownerName: string;
  ownerEmail: string | null;
  subdomain: string;
  domain: string;
  fullDomain: string;
  target: string | null;
  status: string;
  dnsMode: string;
  issuedAt: string;
}

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ cert?: string }>;
}) {
  const params = use(searchParams);
  const initialCertId = params.cert;

  const [input, setInput] = useState(initialCertId || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ valid: boolean; certificate: CertificateData } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doVerify = (certId: string) => {
    if (!certId.trim()) return;
    setLoading(true);
    setData(null);
    setError(null);

    fetch(`/api/verify?cert=${encodeURIComponent(certId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to verify certificate.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (initialCertId) {
      doVerify(initialCertId);
    }
  }, [initialCertId]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="section-pad">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-gray-100 dark:bg-gray-900">
                <Shield className="h-7 w-7 text-foreground" />
              </div>
              <h1 className="display-lg">Verify Certificate</h1>
              <p className="mt-3 text-base text-muted-foreground">
                Verify the authenticity of a SubDNS ownership certificate. Enter the certificate number below.
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); doVerify(input); }}
              className="mt-10"
            >
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. CERT-example-1A2B3C4D"
                    className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10">
              {loading && (
                <div className="flex items-center justify-center gap-3 rounded-md border border-border bg-card p-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Verifying certificate&hellip;</p>
                </div>
              )}

              {error && !loading && (
                <div className="text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-red-50 dark:bg-red-950">
                    <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                    Certificate Not Found
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                </div>
              )}

              {data && !loading && (
                <>
                  {data.valid ? (
                    <div className="text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-emerald-50 dark:bg-emerald-950">
                        <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                        Certificate Verified
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This certificate is authentic and has not been tampered with.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-red-50 dark:bg-red-950">
                        <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                        Certificate Invalid
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        The cryptographic signature does not match. This certificate may have been altered.
                      </p>
                    </div>
                  )}

                  <div className="mt-8 rounded-md border border-border bg-card p-6 sm:p-8">
                    <dl className="space-y-4 text-sm">
                      <DividerRow label="Certificate No." value={data.certificate.certId} mono />
                      <DividerRow label="Subdomain" value={data.certificate.fullDomain} />
                      <DividerRow label="Parent Domain" value={data.certificate.domain} />
                      <DividerRow label="Target" value={data.certificate.target || "—"} />
                      <DividerRow label="DNS Mode" value={data.certificate.dnsMode} />
                      <DividerRow label="Status" value={data.certificate.status} />
                      <DividerRow label="Owner" value={data.certificate.ownerName} />
                      {data.certificate.ownerEmail && (
                        <DividerRow label="Email" value={data.certificate.ownerEmail} />
                      )}
                      <DividerRow
                        label="Issued"
                        value={new Date(data.certificate.issuedAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      />
                    </dl>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DividerRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono font-medium" : "font-medium text-right ml-4"}>{value}</dd>
    </div>
  );
}
