"use client";

import { useState, useMemo, useRef } from "react";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from "@/hooks/useCompanies";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import toast from "react-hot-toast";
import { Edit2, Trash2, Plus, Search, QrCode, Printer, Download, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import { Company } from "@/types/company";
import Image from "next/image";
import { slugify } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";
import { QRCodeSVG } from "qrcode.react";

interface CompanyFormData {
  name: string;
  slug: string;
  description: string;
  logo?: FileList;
}

interface CreateCompanyFormData {
  name: string;
  slug: string;
  description: string;
  logo?: FileList;
}

export default function CompanyDashboard() {
  const { data: companies, isLoading } = useCompanies();
  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();
  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor";
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // QR Code States
  const [activeQrCompany, setActiveQrCompany] = useState<Company | null>(null);
  const [qrColor, setQrColor] = useState("#000000");
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate Scan URL for Company QR code
  const getQrUrl = (companySlug: string) => {
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

    return `${baseOrigin}/companies/${companySlug}`;
  };

  // Download SVG Helper
  const downloadSVG = () => {
    if (!qrRef.current || !activeQrCompany) return;
    const svgElement = qrRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `company-${activeQrCompany.slug}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  // Download PNG Helper
  const downloadPNG = () => {
    if (!qrRef.current || !activeQrCompany) return;
    const svgElement = qrRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

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
        downloadLink.download = `company-${activeQrCompany.slug}-qr.png`;
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
    if (!activeQrCompany) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>طباعة رمز QR - شركة ${activeQrCompany.name}</title>
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
            <h1>شركة: ${activeQrCompany.name}</h1>
            <div class="qr-wrapper" id="qr-code-print"></div>
            <div class="footer-text">امسح الرمز ضوئياً لفتح صفحة الشركة وفروعها مباشرة</div>
          </div>
        </body>
      </html>
    `);

    const svgMarkup = qrRef.current?.innerHTML || "";
    printWindow.document.getElementById("qr-code-print")!.innerHTML = svgMarkup;

    const svgElement = printWindow.document.querySelector("svg");
    if (svgElement) {
      svgElement.setAttribute("width", "300");
      svgElement.setAttribute("height", "300");
    }

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormData>();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: createErrors },
  } = useForm<CreateCompanyFormData>({
    defaultValues: { name: "", slug: "", description: "" },
  });

  const filteredCompanies = useMemo<Company[]>(() => {
    if (!companies) return [] as Company[];
    return (companies as Company[]).filter((company: Company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const startEditing = (company: Company) => {
    setEditingCompanyId(company._id);
    setValue("name", company.name);
    setValue("slug", company.slug);
    setValue("description", company.description);
    setIsEditDialogOpen(true);
  };

  const cancelEditing = () => {
    setIsEditDialogOpen(false);
    setEditingCompanyId(null);
    reset();
  };

  const onSubmit = async (data: CompanyFormData, companyId: string) => {
    try {
      const logoFile = data.logo && data.logo[0] ? data.logo[0] : null;
      updateCompany(
        {
          id: companyId,
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            logoFile,
          },
        },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setEditingCompanyId(null);
            reset();
            toast.success("تم تحديث الشركة بنجاح");
          },
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "فشل تحديث الشركة";
      toast.error(errorMessage);
    }
  };

  const onCreateSubmit = async (data: CreateCompanyFormData) => {
    try {
      const logoFile = data.logo && data.logo[0] ? data.logo[0] : null;
      createCompany(
        {
          name: data.name,
          slug: data.slug,
          description: data.description,
          logoFile,
        },
        {
          onSuccess: () => {
            setIsCreateDialogOpen(false);
            resetCreate();
            toast.success("تم إنشاء الشركة بنجاح");
          },
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "فشل إنشاء الشركة";
      toast.error(errorMessage);
    }
  };

  const confirmDelete = (id: string) => {
    deleteCompany(id, {
      onSuccess: () => {
        toast.success("تم حذف الشركة بنجاح");
      },
      onSettled: () => setDeletingCompanyId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="إدارة الشركات"
        description="إدارة وإضافة الشركات والمنشآت وتعديل بياناتها وشعاراتها."
        action={
          isSupervisor && (
            <Button
              disabled={isCreating}
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-5 px-4"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة شركة جديدة</span>
            </Button>
          )
        }
      />

      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="ابحث عن شركة بالاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rounded-xl border-slate-200"
          />
        </div>
      </div>

      {/* Companies Data Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-200">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-right">شعار الشركة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">اسم الشركة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">الوصف</TableHead>
              {isSupervisor && (
                <TableHead className="font-bold text-slate-700 text-right">الإجراءات</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-slate-400">
                  لا توجد شركات مسجلة حالياً.
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company: Company) => {
                return (
                  <TableRow
                    key={company._id}
                    className="hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <TableCell>
                      {company.logo ? (
                        <Image
                          width={44}
                          height={44}
                          src={company.logo}
                          alt={company.name}
                          className="h-11 w-11 object-cover rounded-xl border border-slate-100 shadow-inner"
                        />
                      ) : (
                        <div className="h-11 w-11 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center text-xs font-semibold">
                          لا يوجد
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">{company.name}</TableCell>
                    <TableCell className="text-slate-500 max-w-[300px] truncate" title={company.description}>
                      {company.description}
                    </TableCell>
                    {isSupervisor && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setActiveQrCompany(company)}
                            className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            title="رمز الاستجابة السريعة (QR)"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(company)}
                            className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            title="تعديل الشركة"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingCompanyId(company._id)}
                            className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="حذف الشركة"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Creation Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">إضافة شركة جديدة</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              أدخل تفاصيل الشركة الجديدة والبيانات المطلوبة لرفع شعارها.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createName" className="font-semibold text-slate-700">اسم الشركة</Label>
              <Input
                id="createName"
                {...registerCreate("name", {
                  required: "اسم الشركة مطلوب",
                  minLength: { value: 2, message: "2 أحرف على الأقل" },
                })}
                placeholder="أدخل اسم الشركة (مثال: شركة سَلِس للمطاعم)"
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
              <Label htmlFor="createDescription" className="font-semibold text-slate-700">الوصف</Label>
              <Input
                id="createDescription"
                {...registerCreate("description", {
                  required: "الوصف مطلوب",
                  minLength: { value: 5, message: "5 أحرف على الأقل" },
                })}
                placeholder="وصف مختصر لنشاط الشركة"
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
              {createErrors.description && (
                <p className="text-xs text-red-500">{createErrors.description.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createLogo" className="font-semibold text-slate-700">شعار الشركة (اختياري)</Label>
              <Input
                id="createLogo"
                type="file"
                accept="image/*"
                {...registerCreate("logo")}
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
            </div>

            <DialogFooter className="flex gap-2 justify-start mt-6 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetCreate();
                }}
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isCreating} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold">
                {isCreating ? "جاري الإضافة..." : "إضافة الشركة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">تعديل الشركة</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              تعديل تفاصيل الشركة ورفع شعار جديد إذا لزم الأمر.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit((data) => editingCompanyId && onSubmit(data, editingCompanyId))} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editName" className="font-semibold text-slate-700">اسم الشركة</Label>
              <Input
                id="editName"
                {...register("name", {
                  required: "اسم الشركة مطلوب",
                  minLength: { value: 2, message: "2 أحرف على الأقل" },
                })}
                placeholder="أدخل اسم الشركة"
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
              <Label htmlFor="editDescription" className="font-semibold text-slate-700">الوصف</Label>
              <Input
                id="editDescription"
                {...register("description", {
                  required: "الوصف مطلوب",
                  minLength: { value: 5, message: "5 أحرف على الأقل" },
                })}
                placeholder="وصف مختصر لنشاط الشركة"
                disabled={isUpdating}
                className="rounded-xl border-slate-200"
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editLogo" className="font-semibold text-slate-700">شعار الشركة (اختياري)</Label>
              <Input
                id="editLogo"
                type="file"
                accept="image/*"
                {...register("logo")}
                disabled={isUpdating}
                className="rounded-xl border-slate-200"
              />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCompanyId} onOpenChange={(open) => !open && setDeletingCompanyId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-lg font-bold text-slate-900">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              هل أنت متأكد من حذف هذه الشركة؟ سيؤدي هذا إلى إلغاء ربط الفروع والمنيوهات المرتبطة بها نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-start mt-4">
            <AlertDialogCancel onClick={() => setDeletingCompanyId(null)} className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => deletingCompanyId && confirmDelete(deletingCompanyId)}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Dialog Modal */}
      <Dialog
        open={!!activeQrCompany}
        onOpenChange={(open) => !open && setActiveQrCompany(null)}
      >
        <DialogContent className="max-w-md rounded-2xl bg-white p-6" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-gray-900">
              رمز الاستجابة السريعة للشركة (QR Code)
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              امسح الرمز ضوئياً للوصول المباشر إلى صفحة شركة{" "}
              <span className="font-semibold text-gray-800">
                {activeQrCompany?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {activeQrCompany && (
            <div className="my-6 flex flex-col items-center justify-center space-y-4">
              {/* QR Code Wrapper */}
              <div
                ref={qrRef}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-center"
              >
                <QRCodeSVG
                  value={getQrUrl(activeQrCompany.slug)}
                  size={200}
                  level="H"
                  fgColor={qrColor}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  imageSettings={
                    activeQrCompany.logo
                      ? {
                          src: activeQrCompany.logo,
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
                  رابط التوجيه المباشر للشركة:
                </span>
                <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-mono bg-red-50/50 py-1.5 px-3 rounded-lg border border-red-50">
                  <span className="truncate max-w-[280px]">{getQrUrl(activeQrCompany.slug)}</span>
                  <a
                    href={getQrUrl(activeQrCompany.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-700 shrink-0"
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
    </div>
  );
}
