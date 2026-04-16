import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_ITEMS = [
    {
        question: "HOW DOES THE AUTHENTICITY GUARANTEE WORK?",
        answer: "Every pair in our archive undergoes a multi-stage verification process by our master curators. We inspect stitching, materials, scent, and SKU consistency to ensure you receive a 100% genuine artifact."
    },
    {
        question: "WHAT ARE THE ESTIMATED SHIPPING TIMES?",
        answer: "Standard shipping typically takes 3-5 business days within the continental US. International orders vary by region but generally arrive within 10-14 business days. All shipments are insured and tracked."
    },
    {
        question: "CAN I RETURN AN ITEM IF IT DOESN'T FIT?",
        answer: "Due to the curated and limited nature of our sneaker archive, all sales are final. We provide detailed sizing charts and professional consultations to help you find the perfect fit before purchase."
    },
    {
        question: "HOW DO I LIST MY PERSONAL COLLECTION FOR SALE?",
        answer: "Our resale platform is currently in a closed beta Phase. Existing members with high trust scores will be invited to list their personal sneaker archives in the coming months."
    },
    {
        question: "WHAT IS THE 'AR TRY-ON' FEATURE?",
        answer: "Our Augmented Reality (AR) engine allows you to project a 1:1 scale digital model of any sneaker onto your feet using your mobile device's camera. Look for the 'World View' button on the product detail page."
    }
];

function FaqItem({ question, answer, isOpen, onToggle }) {
    return (
        <div className="border-b border-stone-200">
            <button
                onClick={onToggle}
                className="w-full py-6 flex justify-between items-center text-left transition-colors hover:text-[#800000]"
            >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900">
                    {question}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
            </button>
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-6' : 'max-h-0'}`}
            >
                <p className="text-stone-600 text-sm leading-relaxed font-medium">
                    {answer}
                </p>
            </div>
        </div>
    );
}

export default function FaqPage() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="min-h-screen bg-[#F7F5F0] pt-32 pb-24 px-6 md:px-0">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 block mb-3">
                        Customer Support
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-stone-900 uppercase leading-[0.9]">
                        Frequently Asked <br />
                        <span className="text-[#800000]">Questions</span>
                    </h1>
                </div>

                {/* FAQ List */}
                <div className="space-y-0">
                    {FAQ_ITEMS.map((item, index) => (
                        <FaqItem
                            key={index}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                        />
                    ))}
                </div>

                {/* Footer Link / Contact */}
                <div className="mt-20 pt-12 border-t border-stone-200">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        Still have questions?
                    </p>
                    <a 
                        href="mailto:support@kixx.com" 
                        className="text-stone-900 font-bold hover:text-[#800000] transition-colors mt-2 block uppercase text-sm"
                    >
                        Contact Our Support Team &rarr;
                    </a>
                </div>
            </div>
        </div>
    );
}
