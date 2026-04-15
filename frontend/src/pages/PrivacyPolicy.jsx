import React from 'react';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Section component — keeps each policy block consistent
// ─────────────────────────────────────────────────────────────────────────────
function Section({ number, title, children }) {
    return (
        <section className="mb-14">
            <div className="flex items-baseline gap-3 mb-5">
                <span className="text-[11px] font-black tracking-[0.25em] text-stone-400 uppercase">
                    {number}
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 uppercase leading-none">
                    {title}
                </h2>
            </div>
            <div className="text-stone-600 leading-relaxed text-[15px] space-y-4 pl-0 sm:pl-10">
                {children}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PrivacyPolicy Page
// ─────────────────────────────────────────────────────────────────────────────
export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#F7F5F0]">

            {/* ── Header band ─────────────────────────────────────────────── */}
            <header className="pt-32 pb-16 px-6 text-center border-b border-stone-200">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-4">
                    Legal — Last Updated April 2026
                </p>
                <h1
                    className="font-black uppercase tracking-tighter text-stone-900 leading-none"
                    style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
                >
                    Privacy Policy
                </h1>
                <div className="mx-auto mt-6 h-px w-14 bg-stone-300" />
            </header>

            {/* ── Body ────────────────────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">

                {/* Preamble */}
                <div className="mb-16 text-stone-500 leading-relaxed text-[15px] border-l-2 border-stone-300 pl-6">
                    <p>
                        At <strong className="text-stone-900">KIXX</strong>, your privacy is foundational
                        to the trust we build with every customer. This document outlines what
                        information we collect, how we use it, who we share it with, and your
                        rights as a user of our platform.
                    </p>
                </div>

                {/* 1.0 Information Collection */}
                <Section number="1.0" title="Information Collection">
                    <p>
                        When you create an account, place an order, or interact with our
                        platform, we may collect the following categories of information:
                    </p>
                    <ul className="list-none space-y-2.5 mt-3">
                        {[
                            ['Identity Data', 'Full name, email address, and account credentials managed via Firebase Authentication.'],
                            ['Contact Data', 'Shipping address, billing address, and phone number provided during checkout.'],
                            ['Transaction Data', 'Order history, payment confirmations, and purchase amounts.'],
                            ['Technical Data', 'IP address, browser type, device identifiers, and session cookies to maintain platform security.'],
                            ['Usage Data', 'Pages visited, products viewed, search queries, and interaction patterns to improve our catalog experience.'],
                        ].map(([label, desc]) => (
                            <li key={label} className="flex gap-3">
                                <span className="text-stone-300 font-black text-xs mt-0.5 flex-shrink-0">—</span>
                                <span><strong className="text-stone-800">{label}.</strong> {desc}</span>
                            </li>
                        ))}
                    </ul>
                </Section>

                {/* 2.0 Data Utilization */}
                <Section number="2.0" title="Data Utilization">
                    <p>
                        We process your personal data strictly for legitimate business purposes,
                        including but not limited to:
                    </p>
                    <ul className="list-none space-y-2.5 mt-3">
                        {[
                            'Fulfilling and delivering your orders with accurate shipping information.',
                            'Processing payments securely through our authorized payment gateway partners.',
                            'Sending order confirmations, shipment tracking updates, and transactional emails.',
                            'Personalizing your browsing experience with relevant product recommendations.',
                            'Detecting and preventing fraudulent transactions and unauthorized account access.',
                            'Improving platform performance, reliability, and user interface through aggregated analytics.',
                        ].map((item, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="text-stone-300 font-black text-xs mt-0.5 flex-shrink-0">—</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-stone-400 text-[13px]">
                        We do not sell, rent, or trade your personal data to third parties for marketing purposes.
                    </p>
                </Section>

                {/* 3.0 Third-Party Sharing */}
                <Section number="3.0" title="Third-Party Sharing">
                    <p>
                        To operate the platform effectively, we partner with carefully vetted
                        third-party service providers. Your data may be shared with:
                    </p>
                    <ul className="list-none space-y-2.5 mt-3">
                        {[
                            ['Firebase (Google)', 'Authentication services, user session management, and secure identity verification.'],
                            ['Cloudinary', 'Product image hosting and optimized media delivery. No personal data is stored by Cloudinary.'],
                            ['Payment Gateways', 'Payment processing partners (e.g., Razorpay) handle transactions under PCI-DSS compliance. KIXX does not store raw card details.'],
                            ['Analytics Providers', 'Aggregated, anonymized usage metrics to understand platform performance. No personally identifiable information is shared for analytics.'],
                        ].map(([label, desc]) => (
                            <li key={label} className="flex gap-3">
                                <span className="text-stone-300 font-black text-xs mt-0.5 flex-shrink-0">—</span>
                                <span><strong className="text-stone-800">{label}.</strong> {desc}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4">
                        All third-party partners are contractually obligated to handle your data in
                        accordance with applicable privacy regulations and solely for the purposes
                        outlined in this policy.
                    </p>
                </Section>

                {/* 4.0 User Rights */}
                <Section number="4.0" title="User Rights">
                    <p>
                        You retain full control over your personal data. As a KIXX user, you have
                        the right to:
                    </p>
                    <ul className="list-none space-y-2.5 mt-3">
                        {[
                            ['Access', 'Request a copy of the personal data we hold about you at any time via your Account settings.'],
                            ['Rectification', 'Update or correct inaccurate personal information through your profile dashboard.'],
                            ['Deletion', 'Request permanent deletion of your account and associated data by contacting our support team.'],
                            ['Portability', 'Request your data in a structured, machine-readable format for transfer to another service.'],
                            ['Withdrawal of Consent', 'Revoke consent for optional data processing (e.g., marketing emails) at any time without affecting prior lawful processing.'],
                        ].map(([label, desc]) => (
                            <li key={label} className="flex gap-3">
                                <span className="text-stone-300 font-black text-xs mt-0.5 flex-shrink-0">—</span>
                                <span><strong className="text-stone-800">{label}.</strong> {desc}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4">
                        To exercise any of these rights, please reach out to us at{' '}
                        <strong className="text-stone-800">privacy@kixx.store</strong>. We will respond to all
                        legitimate requests within 30 calendar days.
                    </p>
                </Section>

                {/* ── Divider ─────────────────────────────────────────────── */}
                <div className="my-16 h-px w-full bg-stone-200" />

                {/* ── Signature ───────────────────────────────────────────── */}
                <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-3">
                        — KIXX Editorial Team
                    </p>
                    <p className="text-stone-400 text-[13px] leading-relaxed max-w-md mx-auto">
                        This policy is subject to periodic updates. Material changes will be
                        communicated via email or an in-platform notification.
                    </p>
                    <Link
                        to="/catalog"
                        className="inline-block mt-8 text-[10px] font-bold uppercase tracking-[0.2em]
                                   text-stone-500 hover:text-stone-900 transition-colors
                                   border-b border-stone-300 hover:border-stone-900 pb-0.5"
                    >
                        ← Back to Catalog
                    </Link>
                </div>
            </main>
        </div>
    );
}
