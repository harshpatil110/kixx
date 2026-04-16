import React from "react";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// PrivacyPolicy — KIXX Editorial Legal Page
// ─────────────────────────────────────────────────────────────────────────────
export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#F7F5F0]">

            {/* ═══════════════════════════════════════════════════════════════
                HEADER
            ═══════════════════════════════════════════════════════════════ */}
            <header className="pt-36 pb-14 px-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-5">
                    Legal Document &mdash; Effective April 2026
                </p>
                <h1 className="text-5xl font-bold tracking-tighter text-stone-900 mb-6 uppercase">
                    Privacy Policy
                </h1>
                <div className="mx-auto h-px w-16 bg-stone-300" />
            </header>

            {/* ═══════════════════════════════════════════════════════════════
                BODY
            ═══════════════════════════════════════════════════════════════ */}
            <main className="max-w-3xl mx-auto py-20 px-6">

                {/* ── Preamble ──────────────────────────────────────────── */}
                <div className="mb-16 text-stone-500 leading-relaxed text-sm border-l-2 border-stone-300 pl-6">
                    <p>
                        KIXX is committed to safeguarding your personal information.
                        This Privacy Policy explains how we collect, use, disclose, and
                        protect the data you entrust to us when using our e-commerce
                        platform, mobile experiences, and related services. By accessing
                        or using KIXX, you acknowledge that you have read and understood
                        this policy.
                    </p>
                </div>

                {/* ── 1.0 INFORMATION COLLECTION ────────────────────────── */}
                <h2 className="text-xs font-bold tracking-[0.2em] text-stone-400 mb-4 mt-12 uppercase border-b border-stone-200 pb-2">
                    1.0 &mdash; Information Collection
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    We collect information that you provide directly, as well as data
                    generated automatically through your use of the platform. The categories
                    of data we process include:
                </p>
                <ul className="space-y-3 mb-6">
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Account Information.</strong>{" "}
                            When you register, we collect your full name, email address, and
                            authentication credentials. Account sign-in is managed securely
                            through Firebase Authentication by Google.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Transaction Data.</strong>{" "}
                            Order history, shipping addresses, billing details, payment
                            confirmation tokens, and purchase amounts are stored to process
                            and fulfil your orders.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Personal Collections.</strong>{" "}
                            When you use the &quot;Add to My Archive&quot; feature to log past
                            sneakers you have owned, we store the shoe name, brand, release year,
                            and SKU you provide. This collection data is linked to your
                            account and is visible only to you and platform administrators
                            for quality-control purposes.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Technical Data.</strong>{" "}
                            IP address, browser type and version, device identifiers,
                            operating system, time zone, and session cookies are collected
                            automatically to maintain platform security and performance.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Usage Analytics.</strong>{" "}
                            Pages visited, products viewed, search queries, filter selections,
                            and navigation patterns help us refine our catalog experience and
                            improve product discovery.
                        </span>
                    </li>
                </ul>

                {/* ── 2.0 DATA UTILIZATION ──────────────────────────────── */}
                <h2 className="text-xs font-bold tracking-[0.2em] text-stone-400 mb-4 mt-12 uppercase border-b border-stone-200 pb-2">
                    2.0 &mdash; Data Utilization
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    Your data is processed exclusively for legitimate, clearly defined
                    business purposes. We never sell, rent, or trade personal data to
                    third-party advertisers.
                </p>
                <ul className="space-y-3 mb-6">
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Order Fulfillment.</strong>{" "}
                            Processing, shipping, and delivering your purchases with accurate
                            logistics information.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Secure Payments.</strong>{" "}
                            Routing transactions through PCI-DSS-compliant payment gateways.
                            KIXX does not store raw credit or debit card numbers on our servers.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Product Reviews.</strong>{" "}
                            When you submit a review or rating on a sneaker, your display name,
                            star rating, and comment text are stored and displayed publicly on
                            the corresponding product page. Reviews help the community make
                            informed purchase decisions and are visible to all visitors.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Feedback &amp; Issue Reports.</strong>{" "}
                            When you use the &quot;Report an Issue / Feedback&quot; feature,
                            your selected category and message text are recorded alongside
                            your user ID. This data is escalated to our internal engineering
                            and product teams for triage, bug resolution, and platform
                            improvement. Feedback submissions are not made public.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Personalization.</strong>{" "}
                            Tailoring product recommendations, promotional offers (such as
                            first-purchase discounts), and browsing experiences based on
                            aggregated behavioral patterns.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Fraud Prevention.</strong>{" "}
                            Detecting and blocking unauthorized access attempts, suspicious
                            transactions, and account abuse through automated security
                            monitoring.
                        </span>
                    </li>
                </ul>

                {/* ── 3.0 THIRD-PARTY SHARING ──────────────────────────── */}
                <h2 className="text-xs font-bold tracking-[0.2em] text-stone-400 mb-4 mt-12 uppercase border-b border-stone-200 pb-2">
                    3.0 &mdash; Third-Party Services &amp; Data Sharing
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    To operate and deliver the KIXX experience, we integrate with
                    carefully vetted service providers. Data shared with these partners
                    is limited to what is strictly necessary:
                </p>
                <ul className="space-y-3 mb-6">
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Firebase (Google).</strong>{" "}
                            Handles user authentication, session management, and identity
                            verification. Firebase processes credentials under Google Cloud
                            security standards.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Cloudinary.</strong>{" "}
                            All product images uploaded by administrators are processed,
                            transformed, and served through Cloudinary&apos;s CDN for
                            optimized delivery. Cloudinary receives image files only; no
                            personally identifiable user data is transmitted to or stored
                            by Cloudinary.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Payment Gateways.</strong>{" "}
                            Payment processing partners (e.g., Razorpay) handle all
                            financial transactions under PCI-DSS Level 1 compliance. KIXX
                            does not have access to or store your full card number, CVV, or
                            banking PIN at any point.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Analytics.</strong>{" "}
                            Aggregated, anonymized usage metrics are collected to measure
                            platform performance and identify areas for improvement. No
                            personally identifiable information is shared with analytics
                            providers.
                        </span>
                    </li>
                </ul>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    All third-party partners are contractually bound to process your data
                    solely for the purposes described in this policy and in accordance
                    with applicable data protection regulations.
                </p>

                {/* ── 4.0 ADMIN ACCESS & TRANSPARENCY ──────────────────── */}
                <h2 className="text-xs font-bold tracking-[0.2em] text-stone-400 mb-4 mt-12 uppercase border-b border-stone-200 pb-2">
                    4.0 &mdash; Administrative Access &amp; Transparency
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    KIXX platform administrators have access to certain user-generated
                    content strictly for operational and quality-control purposes:
                </p>
                <ul className="space-y-3 mb-6">
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Feedback &amp; Reports.</strong>{" "}
                            Administrators can view, categorize, and respond to user-submitted
                            feedback and bug reports through the internal admin dashboard. This
                            enables timely issue resolution and product roadmap prioritization.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Product Reviews.</strong>{" "}
                            Administrators can view, moderate, and remove reviews that violate
                            community guidelines, contain offensive language, or are identified
                            as spam. Moderation actions are logged for accountability.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Personal Archives.</strong>{" "}
                            Aggregated archive data (shoe names, brands, years) may be viewed
                            by administrators to understand sneaker trends and improve catalog
                            curation. Individual archive entries are never shared publicly or
                            with other users.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Order &amp; Customer Data.</strong>{" "}
                            Admin users have visibility into order histories, customer profiles,
                            and sales analytics to manage inventory, resolve disputes, and
                            provide customer support.
                        </span>
                    </li>
                </ul>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    Administrative access is role-gated. Only verified admin accounts can
                    access the admin dashboard. All admin activity is subject to internal
                    audit logging.
                </p>

                {/* ── 5.0 USER RIGHTS ──────────────────────────────────── */}
                <h2 className="text-xs font-bold tracking-[0.2em] text-stone-400 mb-4 mt-12 uppercase border-b border-stone-200 pb-2">
                    5.0 &mdash; User Rights
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    You retain full ownership and control over your personal data. As a
                    KIXX user, you are entitled to the following rights:
                </p>
                <ul className="space-y-3 mb-6">
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Right of Access.</strong>{" "}
                            Request a complete copy of the personal data we hold about you
                            at any time through your Account settings or by contacting us
                            directly.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Right to Rectification.</strong>{" "}
                            Update or correct inaccurate information through your profile
                            dashboard at any time.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Right to Deletion.</strong>{" "}
                            Request permanent deletion of your account, order history,
                            personal archives, reviews, and all associated data. Deletion
                            requests are processed within 30 calendar days.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Right to Data Portability.</strong>{" "}
                            Request an export of your data in a structured, machine-readable
                            format (JSON) for transfer to another service.
                        </span>
                    </li>
                    <li className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <span className="text-stone-300 font-bold flex-shrink-0">&mdash;</span>
                        <span>
                            <strong className="text-stone-800">Withdrawal of Consent.</strong>{" "}
                            Revoke consent for optional data processing (e.g., promotional
                            emails) at any time. Withdrawal does not affect the lawfulness
                            of processing conducted prior to revocation.
                        </span>
                    </li>
                </ul>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    To exercise any of these rights, contact us at{" "}
                    <strong className="text-stone-800">privacy@kixx.store</strong>.
                    We will acknowledge your request within 48 hours and complete
                    processing within 30 calendar days.
                </p>

                {/* ── 6.0 DATA RETENTION ───────────────────────────────── */}
                <h2 className="text-xs font-bold tracking-[0.2em] text-stone-400 mb-4 mt-12 uppercase border-b border-stone-200 pb-2">
                    6.0 &mdash; Data Retention
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    We retain personal data only for as long as necessary to fulfil the
                    purposes outlined in this policy. Order and transaction records are
                    retained for a minimum of 5 years to comply with financial reporting
                    obligations. Account data, personal archives, and reviews are retained
                    until you request deletion or deactivate your account. Feedback and
                    issue reports are anonymized after resolution and retained in aggregate
                    form for product improvement analytics.
                </p>

                {/* ── DIVIDER ──────────────────────────────────────────── */}
                <div className="my-16 h-px w-full bg-stone-200" />

                {/* ── SIGNATURE ────────────────────────────────────────── */}
                <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-3">
                        &mdash; KIXX Legal Dept
                    </p>
                    <p className="text-stone-400 text-[13px] leading-relaxed max-w-md mx-auto mb-8">
                        This policy is reviewed quarterly and updated as necessary.
                        Material changes will be communicated via email or through an
                        in-platform notification banner.
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-block text-[10px] font-bold uppercase tracking-[0.2em]
                                   text-stone-500 hover:text-stone-900 transition-colors
                                   border-b border-stone-300 hover:border-stone-900 pb-0.5"
                    >
                        &larr; Back to Catalog
                    </Link>
                </div>
            </main>
        </div>
    );
}
