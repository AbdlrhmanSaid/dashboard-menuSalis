"use client";

import { Company } from "@/types/company";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Edit2, Trash2, ChevronDown, ChevronUp, Building } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { stripEmojis } from "@/lib/utils";

interface CompanyCardProps {
  company: Company;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  showActions?: boolean;
}

export default function CompanyCard({
  company,
  onEdit,
  onDelete,
  showActions = false,
}: CompanyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const maxDescriptionLength = 90;

  const cleanedName = stripEmojis(company.name);
  const cleanedDescription = stripEmojis(company.description || "");

  const truncatedDescription =
    cleanedDescription && cleanedDescription.length > maxDescriptionLength && !isExpanded
      ? `${cleanedDescription.slice(0, maxDescriptionLength)}...`
      : cleanedDescription || "لا يوجد وصف لهذه الشركة.";

  const handleCardClick = () => {
    if (!showActions) {
      router.push(`/companies/${company.slug}`);
    }
  };

  const logoUrl = typeof company.logo === 'string' ? company.logo : (company.logo?.url || '');

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Card
        className="w-full h-full cursor-pointer border border-slate-100/70 bg-white/80 hover:bg-white backdrop-blur-sm hover:border-red-100/80 shadow-[0_12px_40px_rgba(0,0,0,0.015)] hover:shadow-[0_24px_50px_rgba(239,68,68,0.04)] transition-all duration-300 rounded-[28px] overflow-hidden flex flex-col justify-between p-6 gap-5"
        onClick={handleCardClick}
        role={showActions ? undefined : "link"}
        aria-label={showActions ? undefined : `عرض تفاصيل ${cleanedName}`}
      >
        <div className="flex items-start gap-4.5">
          {/* Logo container (right-aligned in RTL) */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50/50 border border-slate-100/60 shadow-inner overflow-hidden shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`شعار ${cleanedName}`}
                width={56}
                height={56}
                className="h-full w-full object-cover"
                priority={false}
              />
            ) : (
              <Building className="h-6 w-6 text-slate-400" />
            )}
          </div>

          {/* Company details */}
          <div className="space-y-1 w-full text-right min-w-0">
            <CardTitle className="text-base font-bold text-slate-800 hover:text-red-600 transition-colors">
              {cleanedName}
            </CardTitle>
            
            <CardDescription className="text-xs text-slate-500 leading-relaxed font-medium text-right">
              {truncatedDescription}
              {company.description && company.description.length > maxDescriptionLength && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-red-600 hover:text-red-700 font-bold block mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  aria-label={isExpanded ? "إخفاء الوصف" : "عرض المزيد من الوصف"}
                >
                  {isExpanded ? (
                    <span className="flex items-center gap-0.5 justify-start">
                      إخفاء <ChevronUp className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 justify-start">
                      عرض المزيد <ChevronDown className="h-3 w-3" />
                    </span>
                  )}
                </Button>
              )}
            </CardDescription>
          </div>
        </div>

        {showActions && onEdit && onDelete && (
          <div className="flex gap-2 border-t border-slate-100 pt-3 justify-end shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
              }}
              className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              aria-label={`تعديل ${company.name}`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(company);
              }}
              className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label={`حذف ${company.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
