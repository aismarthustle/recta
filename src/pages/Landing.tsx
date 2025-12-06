
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Box, LayoutGrid, Zap, TrendingUp, Scissors } from 'lucide-react';

const Landing = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
                <div className="container flex flex-col items-center text-center">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-6">
                        New: Pro Optimization Engine
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl max-w-4xl mb-6">
                        Optimize Marble Cuts. <br />
                        <span className="text-primary">Minimize Waste.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mb-10">
                        Recta helps Moroccan marble factories optimize cutting diagrams, reduce waste by up to 30%, and manage stock efficiently.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/pricing">
                            <Button size="lg" className="h-12 px-8 text-lg">
                                Start Optimizing Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/#features">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                                View Features
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-20 w-full max-w-5xl rounded-xl border bg-card shadow-2xl overflow-hidden">
                        <img src="/landing-dashboard-preview.png" alt="Dashboard Preview" className="w-full h-auto opacity-90" onError={(e) => {
                            // Fallback if image doesn't exist, create a placeholder
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="aspect-video bg-muted flex items-center justify-center text-muted-foreground">Dashboard Preview Placeholder</div>';
                        }} />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-muted/30">
                <div className="container">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need to optimize production</h2>
                        <p className="text-lg text-muted-foreground">
                            Built specifically for the needs of marble and stone cutting workshops.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-background rounded-xl shadow-sm border">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <Scissors className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Smart Nesting</h3>
                            <p className="text-muted-foreground">Advanced algorithms automatically arrange pieces to minimize waste and maximize material usage.</p>
                        </div>
                        <div className="p-6 bg-background rounded-xl shadow-sm border">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <Box className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Stock Management</h3>
                            <p className="text-muted-foreground">Keep track of your marble slabs, offcuts, and inventory in real-time.</p>
                        </div>
                        <div className="p-6 bg-background rounded-xl shadow-sm border">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Cost Analysis</h3>
                            <p className="text-muted-foreground">Instantly calculate project costs, material needs, and profit margins.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20">
                <div className="container">
                    <div className="bg-primary/5 rounded-3xl p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-8">"Recta changed how we work. We save about 15,000 DH per month on material costs alone."</h2>
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                                {/* <img src="..." /> */}
                            </div>
                            <div className="text-left">
                                <div className="font-bold">Ahmed Benali</div>
                                <div className="text-sm text-muted-foreground">Owner, Marbre du Nord</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
