import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Play, StopCircle, Eye, Loader2, Upload, Pencil, Users, BarChart3, Vote, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Layout from "@/components/layout/Layout";
import ResultBar from "@/components/results/ResultBar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  adminApi, electionApi, categoryApi, candidateApi, votingApi, authApi,
  type Election, type Category, type Candidate, type VoteResult, type UserRecord,
} from "@/lib/api";

const Admin = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [selectedResultElection, setSelectedResultElection] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null);

  // Dialog states
  const [showElectionDialog, setShowElectionDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);

  // Edit states
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  // Delete confirmation states
  const [deleteElectionId, setDeleteElectionId] = useState<number | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [electionsData, categoriesData, candidatesData] = await Promise.all([
        electionApi.getElections(),
        categoryApi.getCategories(),
        candidateApi.getCandidates(),
      ]);
      setElections(electionsData);
      setCategories(categoriesData);
      setCandidates(candidatesData);
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await authApi.getUsers();
      setUsers(usersData);
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load users", variant: "destructive" });
    }
  };

  const fetchResults = async (electionId: number) => {
    try {
      const voteResults = await votingApi.getResults(electionId);
      setResults(voteResults);
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load results", variant: "destructive" });
    }
  };

  // Election handlers
  const handleCreateElection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await adminApi.createElection({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        start_date: formData.get('start_date') as string || undefined,
        end_date: formData.get('end_date') as string || undefined,
        is_public: formData.get('is_public') === 'on',
        allowed_voters: [],
        categories: [],
        status: 'draft',
        results_released: false,
      });
      toast({ title: "Success", description: "Election created successfully" });
      setShowElectionDialog(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create election", variant: "destructive" });
    }
  };

  const handleUpdateElection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingElection) return;
    const formData = new FormData(e.currentTarget);
    try {
      await adminApi.updateElection(editingElection.id, {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        start_date: formData.get('start_date') as string || undefined,
        end_date: formData.get('end_date') as string || undefined,
      });
      toast({ title: "Success", description: "Election updated successfully" });
      setEditingElection(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update election", variant: "destructive" });
    }
  };

  const handleDeleteElection = async () => {
    if (!deleteElectionId) return;
    try {
      await adminApi.deleteElection(deleteElectionId);
      toast({ title: "Success", description: "Election deleted successfully" });
      setDeleteElectionId(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete election", variant: "destructive" });
    }
  };

  // Category handlers
  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await categoryApi.createCategory({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        election: parseInt(formData.get('election') as string),
      });
      toast({ title: "Success", description: "Category created successfully" });
      setShowCategoryDialog(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create category", variant: "destructive" });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;
    const formData = new FormData(e.currentTarget);
    try {
      await categoryApi.updateCategory(editingCategory.id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      });
      toast({ title: "Success", description: "Category updated successfully" });
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update category", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    try {
      await categoryApi.deleteCategory(deleteCategoryId);
      toast({ title: "Success", description: "Category deleted successfully" });
      setDeleteCategoryId(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete category", variant: "destructive" });
    }
  };

  // Candidate handlers
  const handleCreateCandidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const candidate = await adminApi.createCandidate({
        name: formData.get('name') as string,
        bio: formData.get('bio') as string,
        manifesto: formData.get('manifesto') as string,
        category: parseInt(formData.get('category') as string),
      });
      const imageFile = formData.get('image') as File;
      if (imageFile && imageFile.size > 0) {
        await adminApi.uploadCandidateImage(candidate.id, imageFile);
      }
      toast({ title: "Success", description: "Candidate created successfully" });
      setShowCandidateDialog(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create candidate", variant: "destructive" });
    }
  };

  const handleUpdateCandidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCandidate) return;
    const formData = new FormData(e.currentTarget);
    try {
      await adminApi.updateCandidate(editingCandidate.id, {
        name: formData.get('name') as string,
        bio: formData.get('bio') as string,
        manifesto: formData.get('manifesto') as string,
      });
      const imageFile = formData.get('image') as File;
      if (imageFile && imageFile.size > 0) {
        await adminApi.uploadCandidateImage(editingCandidate.id, imageFile);
      }
      toast({ title: "Success", description: "Candidate updated successfully" });
      setEditingCandidate(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update candidate", variant: "destructive" });
    }
  };

  const handleDeleteCandidate = async () => {
    if (!deleteCandidateId) return;
    try {
      await adminApi.deleteCandidate(deleteCandidateId);
      toast({ title: "Success", description: "Candidate deleted successfully" });
      setDeleteCandidateId(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete candidate", variant: "destructive" });
    }
  };

  const handleStartElection = async (id: number) => {
    try {
      await adminApi.startElection(id);
      toast({ title: "Success", description: "Election started" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to start election", variant: "destructive" });
    }
  };

  const handleEndElection = async (id: number) => {
    try {
      await adminApi.endElection(id);
      toast({ title: "Success", description: "Election ended" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to end election", variant: "destructive" });
    }
  };

  const handleReleaseResults = async (id: number) => {
    try {
      await adminApi.releaseResults(id);
      toast({ title: "Success", description: "Results released" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to release results", variant: "destructive" });
    }
  };

  const handleToggleStaff = async (userId: string, currentStaff: boolean) => {
    setIsUpdatingUser(userId);
    try {
      await authApi.updateUser(userId, { is_staff: !currentStaff });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_staff: !currentStaff } : u));
      toast({ title: "Success", description: `Staff access ${!currentStaff ? 'granted' : 'revoked'}` });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update user", variant: "destructive" });
    } finally {
      setIsUpdatingUser(null);
    }
  };

  // Results grouping
  const categoryMap = new Map<number, { name: string; results: VoteResult[] }>();
  results.forEach((r) => {
    if (!categoryMap.has(r.category)) {
      categoryMap.set(r.category, { name: r.category_name, results: [] });
    }
    categoryMap.get(r.category)!.results.push(r);
  });
  const resultsByCategory = Array.from(categoryMap.entries()).map(([categoryId, { name, results: catResults }]) => {
    const total = catResults.reduce((sum, c) => sum + c.votes, 0);
    const sorted = [...catResults].sort((a, b) => b.votes - a.votes);
    return { categoryId, categoryName: name, results: sorted, totalVotes: total, winner: sorted[0] };
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage elections, candidates, results, and users</p>
        </div>

        <Tabs defaultValue="elections" className="space-y-6" onValueChange={(v) => {
          if (v === 'users') fetchUsers();
        }}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="elections" className="gap-1"><ListChecks className="h-4 w-4" />Elections</TabsTrigger>
            <TabsTrigger value="categories" className="gap-1">Categories</TabsTrigger>
            <TabsTrigger value="candidates" className="gap-1"><Vote className="h-4 w-4" />Candidates</TabsTrigger>
            <TabsTrigger value="results" className="gap-1"><BarChart3 className="h-4 w-4" />Results</TabsTrigger>
            <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" />Users</TabsTrigger>
          </TabsList>

          {/* Elections Tab */}
          <TabsContent value="elections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Elections</h2>
              <Button onClick={() => setShowElectionDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Election</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {elections.map((election) => (
                <Card key={election.id}>
                  <CardHeader>
                    <CardTitle>{election.title}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={election.status === 'active' ? 'default' : election.status === 'ended' ? 'secondary' : 'outline'}>
                        {election.status}
                      </Badge>
                      {election.results_released && <Badge variant="default">Results Released</Badge>}
                    </div>
                    {(election.start_date || election.end_date) && (
                      <p className="text-xs text-muted-foreground">
                        {election.start_date && `Start: ${new Date(election.start_date).toLocaleDateString()}`}
                        {election.start_date && election.end_date && ' · '}
                        {election.end_date && `End: ${new Date(election.end_date).toLocaleDateString()}`}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {election.status === 'draft' && (
                        <Button size="sm" onClick={() => handleStartElection(election.id)}><Play className="h-3 w-3 mr-1" />Start</Button>
                      )}
                      {election.status === 'active' && (
                        <Button size="sm" variant="destructive" onClick={() => handleEndElection(election.id)}><StopCircle className="h-3 w-3 mr-1" />End</Button>
                      )}
                      {election.status === 'ended' && !election.results_released && (
                        <Button size="sm" variant="secondary" onClick={() => handleReleaseResults(election.id)}><Eye className="h-3 w-3 mr-1" />Release Results</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setEditingElection(election)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteElectionId(election.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Categories</h2>
              <Button onClick={() => setShowCategoryDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Category</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const election = elections.find(e => e.id === category.election);
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant="outline">{election?.title}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(category)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteCategoryId(category.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Candidates</h2>
              <Button onClick={() => setShowCandidateDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Candidate</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {candidates.map((candidate) => {
                const category = categories.find(c => c.id === candidate.category);
                return (
                  <Card key={candidate.id}>
                    <CardHeader>
                      <CardTitle>{candidate.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{candidate.bio}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {candidate.image && (
                        <img src={candidate.image} alt={candidate.name} className="w-full h-32 object-cover rounded" />
                      )}
                      <Badge variant="secondary">{category?.name}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingCandidate(candidate)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteCandidateId(candidate.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <h2 className="text-xl font-semibold">View Results</h2>
            <Select
              value={selectedResultElection?.toString() || ""}
              onValueChange={(v) => { setSelectedResultElection(Number(v)); fetchResults(Number(v)); }}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select an election" />
              </SelectTrigger>
              <SelectContent>
                {elections.map((e) => (
                  <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedResultElection && resultsByCategory.length > 0 && (
              <div className="space-y-6">
                {resultsByCategory.map(({ categoryId, categoryName, results: catResults, totalVotes, winner }) => (
                  <div key={categoryId} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">{categoryName}</h3>
                      </div>
                      <Badge variant="secondary">{totalVotes} votes</Badge>
                    </div>
                    <div className="space-y-3">
                      {catResults.map((c, i) => (
                        <div key={c.candidate} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                          <ResultBar
                            name={c.candidate_name}
                            party={c.category_name}
                            votes={c.votes}
                            totalVotes={totalVotes}
                            isWinner={c.candidate === winner?.candidate}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedResultElection && resultsByCategory.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No results for this election yet.</p>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl font-semibold">Manage Users</h2>
            <div className="rounded-xl border border-border bg-card shadow-soft">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.username || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={u.is_staff ? 'default' : 'outline'}>
                          {u.is_staff ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={u.is_staff ? 'destructive' : 'default'}
                          disabled={isUpdatingUser === u.id}
                          onClick={() => handleToggleStaff(u.id, u.is_staff)}
                        >
                          {isUpdatingUser === u.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : u.is_staff ? 'Revoke' : 'Grant'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Election Dialog */}
      <Dialog open={showElectionDialog} onOpenChange={setShowElectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Election</DialogTitle>
            <DialogDescription>Set up a new election</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateElection}>
            <div className="space-y-4">
              <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
              <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" /></div>
              <div><Label htmlFor="start_date">Start Date</Label><Input id="start_date" name="start_date" type="datetime-local" /></div>
              <div><Label htmlFor="end_date">End Date</Label><Input id="end_date" name="end_date" type="datetime-local" /></div>
              <div className="flex items-center gap-2">
                <Switch id="is_public" name="is_public" defaultChecked />
                <Label htmlFor="is_public">Public Election</Label>
              </div>
            </div>
            <DialogFooter className="mt-4"><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Election Dialog */}
      <Dialog open={!!editingElection} onOpenChange={() => setEditingElection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Election</DialogTitle>
            <DialogDescription>Update election details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateElection}>
            <div className="space-y-4">
              <div><Label htmlFor="edit-title">Title</Label><Input id="edit-title" name="title" defaultValue={editingElection?.title} required /></div>
              <div><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" name="description" defaultValue={editingElection?.description} /></div>
              <div><Label htmlFor="edit-start_date">Start Date</Label><Input id="edit-start_date" name="start_date" type="datetime-local" defaultValue={editingElection?.start_date?.slice(0, 16)} /></div>
              <div><Label htmlFor="edit-end_date">End Date</Label><Input id="edit-end_date" name="end_date" type="datetime-local" defaultValue={editingElection?.end_date?.slice(0, 16)} /></div>
            </div>
            <DialogFooter className="mt-4"><Button type="submit">Update</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Category</DialogTitle><DialogDescription>Add a category to an election</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateCategory}>
            <div className="space-y-4">
              <div><Label htmlFor="category-name">Name</Label><Input id="category-name" name="name" required /></div>
              <div><Label htmlFor="category-description">Description</Label><Textarea id="category-description" name="description" /></div>
              <div>
                <Label htmlFor="category-election">Election</Label>
                <Select name="election" required>
                  <SelectTrigger><SelectValue placeholder="Select election" /></SelectTrigger>
                  <SelectContent>
                    {elections.map((e) => (<SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4"><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Category</DialogTitle><DialogDescription>Update category details</DialogDescription></DialogHeader>
          <form onSubmit={handleUpdateCategory}>
            <div className="space-y-4">
              <div><Label htmlFor="edit-category-name">Name</Label><Input id="edit-category-name" name="name" defaultValue={editingCategory?.name} required /></div>
              <div><Label htmlFor="edit-category-description">Description</Label><Textarea id="edit-category-description" name="description" defaultValue={editingCategory?.description} /></div>
            </div>
            <DialogFooter className="mt-4"><Button type="submit">Update</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Candidate Dialog */}
      <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add New Candidate</DialogTitle><DialogDescription>Create a candidate profile</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateCandidate}>
            <div className="space-y-4">
              <div><Label htmlFor="candidate-name">Name</Label><Input id="candidate-name" name="name" required /></div>
              <div><Label htmlFor="candidate-bio">Bio</Label><Textarea id="candidate-bio" name="bio" required /></div>
              <div><Label htmlFor="candidate-manifesto">Manifesto</Label><Textarea id="candidate-manifesto" name="manifesto" /></div>
              <div>
                <Label htmlFor="candidate-category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="candidate-image">Image</Label><Input id="candidate-image" name="image" type="file" accept="image/*" /></div>
            </div>
            <DialogFooter className="mt-4"><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Candidate Dialog */}
      <Dialog open={!!editingCandidate} onOpenChange={() => setEditingCandidate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Candidate</DialogTitle><DialogDescription>Update candidate details</DialogDescription></DialogHeader>
          <form onSubmit={handleUpdateCandidate}>
            <div className="space-y-4">
              <div><Label htmlFor="edit-candidate-name">Name</Label><Input id="edit-candidate-name" name="name" defaultValue={editingCandidate?.name} required /></div>
              <div><Label htmlFor="edit-candidate-bio">Bio</Label><Textarea id="edit-candidate-bio" name="bio" defaultValue={editingCandidate?.bio} required /></div>
              <div><Label htmlFor="edit-candidate-manifesto">Manifesto</Label><Textarea id="edit-candidate-manifesto" name="manifesto" defaultValue={editingCandidate?.manifesto} /></div>
              <div><Label htmlFor="edit-candidate-image">Image (optional)</Label><Input id="edit-candidate-image" name="image" type="file" accept="image/*" /></div>
            </div>
            <DialogFooter className="mt-4"><Button type="submit">Update</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!deleteElectionId} onOpenChange={() => setDeleteElectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Election?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the election and all associated data.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteElection}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Category?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the category and all associated candidates.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCategory}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteCandidateId} onOpenChange={() => setDeleteCandidateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Candidate?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this candidate.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCandidate}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Admin;
