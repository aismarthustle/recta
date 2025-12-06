
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from 'react-router-dom';

const Admin = () => {
    const { user } = useAuth();

    // Protect admin route
    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    // TODO: Fetch real users from API
    const users = [
        { id: 1, username: 'admin', email: 'admin@recta.ma', role: 'admin', plan: 'enterprise', created_at: '2024-01-01' },
        { id: 2, username: 'marbre_sud', email: 'info@marbre-sud.ma', role: 'user', plan: 'pro', created_at: '2024-02-15' },
        { id: 3, username: 'atelier_fes', email: 'contact@atelierfes.com', role: 'user', plan: 'free', created_at: '2024-03-10' },
    ];

    return (
        <div className="min-h-screen bg-muted/20">
            <header className="bg-background border-b h-16 flex items-center px-6">
                <div className="flex items-center gap-2 font-bold text-xl text-primary mr-8">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                        R
                    </div>
                    Recta Admin
                </div>
                <nav className="flex items-center gap-6">
                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">User Dashboard</Link>
                    <Link to="/app" className="text-muted-foreground hover:text-foreground">App</Link>
                </nav>
            </header>

            <main className="container py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Platform Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">3</div>
                            <div className="text-xs text-muted-foreground">Total Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">1</div>
                            <div className="text-xs text-muted-foreground">Pro Subscribers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">150</div>
                            <div className="text-xs text-muted-foreground">Projects Created</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">2,100 DH</div>
                            <div className="text-xs text-muted-foreground">MRR</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>{u.id}</TableCell>
                                        <TableCell className="font-medium">{u.username}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{u.role}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${u.plan === 'pro' ? 'bg-primary/20 text-primary' :
                                                    u.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {u.plan}
                                            </span>
                                        </TableCell>
                                        <TableCell>{u.created_at}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Admin;
