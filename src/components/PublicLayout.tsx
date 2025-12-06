
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const location = useLocation();
    const isAuthPage = ['/signin', '/signup'].includes(location.pathname);

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            R
                        </div>
                        Recta
                    </Link>
                    {!isAuthPage && (
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                            <Link to="/#features" className="hover:text-foreground transition-colors">Features</Link>
                            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                            <Link to="/#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/signin">
                        <Button variant="ghost" size="sm">Sign In</Button>
                    </Link>
                    <Link to="/pricing">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

const Footer = () => (
    <footer className="border-t bg-muted/40">
        <div className="container py-8 md:py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="col-span-2">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            R
                        </div>
                        Recta
                    </Link>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        The leading marble cut optimization software for Moroccan factories. Save material, save money.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold mb-3">Product</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link to="/#features" className="hover:text-foreground">Features</Link></li>
                        <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
                        <li><Link to="/signin" className="hover:text-foreground">Login</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-3">Legal</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Recta. All rights reserved. made in Morocco 🇲🇦
            </div>
        </div>
    </footer>
);

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
