"use client";

import { useState, useMemo, useEffect } from "react";
import { useMenus } from "@/hooks/useMenus";
import { useCompany, useCompanies } from "@/hooks/useCompanies";
import { useBranchesByCompanySlug, useBranches } from "@/hooks/useBranches";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  updateProductBranches,
} from "@/services/productService";
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
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Edit2, Trash2, Check, X, Plus, Eye, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import { CreateProductRequest, Product } from "@/types/product";
import { Menu } from "@/types/menu";
import { Branch } from "@/types/branch";
import Image from "next/image";
import PageHeader from "@/components/dashboard/PageHeader";

interface ProductFormData {
  name: string;
  description: string;
  price?: number;
  menuId: string;
  availableBranches: string[];
  image?: FileList;
}

export default function ProductsManage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts();

  const { data: menus, isLoading: menusLoading } = useMenus();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: allBranches, isLoading: branchesLoading } = useBranches();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor";
  const isAdmin = user?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  
  // Filters state
  const [filterCompanyId, setFilterCompanyId] = useState("");
  const [filterMenuId, setFilterMenuId] = useState("");
  const [filterBranchId, setFilterBranchId] = useState("");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);

  // For editing product branches
  const [editingBranches, setEditingBranches] = useState<string[]>([]);
  const [editingMenuId, setEditingMenuId] = useState<string>("");
  const [isEditBranchesDialogOpen, setIsEditBranchesDialogOpen] = useState(false);
  const [currentEditingProduct, setCurrentEditingProduct] = useState<{
    _id: string;
    name: string;
    description: string;
    price?: number;
    menu: { _id: string; name: string };
    availableBranches: Array<{ _id: string; name: string }>;
  } | null>(null);

  // Get the selected menu data
  const selectedMenuData = useMemo(() => {
    if (!menus || !Array.isArray(menus)) return null;
    return menus.find((menu: Menu) => menu._id === selectedMenu);
  }, [menus, selectedMenu]);

  const selectedCompanyId = selectedMenuData?.company?._id;

  // Get company data
  const { data: companyData } = useCompany(selectedCompanyId || "");
  const companySlug = (companyData as { slug?: string })?.slug || "";

  // Get branches for the company using the slug
  const { data: branches, isFetching: branchesFetching } =
    useBranchesByCompanySlug(companySlug);

  // Get branches for editing product
  const editingMenuData = useMemo(() => {
    if (!menus || !Array.isArray(menus)) return null;
    return menus.find((menu: Menu) => menu._id === editingMenuId);
  }, [menus, editingMenuId]);

  const editingCompanyId = editingMenuData?.company?._id;
  const { data: editingCompanyData } = useCompany(editingCompanyId || "");
  const editingCompanySlug = (editingCompanyData as { slug?: string })?.slug || "";
  const { data: editingBranchesData, isFetching: editingBranchesFetching } =
    useBranchesByCompanySlug(editingCompanySlug);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      price: undefined,
      menuId: "",
      availableBranches: [],
    },
  });

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: createErrors },
  } = useForm<CreateProductRequest>({
    defaultValues: {
      name: "",
      description: "",
      price: undefined,
      menu: "",
      companySlug: "",
      availableBranches: [],
    },
  });

  // Build company → Set<menuId> map from the menus list (not from products)
  const menuIdsByCompany = useMemo(() => {
    const map = new Map<string, Set<string>>();
    if (!menus) return map;
    for (const m of menus) {
      const companyId = typeof m.company === "string"
        ? m.company
        : (m.company as { _id?: string })?._id?.toString?.() ?? "";
      if (!companyId) continue;
      if (!map.has(companyId)) map.set(companyId, new Set());
      map.get(companyId)!.add((m._id as string).toString());
    }
    return map;
  }, [menus]);

  const filteredProducts = useMemo(() => {
    const productsArray = Array.isArray(products) ? products : [];
    return productsArray.filter((product: Product) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Menu id from product (always a string from API)
      const productMenuId = (product.menu as { _id?: string })?._id?.toString?.() ?? String(product.menu ?? "");

      // Company filter — use menus map to find which company owns this menu
      let matchesCompany = true;
      if (filterCompanyId) {
        const companyMenuIds = menuIdsByCompany.get(filterCompanyId);
        matchesCompany = !!companyMenuIds?.has(productMenuId);
      }

      // Menu filter
      const matchesMenu = !filterMenuId || productMenuId === filterMenuId;

      // Branch filter
      const matchesBranch =
        !filterBranchId ||
        product.availableBranches?.some(
          (b) => ((b as { _id?: string })?._id?.toString?.() ?? String(b)) === filterBranchId
        );

      return matchesSearch && matchesCompany && matchesMenu && matchesBranch;
    });
  }, [products, searchTerm, filterCompanyId, filterMenuId, filterBranchId, menuIdsByCompany]);

  // Reset menu and branch filters if company changes and current selection is no longer valid
  useEffect(() => {
    if (filterCompanyId) {
      if (filterMenuId) {
        const menuObj = menus?.find((m) => m._id === filterMenuId);
        const menuCompanyId = typeof menuObj?.company === "string"
          ? menuObj.company
          : (menuObj?.company as { _id?: string })?._id?.toString?.() ?? "";
        if (menuCompanyId !== filterCompanyId) {
          setFilterMenuId("");
        }
      }
      if (filterBranchId) {
        const branchObj = allBranches?.find((b) => b._id === filterBranchId);
        const branchCompanyId = typeof branchObj?.company === "string"
          ? branchObj.company
          : (branchObj?.company as { _id?: string })?._id?.toString?.() ?? "";
        if (branchCompanyId !== filterCompanyId) {
          setFilterBranchId("");
        }
      }
    }
  }, [filterCompanyId, filterMenuId, filterBranchId, menus, allBranches]);

  const filteredMenus = useMemo(() => {
    if (!menus || !Array.isArray(menus)) return [];
    return menus.filter((menu: Menu) =>
      menu.name.toLowerCase().includes(menuSearch.toLowerCase())
    );
  }, [menus, menuSearch]);

  // Reset branches when menu changes
  useEffect(() => {
    if (selectedMenu) {
      setSelectedBranches([]);
      setValueCreate("availableBranches", []);
    }
  }, [selectedMenu, setValueCreate]);

  const startEditing = (product: {
    _id: string;
    name: string;
    description: string;
    price?: number;
    menu: { _id: string; name: string };
    availableBranches: Array<{ _id: string; name: string }>;
  }) => {
    setEditingProductId(product._id);
    setEditingMenuId(product.menu._id);
    setEditingBranches(
      product.availableBranches?.map(
        (branch: { _id: string; name: string }) => branch._id
      ) || []
    );

    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      menuId: product.menu._id,
      availableBranches: product.availableBranches.map((b) => b._id),
    });
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setEditingBranches([]);
    setEditingMenuId("");
    reset();
  };

  const onSubmit = (data: ProductFormData, productId: string) => {
    const imageFile = data.image && data.image[0] ? data.image[0] : null;
    updateProduct(
      {
        id: productId,
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          menu: data.menuId,
          availableBranches: editingBranches,
          userId: user?.id,
          userName: user?.username,
          imageFile,
        },
      },
      {
        onSuccess: async () => {
          setEditingProductId(null);
          setEditingBranches([]);
          setEditingMenuId("");
          reset();
          await refetchProducts();
          toast.success("تم تحديث المنتج بنجاح");
        },
        onError: (error: unknown) => {
          console.error("Error updating product:", error);
          toast.error("فشل في تحديث المنتج");
        },
      }
    );
  };

  const onCreateSubmit = (data: CreateProductRequest) => {
    if (!selectedMenuData || !companyData) return;

    createProduct(
      {
        name: data.name,
        description: data.description,
        price: data.price,
        menu: selectedMenu,
        companySlug: (companyData as { slug?: string }).slug ?? "",
        availableBranches: selectedBranches,
        userId: user?.id,
        userName: user?.username,
        imageFile: createImageFile,
      },
      {
        onSuccess: async (created) => {
          if (created && created._id && selectedMenu) {
            updateProduct(
              {
                id: created._id,
                data: { menu: selectedMenu },
              },
              {
                onSuccess: async () => {
                  setIsCreateDialogOpen(false);
                  resetCreate();
                  setSelectedMenu("");
                  setMenuSearch("");
                  setSelectedBranches([]);
                  setCreateImageFile(null);
                  await refetchProducts();
                  toast.success("تم إنشاء المنتج بنجاح");
                },
              }
            );
          } else {
            setIsCreateDialogOpen(false);
            resetCreate();
            setSelectedMenu("");
            setMenuSearch("");
            setSelectedBranches([]);
            setCreateImageFile(null);
            await refetchProducts();
            toast.success("تم إنشاء المنتج بنجاح");
          }
        },
        onError: (error: unknown) => {
          console.error("Error creating product:", error);
          toast.error("فشل في إنشاء المنتج");
        },
      }
    );
  };

  const confirmDelete = async (productId: string) => {
    deleteProduct(productId, {
      onSuccess: async () => {
        setDeletingProductId(null);
        await refetchProducts();
        toast.success("تم حذف المنتج بنجاح");
      },
      onError: (error: unknown) => {
        console.error("Error deleting product:", error);
        toast.error("فشل في حذف المنتج");
      },
    });
  };

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    if (checked) {
      setSelectedBranches((prev) => [...prev, branchId]);
    } else {
      setSelectedBranches((prev) => prev.filter((id) => id !== branchId));
    }
  };

  const handleEditingBranchToggle = (branchId: string, checked: boolean) => {
    if (checked) {
      setEditingBranches((prev) => [...prev, branchId]);
    } else {
      setEditingBranches((prev) => prev.filter((id) => id !== branchId));
    }
  };

  const openEditBranchesDialog = (product: {
    _id: string;
    name: string;
    description: string;
    price?: number;
    menu: { _id: string; name: string };
    availableBranches: Array<{ _id: string; name: string }>;
  }) => {
    setCurrentEditingProduct(product);
    setEditingMenuId(product.menu._id);
    const currentBranches =
      product.availableBranches?.map(
        (branch: { _id: string; name: string }) => branch._id
      ) || [];

    setEditingBranches(currentBranches);
    setIsEditBranchesDialogOpen(true);
  };

  const saveBranchesChanges = async () => {
    if (!currentEditingProduct || !user) return;

    try {
      await updateProductBranches(
        currentEditingProduct._id,
        editingBranches,
        user.id,
        user.username
      );

      setIsEditBranchesDialogOpen(false);
      setCurrentEditingProduct(null);
      setEditingBranches([]);
      setEditingMenuId("");
      await refetchProducts();
      toast.success("تم تحديث الفروع بنجاح");
    } catch (error) {
      console.error("Error updating branches:", error);
      toast.error("فشل في تحديث الفروع");
    }
  };

  // Update form value when selectedBranches changes
  useEffect(() => {
    setValueCreate("availableBranches", selectedBranches);
  }, [selectedBranches, setValueCreate]);

  // Update form value when editingBranches changes
  useEffect(() => {
    setValue("availableBranches", editingBranches);
  }, [editingBranches, setValue]);

  if (!mounted || productsLoading || menusLoading || companiesLoading || branchesLoading) {
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
        title="إدارة المنتجات"
        description="عرض وتعديل المنتجات وأسعارها وربطها بالمنيوهات وتحديد مدى توفرها في الفروع المختلفة."
        action={
          isSupervisor && (
            <Button
              disabled={isCreating}
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-5 px-4"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة منتج جديد</span>
            </Button>
          )
        }
      />

      {/* Top action bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="ابحث عن منتج بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rounded-xl border-slate-200 bg-white"
            />
          </div>

          {/* Company Filter */}
          <select
            value={filterCompanyId}
            onChange={(e) => setFilterCompanyId(e.target.value)}
            className="rounded-xl border border-slate-200 text-slate-700 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-sm min-w-[160px] cursor-pointer"
          >
            <option value="">كل الشركات</option>
            {companies?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Menu Filter */}
          <select
            value={filterMenuId}
            onChange={(e) => setFilterMenuId(e.target.value)}
            className="rounded-xl border border-slate-200 text-slate-700 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-sm min-w-[160px] cursor-pointer"
          >
            <option value="">كل القوائم (المنيو)</option>
            {(filterCompanyId
              ? menus?.filter((m) => m.company?._id === filterCompanyId)
              : menus
            )?.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Branch Filter */}
          <select
            value={filterBranchId}
            onChange={(e) => setFilterBranchId(e.target.value)}
            className="rounded-xl border border-slate-200 text-slate-700 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-sm min-w-[160px] cursor-pointer"
          >
            <option value="">كل الفروع</option>
            {(filterCompanyId
              ? allBranches?.filter((b) => b.company?._id === filterCompanyId)
              : allBranches
            )?.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Reset Filters Button */}
          {(filterCompanyId || filterMenuId || filterBranchId || searchTerm) && (
            <Button
              variant="ghost"
              onClick={() => {
                setFilterCompanyId("");
                setFilterMenuId("");
                setFilterBranchId("");
                setSearchTerm("");
              }}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
            >
              إعادة تعيين الفلاتر
            </Button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-200">
        <Table className="min-w-[950px]">
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-right">الصورة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">اسم المنتج</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">الوصف</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">السعر</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">المنيو</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">الفروع المتاحة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                  لا توجد منتجات مسجلة حالياً.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product: Product) => {
                const isEditing = editingProductId === product._id;
                return (
                  <TableRow
                    key={product._id}
                    className={
                      isEditing
                        ? "bg-red-50/20 hover:bg-red-50/30 border-y-2 border-red-100/50 transition-colors duration-150"
                        : "hover:bg-slate-50/50 transition-colors duration-150"
                    }
                  >
                    {isEditing ? (
                      // Inline Editing Row
                      <>
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-3">
                            {product.image?.url ? (
                              <Image
                                width={44}
                                height={44}
                                src={product.image.url}
                                alt={product.name}
                                className="h-11 w-11 object-cover rounded-xl border border-slate-200 shadow-inner shrink-0"
                              />
                            ) : (
                              <div className="h-11 w-11 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0">
                                لا يوجد
                              </div>
                            )}
                            <div className="flex flex-col gap-1 min-w-[120px]">
                              <Input
                                type="file"
                                accept="image/*"
                                {...register("image")}
                                className="h-9 text-xs rounded-xl border-slate-200 bg-white"
                              />
                              <span className="text-[10px] text-slate-400 font-medium">تغيير الصورة (اختياري)</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-middle">
                          <Input
                            {...register("name", {
                              required: "اسم المنتج مطلوب",
                              minLength: { value: 2, message: "2 أحرف على الأقل" },
                            })}
                            className="rounded-xl border-slate-200 bg-white focus-visible:ring-red-500 focus-visible:border-red-500 min-w-[120px]"
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                          )}
                        </TableCell>
                        <TableCell className="align-middle">
                          <textarea
                            {...register("description", {
                              required: "الوصف مطلوب",
                              minLength: { value: 5, message: "5 أحرف على الأقل" },
                            })}
                            className="min-h-[70px] w-full rounded-xl border border-slate-200 bg-white p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 min-w-[180px]"
                          />
                          {errors.description && (
                            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                          )}
                        </TableCell>
                        <TableCell className="align-middle">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...register("price", {
                              min: { value: 0, message: "السعر يجب أن يكون أكبر من 0" },
                            })}
                            className="rounded-xl border-slate-200 bg-white focus-visible:ring-red-500 focus-visible:border-red-500 max-w-[80px]"
                          />
                          {errors.price && (
                            <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
                          )}
                        </TableCell>
                        <TableCell className="align-middle text-slate-700 font-medium">
                          {product.menu?.name || "غير محدد"}
                        </TableCell>
                        <TableCell className="align-middle text-slate-500 font-semibold">
                          {editingBranches.length} فروع
                        </TableCell>
                        <TableCell className="align-middle">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isUpdating}
                              onClick={handleSubmit((data) => onSubmit(data, product._id))}
                              className="h-9 w-9 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 shadow-sm border border-green-100"
                              title="حفظ"
                            >
                              <Check className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isUpdating}
                              onClick={cancelEditing}
                              className="h-9 w-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-sm border border-red-100"
                              title="إلغاء"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                    // Read-only Row
                    <>
                      <TableCell>
                        {product.image?.url ? (
                          <Image
                            width={44}
                            height={44}
                            src={product.image.url}
                            alt={product.name}
                            className="h-11 w-11 object-cover rounded-xl border border-slate-100 shadow-inner"
                          />
                        ) : (
                          <div className="h-11 w-11 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center text-xs font-semibold">
                            لا يوجد
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">{product.name}</TableCell>
                      <TableCell className="text-slate-500 max-w-[200px] truncate" title={product.description}>
                        {product.description}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        {product.price ? `${product.price} ج.م` : "—"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          {product.menu?.name || "غير محدد"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          onClick={() => (isSupervisor || isAdmin) && openEditBranchesDialog(product)}
                          className="h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs px-2.5 border border-slate-200"
                        >
                          {product.availableBranches?.length || 0} فرع
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/product/${product._id}`, "_blank")}
                            className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="عرض صفحة المنتج"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isSupervisor && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(product)}
                                className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                title="تعديل المنتج"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingProductId(product._id)}
                                className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                                title="حذف المنتج"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ); })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Product Creation Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl bg-white p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">إضافة منتج جديد</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              أدخل تفاصيل وجبة أو منتج جديد واربطه بالقائمة والفروع المحددة.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createName" className="font-semibold text-slate-700">اسم المنتج</Label>
              <Input
                id="createName"
                {...registerCreate("name", {
                  required: "اسم المنتج مطلوب",
                  minLength: { value: 2, message: "2 أحرف على الأقل" },
                })}
                placeholder="أدخل اسم المنتج (مثال: بيتزا مارجريتا)"
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
              {createErrors.name && (
                <p className="text-xs text-red-500">{createErrors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createDescription" className="font-semibold text-slate-700">الوصف</Label>
              <textarea
                id="createDescription"
                {...registerCreate("description", {
                  required: "الوصف مطلوب",
                  minLength: { value: 5, message: "5 أحرف على الأقل" },
                })}
                placeholder="أدخل مكونات أو تفاصيل الطبق..."
                disabled={isCreating}
                className="min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none"
              />
              {createErrors.description && (
                <p className="text-xs text-red-500">{createErrors.description.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createPrice" className="font-semibold text-slate-700">السعر (اختياري)</Label>
              <Input
                id="createPrice"
                type="number"
                min="0"
                step="0.01"
                {...registerCreate("price", {
                  min: { value: 0, message: "السعر يجب أن يكون 0 أو أكثر" },
                })}
                placeholder="مثال: 150"
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createMenu" className="font-semibold text-slate-700">المنيو</Label>
              <Command className="border rounded-xl bg-white">
                <CommandInput
                  placeholder="ابحث عن منيو لربطه..."
                  value={menuSearch}
                  onValueChange={setMenuSearch}
                  disabled={isCreating}
                />
                <CommandList>
                  <CommandEmpty>لا توجد قوائم طعام</CommandEmpty>
                  <CommandGroup>
                    {filteredMenus.map((menu: Menu) => (
                      <CommandItem
                        key={menu._id}
                        onSelect={() => {
                          setSelectedMenu(menu._id);
                          setValueCreate("menu", menu._id);
                          setMenuSearch(`${menu.name} - ${menu.company.name}`);
                        }}
                      >
                        {menu.name} - {menu.company.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              {createErrors.menu && (
                <p className="text-xs text-red-500">اختيار المنيو مطلوب</p>
              )}
            </div>

            {menuSearch && selectedMenu && (
              <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-slate-700">الفروع المتاحة</Label>
                  {!branchesFetching && Array.isArray(branches) && branches.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allIds = (branches as Branch[]).map((b) => b._id);
                          setSelectedBranches(allIds);
                          setValueCreate("availableBranches", allIds);
                        }}
                        disabled={isCreating}
                        className="h-7 text-xs rounded-lg"
                      >
                        اختر الكل
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBranches([]);
                          setValueCreate("availableBranches", []);
                        }}
                        disabled={isCreating}
                        className="h-7 text-xs rounded-lg"
                      >
                        إلغاء الكل
                      </Button>
                    </div>
                  )}
                </div>

                {branchesFetching ? (
                  <p className="text-xs text-slate-400">جاري تحميل الفروع...</p>
                ) : Array.isArray(branches) && branches.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-white">
                    {branches.map((branch: Branch) => (
                      <div key={branch._id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={branch._id}
                          checked={selectedBranches.includes(branch._id)}
                          onCheckedChange={(checked) =>
                            handleBranchToggle(branch._id, checked as boolean)
                          }
                          disabled={isCreating}
                        />
                        <Label htmlFor={branch._id} className="text-sm font-normal text-slate-700 cursor-pointer">
                          {branch.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">لا توجد فروع مسجلة لهذه الشركة.</div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createImage" className="font-semibold text-slate-700">صورة المنتج</Label>
              <Input
                id="createImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setCreateImageFile(file);
                }}
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
                  setSelectedMenu("");
                  setMenuSearch("");
                  setSelectedBranches([]);
                  setCreateImageFile(null);
                }}
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !selectedMenu}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isCreating ? "جاري الإضافة..." : "إضافة المنتج"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Branches Modal */}
      <Dialog open={isEditBranchesDialogOpen} onOpenChange={setIsEditBranchesDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 max-h-[80vh] overflow-y-auto">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">تعديل الفروع المتاحة</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              اختر الفروع التي ترغب في عرض المنتج بها في المنيو.
            </DialogDescription>
          </DialogHeader>

          {editingBranchesFetching ? (
            <div className="py-4 text-sm text-slate-400">جاري التحميل...</div>
          ) : editingBranchesData && Array.isArray(editingBranchesData) && editingBranchesData.length > 0 ? (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-slate-700">قائمة الفروع</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allIds = editingBranchesData.map((b: Branch) => b._id);
                      setEditingBranches(allIds);
                    }}
                    className="h-7 text-xs rounded-lg"
                  >
                    اختر الكل
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBranches([])}
                    className="h-7 text-xs rounded-lg"
                  >
                    إلغاء الكل
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-white">
                {editingBranchesData.map((branch: Branch) => (
                  <div key={branch._id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`edit-${branch._id}`}
                      checked={editingBranches.includes(branch._id)}
                      onCheckedChange={(checked) =>
                        handleEditingBranchToggle(branch._id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`edit-${branch._id}`} className="text-sm font-normal text-slate-700 cursor-pointer">
                      {branch.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-sm">لا توجد فروع مسجلة لهذه الشركة.</div>
          )}

          <DialogFooter className="flex gap-2 justify-start mt-6 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditBranchesDialogOpen(false);
                setCurrentEditingProduct(null);
                setEditingBranches([]);
                setEditingMenuId("");
              }}
              className="rounded-xl border-slate-200"
            >
              إلغاء
            </Button>
            <Button onClick={saveBranchesChanges} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProductId} onOpenChange={(open) => !open && setDeletingProductId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-lg font-bold text-slate-900">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              هل أنت متأكد من حذف هذا المنتج نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-start mt-4">
            <AlertDialogCancel onClick={() => setDeletingProductId(null)} className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => deletingProductId && confirmDelete(deletingProductId)}
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
