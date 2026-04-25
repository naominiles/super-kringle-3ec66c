"use client"

import { X, MapPin, Calendar, Tag, Scale, BookOpen, ImageIcon, AlertTriangle } from "lucide-react"
import { type CaseRecord, getIncidentColor } from "@/lib/data"

interface CaseDetailProps {
  caseData: CaseRecord
  onClose: () => void
  onFlagError?: (churchName: string) => void
}

export function CaseDetail({ caseData, onClose, onFlagError }: CaseDetailProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-background/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Case details for ${caseData.churchName}`}
    >
      <div
        className="h-full w-full max-w-lg overflow-y-auto border-l border-border bg-background p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              {caseData.churchName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close case detail"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-1">
          <span
            className={`inline-block rounded-sm px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${getIncidentColor(
              caseData.incidentType
            )}`}
          >
            {caseData.incidentType}
          </span>
        </div>

        <div className="mt-6 h-px w-full bg-border" aria-hidden="true" />

        {/* Details */}
        <div className="mt-6 flex flex-col gap-5">
          <DetailRow icon={MapPin} label="Location">
            {caseData.city}, {caseData.state}
          </DetailRow>

          <DetailRow icon={Calendar} label="Date">
            {caseData.date || "Unknown"}
            {caseData.dateNotes && (
              <span className="block text-xs text-muted-foreground mt-0.5">
                {caseData.dateNotes}
              </span>
            )}
          </DetailRow>

          <DetailRow icon={Tag} label="Incident Type">
            <span className="capitalize">{caseData.incidentType}</span>
          </DetailRow>

          <div className="h-px w-full bg-border" aria-hidden="true" />

          {caseData.description && (
            <DetailRow icon={BookOpen} label="Description">
              <p className="leading-relaxed">{caseData.description}</p>
            </DetailRow>
          )}

          {caseData.outcome && (
            <DetailRow icon={Scale} label="Legal Outcome">
              <p className="leading-relaxed">{caseData.outcome}</p>
            </DetailRow>
          )}

          <div className="h-px w-full bg-border" aria-hidden="true" />

          {/* Photos */}
          {caseData.photos && caseData.photos.length > 0 ? (
            <div className="flex flex-col gap-2">
              {caseData.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo.url}
                  alt={photo.filename || `Photo of ${caseData.churchName}`}
                  className="w-full border border-border object-cover"
                  crossOrigin="anonymous"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-border bg-card py-10">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">
                No photos available
              </p>
            </div>
          )}

          {caseData.sources && (
            <DetailRow icon={BookOpen} label="Sources">
              <p className="leading-relaxed text-muted-foreground">
                {caseData.sources}
              </p>
            </DetailRow>
          )}

          <button
            onClick={() => onFlagError?.(caseData.churchName)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Flag an error in this record
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-foreground">{children}</div>
      </div>
    </div>
  )
}
