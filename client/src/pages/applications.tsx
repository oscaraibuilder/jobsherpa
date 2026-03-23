import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Briefcase,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import type { Application } from "@shared/schema";

const applicationFormSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  status: z.string().default("applied"),
  notes: z.string().optional(),
  nextStep: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

const statusOptions = [
  { value: "applied", label: "Applied", icon: Clock, color: "text-muted-foreground" },
  { value: "reviewing", label: "Reviewing", icon: MessageSquare, color: "text-chart-4" },
  { value: "interviewing", label: "Interviewing", icon: Calendar, color: "text-chart-2" },
  { value: "offer", label: "Offer", icon: CheckCircle, color: "text-chart-3" },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "text-destructive" },
];

export default function Applications() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      company: "",
      position: "",
      status: "applied",
      notes: "",
      nextStep: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ApplicationFormValues) => {
      return apiRequest("POST", "/api/applications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Application logged",
        description: "Your application has been added to the tracker.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ApplicationFormValues> }) => {
      return apiRequest("PATCH", `/api/applications/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsDialogOpen(false);
      setEditingApplication(null);
      form.reset();
      toast({
        title: "Application updated",
        description: "Your application has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application deleted",
        description: "The application has been removed from your tracker.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationFormValues) => {
    if (editingApplication) {
      updateMutation.mutate({ id: editingApplication.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (application: Application) => {
    setEditingApplication(application);
    form.reset({
      company: application.company,
      position: application.position,
      status: application.status || "applied",
      notes: application.notes || "",
      nextStep: application.nextStep || "",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingApplication(null);
    form.reset({
      company: "",
      position: "",
      status: "applied",
      notes: "",
      nextStep: "",
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig = statusOptions.find((s) => s.value === status) || statusOptions[0];
    const Icon = statusConfig.icon;

    return (
      <Badge
        variant={status === "offer" ? "default" : status === "rejected" ? "destructive" : "secondary"}
        className="gap-1"
      >
        <Icon className={`h-3 w-3 ${statusConfig.color}`} />
        {statusConfig.label}
      </Badge>
    );
  };

  const filteredApplications = applications?.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

  const stats = [
    {
      label: "Total",
      value: applications?.length || 0,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Applied",
      value: applications?.filter((a) => a.status === "applied").length || 0,
      color: "bg-muted text-muted-foreground",
    },
    {
      label: "Interviewing",
      value: applications?.filter((a) => a.status === "interviewing").length || 0,
      color: "bg-chart-2/10 text-chart-2",
    },
    {
      label: "Offers",
      value: applications?.filter((a) => a.status === "offer").length || 0,
      color: "bg-chart-3/10 text-chart-3",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Tracker</h1>
          <p className="text-muted-foreground">
            Track and manage all your job applications in one place.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog} data-testid="button-add-application">
              <Plus className="h-4 w-4" />
              Log Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingApplication ? "Edit Application" : "Log New Application"}
              </DialogTitle>
              <DialogDescription>
                {editingApplication
                  ? "Update the details of your application."
                  : "Add a new job application to your tracker."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Acme Corp"
                          {...field}
                          data-testid="input-company"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Senior Software Engineer"
                          {...field}
                          data-testid="input-position"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextStep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Step</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Technical interview on Monday"
                          {...field}
                          data-testid="input-next-step"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes..."
                          className="resize-none"
                          {...field}
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingApplication
                      ? "Update"
                      : "Add Application"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>
              {filteredApplications?.length || 0} applications
              {statusFilter !== "all" && ` (${statusFilter})`}
            </CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredApplications && filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Next Step</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id} data-testid={`row-application-${application.id}`}>
                      <TableCell className="font-medium">{application.company}</TableCell>
                      <TableCell>{application.position}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {application.appliedDate
                          ? new Date(application.appliedDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-muted-foreground">
                        {application.nextStep || "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-actions-${application.id}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(application)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(application.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">No applications yet</h3>
              <p className="mt-2 text-muted-foreground">
                Start tracking your job applications to stay organized.
              </p>
              <Button className="mt-6 gap-2" onClick={openCreateDialog} data-testid="button-first-application">
                <Plus className="h-4 w-4" />
                Log Your First Application
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
