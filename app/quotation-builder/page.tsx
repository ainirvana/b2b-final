"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QuotationLeadForm } from "@/components/quotation-lead-form"
import { QuotationOptions } from "@/components/quotation-options"
import { ComingSoon } from "@/components/coming-soon"
import { Plus } from "lucide-react"

interface LeadFormData {
  name: string
  leadDate?: string
  leadReferenceNo?: string
  remarks: string
  contactDetails?: string
}

type Step = "list" | "lead-form" | "options" | "coming-soon"

// Mock data for quotations
const mockQuotations = [
  { id: 1, name: "Sample Quotation 1", date: "2023-10-01", status: "Draft" },
  { id: 2, name: "Sample Quotation 2", date: "2023-10-02", status: "Sent" },
]

export default function QuotationBuilderPage() {
  const [currentStep, setCurrentStep] = useState<Step>("list")
  const [leadData, setLeadData] = useState<LeadFormData | null>(null)

  const handleCreateNew = () => {
    setCurrentStep("lead-form")
  }

  const handleLeadSubmit = (data: LeadFormData) => {
    setLeadData(data)
    setCurrentStep("options")
  }

  const handleOptionSelect = (option: string) => {
    console.log("Selected option:", option)
    setCurrentStep("coming-soon")
  }

  const renderContent = () => {
    switch (currentStep) {
      case "list":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Quotation Builder</h1>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Quotation
              </Button>
            </div>
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell>{quotation.id}</TableCell>
                      <TableCell>{quotation.name}</TableCell>
                      <TableCell>{quotation.date}</TableCell>
                      <TableCell>{quotation.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      case "lead-form":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Lead Information</h1>
            <QuotationLeadForm onSubmit={handleLeadSubmit} />
          </div>
        )
      case "options":
        return <QuotationOptions onOptionSelect={handleOptionSelect} />
      case "coming-soon":
        return <ComingSoon />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-brand-primary-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto animate-fade-in p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
