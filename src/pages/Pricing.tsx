
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const PricingCard = ({ title, price, features, description, popular, planId }: { title: string, price: string, features: string[], description: string, popular?: boolean, planId: string }) => (
    <div className={`relative flex flex-col p-6 bg-card border rounded-xl shadow-sm ${popular ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-border'}`}>
        {popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                Most Popular
            </div>
        )}
        <div className="mb-4">
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </div>
        <div className="mb-6">
            <span className="text-4xl font-bold">{price}</span>
            {price !== 'Free' && <span className="text-muted-foreground">/month</span>}
        </div>
        <ul className="space-y-3 mb-6 flex-1">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <Link to={`/signup?plan=${planId}`}>
            <Button className="w-full" variant={popular ? 'default' : 'outline'}>
                Choose {title}
            </Button>
        </Link>
    </div>
);

const Pricing = () => {
    return (
        <div className="container py-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Simple, transparent pricing</h1>
                <p className="text-xl text-muted-foreground">
                    Choose the plan that best fits your marble factory's needs.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <PricingCard
                    title="Free"
                    price="Free"
                    planId="free"
                    description="Perfect for hobbyists and small workshops."
                    features={[
                        "Up to 3 projects",
                        "Basic optimization algorithm",
                        "Standard PDF export",
                        "Community support"
                    ]}
                />
                <PricingCard
                    title="Pro"
                    price="299 DH"
                    planId="pro"
                    popular={true}
                    description="Everything a growing marble factory needs."
                    features={[
                        "Unlimited projects",
                        "Advanced optimization (saves ~20% more material)",
                        "3D Visualization",
                        "Custom PDF / CSV exports",
                        "Stock management",
                        "Priority support"
                    ]}
                />
                <PricingCard
                    title="Enterprise"
                    price="Custom"
                    planId="enterprise"
                    description="For large-scale industrial operations."
                    features={[
                        "Multiple user seats",
                        "API Access",
                        "3D Visualization",
                        "Dedicated account manager",
                        "On-site training",
                        "Custom integrations"
                    ]}
                />
            </div>
        </div>
    );
};

export default Pricing;
