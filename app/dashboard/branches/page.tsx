"use client";

import { useState, useMemo, useRef } from "react";
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from "@/hooks/useBranches";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toggleBranchStatus } from "@/services/branchService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Edit2, Trash2, Plus, Search, QrCode, Printer, Download, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "@/types/branch";
import { Company } from "@/types/company";
import { QRCodeSVG } from "qrcode.react";
import { slugify } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";

interface BranchFormData extends UpdateBranchRequest {
  name: string;
  slug: string;
  company: string;
  address?: string;
  isActive?: boolean;
}

export default function BranchesPage() {
  const {
    data: branches,
    isLoading: branchesLoading,
    refetch: refetchBranches,
  } = useBranches();
  const { mutate: createBranch, isPending: isCreating } = useCreateBranch();
  const { mutate: updateBranch, isPending: isUpdating } = useUpdateBranch();
  const { mutate: deleteBranch, isPending: isDeleting } = useDeleteBranch();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor";
  const isAdmin = user?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompanyId, setFilterCompanyId] = useState<string>("all");
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [editCompanySearch, setEditCompanySearch] = useState("");

  // QR Code States
  const [activeQrBranch, setActiveQrBranch] = useState<Branch | null>(null);
  const [qrColor, setQrColor] = useState("#000000");
  const qrRef = useRef<HTMLDivElement>(null);

  // Helper to safely get the company slug
  const getCompanySlug = (branch: Branch | null) => {
    if (!branch) return "";
    const matchedCompany = companies?.find((c) => c._id === branch.company?._id);
    return matchedCompany?.slug || branch.company?.slug || "";
  };

  // Helper to safely get the company logo
  const getCompanyLogo = (branch: Branch | null) => {
    if (!branch) return "";
    const matchedCompany = companies?.find((c) => c._id === branch.company?._id);
    return matchedCompany?.logo || "";
  };

  // Generate Scan URL for QR code (points to the branch menu page of the company)
  const getQrUrl = (companySlug: string, branchId: string) => {
    const rawUrl =
      process.env.NEXT_PUBLIC_SCAN_BASE_URL ||
      "https://your-custom-domain.com/menus";
    
    let baseOrigin = "";
    if (rawUrl) {
      try {
        const urlObj = new URL(rawUrl);
        baseOrigin = urlObj.origin;
      } catch {
        baseOrigin = rawUrl.replace(/\/menus\/?$/, "").replace(/\/+$/, "");
      }
    }
    
    if (!baseOrigin && typeof window !== "undefined") {
      baseOrigin = window.location.origin;
    }
    
    if (!baseOrigin) {
      baseOrigin = "https://your-custom-domain.com";
    }

    return `${baseOrigin}/companies/${companySlug}/${branchId}`;
  };

  // Download SVG Helper
  const downloadSVG = () => {
    if (!qrRef.current || !activeQrBranch) return;
    const svgElement = qrRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `branch-${activeQrBranch.slug}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  // Download PNG Helper
  const downloadPNG = () => {
    if (!qrRef.current || !activeQrBranch) return;
    const svgElement = qrRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Set canvas dimensions
    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `branch-${activeQrBranch.slug}-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgString)));
  };

  // Print Helper
  const printQRCode = () => {
    if (!activeQrBranch) return;

    // Open a simple print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>طباعة رمز QR - فرع ${activeQrBranch.name}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .container {
              border: 2px border-dashed #ccc;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              color: #111827;
            }
            p {
              margin: 0 0 30px 0;
              color: #4b5563;
              font-size: 16px;
            }
            .qr-wrapper {
              margin-bottom: 20px;
            }
            .footer-text {
              margin-top: 20px;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>فرع: ${activeQrBranch.name}</h1>
            <p>شركة: ${activeQrBranch.company?.name}</p>
            <div class="qr-wrapper" id="qr-code-print"></div>
            <div class="footer-text">امسح الرمز ضوئياً لفتح قائمة طعام الفرع مباشرة</div>
          </div>
          <script>
            // Generate QR code dynamically in print window
            const qrWrapper = document.getElementById("qr-wrapper");
          </script>
        </body>
      </html>
    `);

    // Copy SVG markup to the print window
    const svgMarkup = qrRef.current?.innerHTML || "";
    printWindow.document.getElementById("qr-code-print")!.innerHTML = svgMarkup;

    // Make sure SVG scales well in print
    const svgElement = printWindow.document.querySelector("svg");
    if (svgElement) {
      svgElement.setAttribute("width", "300");
      svgElement.setAttribute("height", "300");
    }

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to render, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Form for editing
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BranchFormData>({
    defaultValues: {
      name: "",
      slug: "",
      company: "",
      address: "",
      isActive: true,
    },
  });

  // Form for creation
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: createErrors },
  } = useForm<CreateBranchRequest>({
    defaultValues: {
      name: "",
      slug: "",
      company: "",
      address: "",
      isActive: true,
    },
  });

  const filteredBranches = useMemo(() => {
    if (!branches || !Array.isArray(branches)) return [];
    return branches.filter((branch) => {
      const matchesCompany = filterCompanyId === "all" || branch.company?._id === filterCompanyId;
      const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCompany && matchesSearch;
    });
  }, [branches, searchTerm, filterCompanyId]);

  const filteredCompanies = useMemo(() => {
    if (!companies || !Array.isArray(companies)) return [];
    return companies.filter((company) =>
      company.name.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companies, companySearch]);

  const filteredEditCompanies = useMemo(() => {
    if (!companies || !Array.isArray(companies)) return [];
    return companies.filter((company) =>
      company.name.toLowerCase().includes(editCompanySearch.toLowerCase())
    );
  }, [companies, editCompanySearch]);

  const startEditing = (branch: Branch) => {
    setEditingBranchId(branch._id);
    reset({
      name: branch.name,
      slug: branch.slug,
      company: branch.company._id,
      address: branch.address || "",
      isActive: branch.isActive,
    });
    setEditCompanySearch(branch.company.name);
    setIsEditDialogOpen(true);
  };

  const cancelEditing = () => {
    setIsEditDialogOpen(false);
    setEditingBranchId(null);
    reset();
    setEditCompanySearch("");
  };

  const onSubmit = (data: BranchFormData, branchId: string) => {
    const updateData: UpdateBranchRequest = {
      name: data.name,
      slug: data.slug,
      company: data.company,
      address: data.address,
      isActive: data.isActive,
      userId: user?.id,
      userName: user?.username,
    };

    updateBranch(
      { id: branchId, data: updateData },
      {
        onSuccess: async () => {
          setIsEditDialogOpen(false);
          setEditingBranchId(null);
          reset();
          setEditCompanySearch("");
          await refetchBranches();
        },
      }
    );
  };

  const onCreateSubmit = (data: CreateBranchRequest) => {
    createBranch(data, {
      onSuccess: async () => {
        setIsCreateDialogOpen(false);
        resetCreate();
        setSelectedCompany("");
        setCompanySearch("");
        await refetchBranches();
      },
    });
  };

  const confirmDelete = (branchId: string) => {
    deleteBranch(branchId, {
      onSuccess: async () => {
        setDeletingBranchId(null);
        await refetchBranches();
      },
    });
  };

  const handleToggleBranchStatus = async (branchId: string) => {
    if (!user) return;
    try {
      await toggleBranchStatus(branchId, user.id, user.username);
      await refetchBranches();
    } catch (error) {
      console.error("Error toggling branch status:", error);
    }
  };

  if (branchesLoading || companiesLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Standard Header */}
      <PageHeader
        title="إدارة الفروع"
        description="عرض وتعديل فروع الشركات وتفعيلها أو تعطيلها في المنيو الخاص بها."
        action={
          isSupervisor && (
            <Button
              disabled={isCreating}
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-5 px-4"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة فرع جديد</span>
            </Button>
          )
        }
      />

      {/* Search Input Bar & Company Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100/70">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="ابحث عن فرع بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rounded-xl border-slate-200 bg-white focus-visible:ring-red-500"
            />
          </div>

          {/* Company filter Select */}
          <div className="w-full sm:w-[220px]">
            <Select
              value={filterCompanyId}
              onValueChange={(value) => setFilterCompanyId(value)}
            >
              <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white focus:ring-red-500">
                <SelectValue placeholder="تصفية حسب الشركة" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white border border-slate-200">
                <SelectItem value="all">كل الشركات (الكل)</SelectItem>
                {companies?.map((company) => (
                  <SelectItem key={company._id} value={company._id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset filters button */}
        {(searchTerm || filterCompanyId !== "all") && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchTerm("");
              setFilterCompanyId("all");
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100/50"
          >
            إعادة تعيين الفلاتر
          </Button>
        )}
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-200">
        <Table className="min-w-[850px]">
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-right">اسم الفرع</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">العنوان</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">الشركة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">حالة الفرع</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">رمز الـ QR</TableHead>
              {isSupervisor && (
                <TableHead className="font-bold text-slate-700 text-right">الإجراءات</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBranches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                  لا توجد فروع مسجلة حالياً.
                </TableCell>
              </TableRow>
            ) : (
              filteredBranches.map((branch) => (
                <TableRow key={branch._id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <TableCell className="font-semibold text-slate-800">{branch.name}</TableCell>
                  <TableCell className="text-slate-500">{branch.address || "—"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      {branch.company?.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <input
                          id={`toggleIsActive-${branch._id}`}
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          checked={branch.isActive}
                          onChange={() => handleToggleBranchStatus(branch._id)}
                        />
                        <Label htmlFor={`toggleIsActive-${branch._id}`} className="text-sm font-semibold text-slate-700 cursor-pointer">
                          {branch.isActive ? "نشط" : "معطل"}
                        </Label>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          branch.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {branch.isActive ? "نشط" : "معطل"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveQrBranch(branch)}
                      className="h-9 w-9 rounded-lg bg-red-50/50 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      title="عرض رمز QR للفرع"
                    >
                      <QrCode className="h-5 w-5" />
                    </Button>
                  </TableCell>
                  {isSupervisor && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(branch)}
                          className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          title="تعديل الفرع"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingBranchId(branch._id)}
                          className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="حذف الفرع"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Creation Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">إضافة فرع جديد</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              أدخل تفاصيل الفرع الجديد والشركة التابع لها.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createName" className="font-semibold text-slate-700">اسم الفرع</Label>
              <Input
                id="createName"
                {...registerCreate("name", {
                  required: "اسم الفرع مطلوب",
                  minLength: { value: 2, message: "2 أحرف على الأقل" },
                })}
                placeholder="أدخل اسم الفرع (مثال: فرع المعادي)"
                disabled={isCreating}
                onChange={(e) => {
                  registerCreate("name").onChange(e);
                  setValueCreate("slug", slugify(e.target.value), {
                    shouldValidate: true,
                  });
                }}
                className="rounded-xl border-slate-200"
              />
              {createErrors.name && (
                <p className="text-xs text-red-500">{createErrors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createCompany" className="font-semibold text-slate-700">الشركة</Label>
              <Command className="border rounded-xl bg-white">
                <CommandInput
                  placeholder="ابحث عن شركة..."
                  value={companySearch}
                  onValueChange={setCompanySearch}
                  disabled={isCreating}
                />
                <CommandList>
                  <CommandEmpty>لا توجد شركات مسجلة</CommandEmpty>
                  <CommandGroup>
                    {filteredCompanies.map((company: Company) => (
                      <CommandItem
                        key={company._id}
                        onSelect={() => {
                          setSelectedCompany(company._id);
                          setValueCreate("company", company._id);
                          setCompanySearch(company.name);
                        }}
                      >
                        {company.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              {createErrors.company && (
                <p className="text-xs text-red-500">اختيار الشركة مطلوب</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createAddress" className="font-semibold text-slate-700">العنوان</Label>
              <Input
                id="createAddress"
                {...registerCreate("address")}
                placeholder="مثال: شارع 9، المعادي، القاهرة"
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="createIsActive"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                {...registerCreate("isActive")}
                defaultChecked
                disabled={isCreating}
              />
              <Label htmlFor="createIsActive" className="text-sm font-medium text-slate-700">
                الفرع نشط ويعمل فور الإضافة
              </Label>
            </div>

            <DialogFooter className="flex gap-2 justify-start mt-6 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetCreate();
                  setSelectedCompany("");
                  setCompanySearch("");
                }}
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isCreating} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold">
                {isCreating ? "جاري الإضافة..." : "إضافة الفرع"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">تعديل الفرع</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              تعديل تفاصيل الفرع والشركة التابع لها.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit((data) => editingBranchId && onSubmit(data, editingBranchId))} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editName" className="font-semibold text-slate-700">اسم الفرع</Label>
              <Input
                id="editName"
                {...register("name", {
                  required: "اسم الفرع مطلوب",
                  minLength: { value: 2, message: "2 أحرف على الأقل" },
                })}
                placeholder="أدخل اسم الفرع"
                disabled={isUpdating}
                onChange={(e) => {
                  register("name").onChange(e);
                  setValue("slug", slugify(e.target.value), {
                    shouldValidate: true,
                  });
                }}
                className="rounded-xl border-slate-200"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editCompany" className="font-semibold text-slate-700">الشركة</Label>
              <Command className="border rounded-xl bg-white">
                <CommandInput
                  placeholder="ابحث عن شركة..."
                  value={editCompanySearch}
                  onValueChange={setEditCompanySearch}
                  disabled={isUpdating}
                />
                <CommandList>
                  <CommandEmpty>لا توجد شركات مسجلة</CommandEmpty>
                  <CommandGroup>
                    {filteredEditCompanies.map((company: Company) => (
                      <CommandItem
                        key={company._id}
                        onSelect={() => {
                          setValue("company", company._id);
                          setEditCompanySearch(company.name);
                        }}
                      >
                        {company.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              {errors.company && (
                <p className="text-xs text-red-500">اختيار الشركة مطلوب</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editAddress" className="font-semibold text-slate-700">العنوان</Label>
              <Input
                id="editAddress"
                {...register("address")}
                placeholder="مثال: شارع 9، المعادي، القاهرة"
                disabled={isUpdating}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="editIsActive"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                {...register("isActive")}
                disabled={isUpdating}
              />
              <Label htmlFor="editIsActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                الفرع نشط ويعمل
              </Label>
            </div>

            <DialogFooter className="flex gap-2 justify-start mt-6 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditing}
                disabled={isUpdating}
                className="rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isUpdating} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold">
                {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog Modal */}
      <Dialog
        open={!!activeQrBranch}
        onOpenChange={(open) => !open && setActiveQrBranch(null)}
      >
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-gray-900">
              رمز الاستجابة السريعة للفرع (QR Code)
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              امسح الرمز ضوئياً للوصول المباشر إلى منيو فرع{" "}
              <span className="font-semibold text-gray-800">
                {activeQrBranch?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {activeQrBranch && (
            <div className="my-6 flex flex-col items-center justify-center space-y-4">
              {/* QR Code Wrapper with hidden print styles */}
              <div
                ref={qrRef}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-center"
              >
                <QRCodeSVG
                  value={getQrUrl(getCompanySlug(activeQrBranch), activeQrBranch._id)}
                  size={200}
                  level="H"
                  fgColor={qrColor}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  imageSettings={
                    getCompanyLogo(activeQrBranch)
                      ? {
                          src: getCompanyLogo(activeQrBranch),
                          x: undefined,
                          y: undefined,
                          height: 40,
                          width: 40,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>

              {/* Color Customization Panel */}
              <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-right">
                <span className="text-xs font-extrabold text-slate-500 block">
                  تخصيص لون رمز الاستجابة السريعة (Branding):
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="h-8 w-14 rounded-lg cursor-pointer border border-slate-200"
                    title="اختر لون الـ QR"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {["#000000", "#dc2626", "#2563eb", "#16a34a", "#7c3aed", "#ea580c"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setQrColor(color)}
                        className="h-6 w-6 rounded-full border border-slate-200 transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic redirection link details */}
              <div className="w-full text-center space-y-1">
                <span className="text-xs font-semibold text-gray-400">
                  رابط التوجيه المشفر للفرع:
                </span>
                <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-mono bg-red-50/50 py-1.5 px-3 rounded-lg border border-red-50">
                  <span>{getQrUrl(getCompanySlug(activeQrBranch), activeQrBranch._id)}</span>
                  <a
                    href={getQrUrl(getCompanySlug(activeQrBranch), activeQrBranch._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-start w-full border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={printQRCode}
              className="flex items-center gap-2 rounded-xl border-gray-200"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة الرمز</span>
            </Button>
            <div className="flex flex-1 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={downloadSVG}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200"
              >
                <Download className="h-4 w-4" />
                <span>تحميل SVG</span>
              </Button>
              <Button
                type="button"
                onClick={downloadPNG}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="h-4 w-4" />
                <span>تحميل PNG</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingBranchId} onOpenChange={(open) => !open && setDeletingBranchId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-lg font-bold text-slate-900">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              هل أنت متأكد من حذف هذا الفرع؟ لن تتمكن من التراجع عن هذا الإجراء وسيتم فصل المنتجات المرتبطة به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-start mt-4">
            <AlertDialogCancel onClick={() => setDeletingBranchId(null)} className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => deletingBranchId && confirmDelete(deletingBranchId)}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
