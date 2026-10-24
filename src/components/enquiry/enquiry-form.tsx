"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChoiceRow, Field, Input, Select } from "@/components/ui/field";
import { company, process as processFacts } from "@/content/facts";
import { services, type ServiceSlug } from "@/content/services";
import { submitEnquiry, type SubmitResult } from "@/app/become-a-client/actions";
import { track } from "@/lib/analytics/track";
import { useFieldTracking } from "@/lib/analytics/use-field-tracking";
import type { FieldName } from "@/lib/analytics/events";
import { inSentence } from "@/lib/text";
import { arrangementOptions, contactTimeOptions, headcountOptions, parseEnquiry, stepFields, type Enquiry } from "./schema";

/**
 * The three-step enquiry form, ported from v1 (logic unchanged, restyled): what you need and how many people; your
 * organisation; you. Each step validates with zod (react-hook-form `trigger` on its fields) and the server action
 * validates the whole submission again. Fully keyboard operable: native controls, focus moves to the new step's
 * heading, errors are inline and say how to fix them. The step panel slides in from the direction of travel,
 * 200 ms, only in response to the visitor's action.
 *
 * Analytics instrumentation returns with the analytics port (docs/PLAN.md step 11).
 */
const resolver: Resolver<Enquiry> = async (values) => {
  const r = parseEnquiry(values);
  if (r.success) return { values: r.data, errors: {} };
  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of r.error.issues) {
    const key = String(issue.path[0] ?? "root");
    if (!errors[key]) errors[key] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors: errors as unknown as FieldErrors<Enquiry> };
};

const stepTitles = ["What do you need?", "Your organisation", "You"] as const;

export function EnquiryForm() {
  // react-hook-form's formState is a read-tracking proxy; React Compiler memoisation can skip the reads that
  // subscribe it (react-hooks/incompatible-library). This component is compiled without memoisation.
  "use no memo";
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const form = useForm<Enquiry>({
    resolver,
    mode: "onTouched",
    defaultValues: {
      services: [],
      headcount: undefined,
      organisation: "",
      industry: "",
      location: "",
      arrangement: undefined,
      name: "",
      role: "",
      email: "",
      phone: "",
      contactTime: undefined,
      consent: undefined,
      website: "",
    },
  });
  const { register, handleSubmit, trigger, formState, setValue } = form;
  const errors = formState.errors;

  // Field order across all three steps, so the funnel index says how far someone got overall.
  const FIELDS: FieldName[] = [
    "services", "headcount",
    "organisation", "industry", "location", "arrangement",
    "name", "role", "email", "phone", "contactTime", "consent",
  ];
  const field = useFieldTracking("enquiry", FIELDS);

  // `?service=<slug>` from a service page pre-ticks that service. Read from the URL after mount, not with
  // `useSearchParams`: that hook makes the tree up to the nearest Suspense boundary client-rendered only, which kept
  // the whole form out of the prerendered HTML in v1 and shifted the page by its full height on hydration (CLS 0.60
  // on mobile, measured). Here a checkbox already on the page becomes ticked, which shifts nothing.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search)
      .getAll("service")
      .filter((s): s is ServiceSlug => services.some((x) => x.slug === s));
    if (wanted.length) setValue("services", wanted, { shouldValidate: false, shouldDirty: false });
    // The funnel's entry event, fired here because this is where the preselected service is known. It is a slug from
    // our own content, not anything the visitor typed.
    track({ name: "enquiry_viewed", preselected_service: wanted[0] ?? "none" });
  }, [setValue]);

  useEffect(() => {
    track({ name: "enquiry_step_viewed", step: stepNumber(step) });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const next = async () => {
    const ok = await trigger(stepFields[step], { shouldFocus: true });
    if (!ok) {
      // Which question stopped them is the whole question this funnel exists to answer.
      const blocking = stepFields[step].find((f) => f in form.formState.errors) as FieldName | undefined;
      track({ name: "enquiry_step_blocked", step: stepNumber(step), first_invalid_field: blocking ?? "services" });
      return;
    }
    track({ name: "enquiry_step_completed", step: stepNumber(step) });
    setDirection(1);
    setStep((s) => Math.min(2, s + 1));
  };
  const back = () => {
    track({ name: "enquiry_step_back", step: stepNumber(step) });
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };
  const onSubmit = (data: Enquiry) => {
    startTransition(async () => {
      // An unreachable server action throws instead of returning {ok:false}; without this the visitor sees nothing and
      // the failure is never reported. The reason tracked is the enum value, never the error's message.
      let r: SubmitResult;
      try {
        r = await submitEnquiry(data);
      } catch {
        r = { ok: false, error: "We could not reach our server. Check your connection, or reach us on WhatsApp or by phone.", reason: "network" };
      }
      setResult(r);
      if (r.ok) {
        // Counts and the band they chose, which is already a bucket. Nothing they typed.
        track({ name: "enquiry_submitted", services_count: data.services.length, headcount_band: data.headcount });
        window.scrollTo({ top: 0, behavior: "auto" });
      } else {
        track({ name: "enquiry_failed", reason: r.reason });
      }
    });
  };

  // getValues, not watch: the success screen renders once with what was sent; nothing needs to stay subscribed.
  if (result?.ok) return <Success services={form.getValues("services")} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="enquiry-title">
      <Progress step={step} />

      <h2 ref={headingRef} tabIndex={-1} id="enquiry-title" className="mt-8 text-[1.75rem] outline-none lg:text-[2rem]">
        {stepTitles[step]}
      </h2>
      <p className="mt-1 text-sm text-ink/75">Step {step + 1} of 3</p>

      <div key={step} className="step-panel mt-8 space-y-7" style={{ "--step-dir": direction } as React.CSSProperties}>
        {step === 0 ? (
          <>
            <Field label="Which services do you need?" hint="Choose everything that applies." htmlFor="services" error={errors.services?.message}>
              <div id="services" role="group" aria-label="Services" className="border-t border-navy/10">
                {services.map((s) => (
                  <ChoiceRow key={s.slug} type="checkbox" value={s.slug} label={s.name} description={s.removes} {...register("services")} />
                ))}
              </div>
            </Field>
            <Field label="How many people are involved?" htmlFor="headcount" error={errors.headcount?.message}>
              <div id="headcount" role="radiogroup" aria-label="Headcount" className="border-t border-navy/10">
                {headcountOptions.map((o) => (
                  <ChoiceRow key={o.value} type="radio" value={o.value} label={o.label} {...register("headcount")} />
                ))}
              </div>
            </Field>
          </>
        ) : step === 1 ? (
          <>
            <Field label="Organisation" htmlFor="organisation" error={errors.organisation?.message}>
              <Input id="organisation" autoComplete="organization" invalid={!!errors.organisation} {...register("organisation")} onFocus={field.onFocus("organisation")} onBlur={field.onBlur("organisation")} />
            </Field>
            <Field label="Industry" hint="For example: manufacturing, telecoms, financial services." htmlFor="industry" error={errors.industry?.message}>
              <Input id="industry" invalid={!!errors.industry} {...register("industry")} onFocus={field.onFocus("industry")} onBlur={field.onBlur("industry")} />
            </Field>
            <Field label="Where are the people?" hint="City or state. Benin Republic counts." htmlFor="location" error={errors.location?.message}>
              <Input id="location" autoComplete="address-level2" invalid={!!errors.location} {...register("location")} onFocus={field.onFocus("location")} onBlur={field.onBlur("location")} />
            </Field>
            <Field label="How is this handled today?" htmlFor="arrangement" error={errors.arrangement?.message}>
              <Select id="arrangement" defaultValue="" invalid={!!errors.arrangement} {...register("arrangement")} onFocus={field.onFocus("arrangement")} onBlur={field.onBlur("arrangement")}>
                <option value="" disabled>
                  Choose one
                </option>
                {arrangementOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        ) : (
          <>
            <div className="grid gap-7 md:grid-cols-2">
              <Field label="Your name" htmlFor="name" error={errors.name?.message}>
                <Input id="name" autoComplete="name" invalid={!!errors.name} {...register("name")} onFocus={field.onFocus("name")} onBlur={field.onBlur("name")} />
              </Field>
              <Field label="Your role" htmlFor="role" error={errors.role?.message}>
                <Input id="role" autoComplete="organization-title" invalid={!!errors.role} {...register("role")} onFocus={field.onFocus("role")} onBlur={field.onBlur("role")} />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" inputMode="email" autoComplete="email" invalid={!!errors.email} {...register("email")} onFocus={field.onFocus("email")} onBlur={field.onBlur("email")} />
              </Field>
              <Field label="Phone" hint="We call or WhatsApp this number." htmlFor="phone" error={errors.phone?.message}>
                <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" invalid={!!errors.phone} {...register("phone")} onFocus={field.onFocus("phone")} onBlur={field.onBlur("phone")} />
              </Field>
            </div>
            <Field label="When should we call?" htmlFor="contactTime" error={errors.contactTime?.message}>
              <Select id="contactTime" defaultValue="" invalid={!!errors.contactTime} {...register("contactTime")} onFocus={field.onFocus("contactTime")} onBlur={field.onBlur("contactTime")}>
                <option value="" disabled>
                  Choose a time
                </option>
                {contactTimeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="border-t border-navy/10">
              <ChoiceRow
                type="checkbox"
                label="You may process these details to respond to this enquiry."
                description={`Held under the ${company.ndpr}. Full policy at /privacy-policy.`}
                {...register("consent")}
              />
              {errors.consent ? (
                <p role="alert" className="mt-1.5 text-sm text-[#B3261E]">
                  {errors.consent.message}
                </p>
              ) : null}
            </div>
            {/* Honeypot: humans never see it; a filled one is acknowledged and delivers nothing (actions.ts). */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>
          </>
        )}
      </div>

      {result && !result.ok ? (
        <p role="alert" className="mt-6 border-l-4 border-[#B3261E] pl-3">
          {result.error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-6">
        {step < 2 ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? "Sending" : "Send the enquiry"}
          </Button>
        )}
        {step > 0 ? (
          <Button variant="link" onClick={back}>
            Back
          </Button>
        ) : null}
        <p className="text-sm text-ink/75 sm:ml-auto">
          Prefer to talk?{" "}
          <a href={company.whatsappHref} className="font-bold text-accent-strong underline underline-offset-4" rel="noopener noreferrer" target="_blank">
            WhatsApp
          </a>{" "}
          or{" "}
          <a href={company.phoneHref} className="font-bold text-accent-strong underline underline-offset-4">
            {company.phone}
          </a>
        </p>
      </div>
    </form>
  );
}

/** Three segments; completed and current fill with the accent. */
function Progress({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
      {stepTitles.map((t, i) => (
        <li key={t} aria-current={i === step ? "step" : undefined}>
          <span aria-hidden="true" className={`block h-1.5 rounded-full transition-colors duration-300 ${i <= step ? "bg-accent-strong" : "bg-navy/15"}`} />
          <span className={`mt-2 block text-sm ${i <= step ? "font-bold text-navy" : "text-ink/70"}`}>{t}</span>
        </li>
      ))}
    </ol>
  );
}

function Success({ services: chosen }: { services: ServiceSlug[] }) {
  const names = chosen.map((s) => services.find((x) => x.slug === s)?.name).filter(Boolean);
  return (
    <div aria-live="polite">
      <h2 className="text-[1.75rem] lg:text-[2rem]">Received. Here is what happens next.</h2>
      <ol className="mt-8 space-y-4">
        <li className="flex gap-4 rounded-lg bg-mist p-5">
          <span className="font-display text-xl font-bold text-accent-strong">1</span>
          <span>{processFacts.responsePromise}</span>
        </li>
        <li className="flex gap-4 rounded-lg bg-mist p-5">
          <span className="font-display text-xl font-bold text-accent-strong">2</span>
          <span>We talk through {names.length ? names.map((n) => (n ? inSentence(n) : "")).join(", ") : "what you need"} and the people involved.</span>
        </li>
        {/* TODO(client): Q12 — a fuller process (scoping session, proposal inside five working days) needs the
            client's approval before it is promised here. Only the site's own 24-hour line is stated. */}
      </ol>
      <p className="mt-8">
        Need it sooner?{" "}
        <a href={company.whatsappHref} className="font-bold text-accent-strong underline underline-offset-4" rel="noopener noreferrer" target="_blank">
          WhatsApp us
        </a>{" "}
        or call{" "}
        <a href={company.phoneHref} className="font-bold text-accent-strong underline underline-offset-4">
          {company.phone}
        </a>
        .
      </p>
      <p className="mt-10">
        <Link href="/" className="font-bold text-accent-strong underline underline-offset-4">
          Back to the home page
        </Link>
      </p>
    </div>
  );
}

function stepNumber(i: number): 1 | 2 | 3 {
  return (i + 1) as 1 | 2 | 3;
}
