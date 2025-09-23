"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { saveQuotationVersion } from "@/hooks/use-save-quotation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"
import { QuotationPricingControls } from "@/components/quotation-pricing-controls"
import { QuotationClientEditor, ClientInfo } from "@/components/quotation-client-editor"
import { QuotationSettings, QuotationSettingsData } from "@/components/quotation-settings"
import { useQuotations, QuotationData } from "@/hooks/use-quotations"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Send, Printer, Download, Eye, EyeOff, Calculator, Percent, DollarSign, Lock } from "lucide-react"
import { recalculateQuotationTotals } from "@/lib/pricing-utils"
import { convertCurrency, convertQuotationPrices, formatCurrencyWithSymbol } from "@/lib/currency-utils"
import { CurrencyConversion } from "@/components/currency-conversion"
import { VersionControl } from "@/components/version-control"

// Define interfaces for type safety
interface DayEvent {
  id: string
  time?: string
  category: string
  title: string
  description: string
  location?: string
  price?: number
  nights?: number
  [key: string]: any
}

interface Day {
  day: number
  title: string
  description?: string
  events: DayEvent[]
  [key: string]: any
}

// This is now a pure client component that receives the id directly
export function QuotationDetail({ id }: { id: string }) {
  const [quotation, setQuotation] = useState<QuotationData | null>(null)
  const [activeTab, setActiveTab] = useState("preview")
  const [showPrices, setShowPrices] = useState(true)
  const [displayCurrency, setDisplayCurrency] = useState<string>("")
  const [versionLocked, setVersionLocked] = useState<boolean>(false)
  
  const router = useRouter()
  const { fetchQuotation, updateQuotation, isLoading } = useQuotations()
  const { toast } = useToast()

  // Calculate total prices
  const recalculateTotals = (quotationData: QuotationData) => {
    // Calculate original total price from all events
    let originalTotal = 0;
    if (quotationData.days && quotationData.days.length > 0) {
      quotationData.days.forEach((day: Day) => {
        day.events.forEach((event: DayEvent) => {
          if (event.price) {
            originalTotal += parseFloat(event.price.toString());
          }
        });
      });
    }
    
    // Create a quotation object with the calculated subtotal
    const quotationWithSubtotal = {
      ...quotationData,
      subtotal: originalTotal,
      pricingOptions: {
        ...quotationData.pricingOptions,
        originalTotalPrice: originalTotal
      }
    };
    
    // Use the shared utility to calculate all totals
    return recalculateQuotationTotals(quotationWithSubtotal);
  };

  // Fetch quotation data
  useEffect(() => {
    const loadQuotation = async () => {
      if (!id) return
      const data = await fetchQuotation(id)
      if (data) {
        // Calculate totals when loading the quotation
        const updatedData = recalculateTotals(data);
        setQuotation(updatedData)
        setShowPrices(updatedData.pricingOptions.showIndividualPrices)
        
        // Set initial display currency to the quotation's base currency
        setDisplayCurrency(updatedData.currency || "USD")
        
        // Check if the latest version is locked
        if (updatedData.versionHistory && updatedData.versionHistory.length > 0) {
          const latestVersion = updatedData.versionHistory[updatedData.versionHistory.length - 1]
          setVersionLocked(latestVersion.isLocked || false)
        } else {
          setVersionLocked(false)
        }

        // Also check the global lock status
        setVersionLocked(updatedData.isLocked || false)
      }
    }

    loadQuotation()
  }, [id, fetchQuotation])

  // Handle pricing options change
  const handlePricingOptionsChange = async (options: any) => {
    if (!quotation) return

    // Don't save if the quotation is locked
    if (versionLocked) {
      toast({
        title: "Error",
        description: "Cannot modify a locked version. Create a new version first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedQuotation = await updateQuotation(quotation._id!, {
        pricingOptions: {
          ...quotation.pricingOptions,
          ...options
        }
      })

      if (updatedQuotation) {
        setQuotation(updatedQuotation)
        setShowPrices(updatedQuotation.pricingOptions.showIndividualPrices)
        toast({
          title: "Success",
          description: "Pricing options updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating pricing options:", error)
      toast({
        title: "Error",
        description: "Failed to update pricing options",
        variant: "destructive",
      })
    }
  }

  // Handle client info change
  const handleClientInfoChange = async (clientInfo: ClientInfo) => {
    if (!quotation) return

    try {
      const updatedQuotation = await updateQuotation(quotation._id!, {
        client: clientInfo
      })

      if (updatedQuotation) {
        setQuotation(updatedQuotation)
        toast({
          title: "Success",
          description: "Client information updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating client info:", error)
      toast({
        title: "Error",
        description: "Failed to update client information",
        variant: "destructive",
      })
    }
  }

  // Handle settings change
  const handleSettingsChange = async (settings: QuotationSettingsData) => {
    if (!quotation) return

    try {
      const updatedQuotation = await updateQuotation(quotation._id!, {
        ...settings
      })

      if (updatedQuotation) {
        setQuotation(updatedQuotation)
        toast({
          title: "Success",
          description: "Quotation settings updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating quotation settings:", error)
      toast({
        title: "Error",
        description: "Failed to update quotation settings",
        variant: "destructive",
      })
    }
  }

  // Handle go back
  const handleGoBack = () => {
    router.push('/dashboard')
  }

  // Toggle price visibility
  const togglePriceVisibility = async () => {
    if (!quotation) return

    try {
      await handlePricingOptionsChange({
        showIndividualPrices: !showPrices
      })
    } catch (error) {
      console.error("Error toggling price visibility:", error)
    }
  }

  // Handle currency conversion settings change
  const handleCurrencyChange = async (currencySettings: any) => {
    if (!quotation) return

    try {
      const updatedQuotation = await updateQuotation(quotation._id!, {
        currencySettings
      })

      if (updatedQuotation) {
        setQuotation(updatedQuotation)
        toast({
          title: "Success",
          description: "Currency settings updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating currency settings:", error)
      toast({
        title: "Error",
        description: "Failed to update currency settings",
        variant: "destructive",
      })
    }
  }

  // Handle display currency change
  const handleDisplayCurrencyChange = (currency: string) => {
    setDisplayCurrency(currency)
  }

  // Handle version control
  const handleCreateVersion = async (versionData: { notes: string }) => {
    if (!quotation) return

    try {
      // Create a new version with the current state - convert notes to description
      const response = await fetch(`/api/quotations/${quotation._id}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: versionData.notes }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create new version')
      }

      const updatedQuotation = await response.json()
      setQuotation(updatedQuotation)
      // Reset version lock since this is a new version
      setVersionLocked(false)
      toast({
        title: "Success",
        description: "New version created successfully",
      })
    } catch (error) {
      console.error("Error creating version:", error)
      toast({
        title: "Error",
        description: "Failed to create new version",
        variant: "destructive",
      })
    }
  }

  // Handle version locking
  const handleLockVersion = async (versionId: string) => {
    if (!quotation) return

    try {
      // Lock the specified version
      const response = await fetch(`/api/quotations/${quotation._id}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to lock version')
      }

      const updatedQuotation = await response.json()
      setQuotation(updatedQuotation)
      setVersionLocked(true)
      toast({
        title: "Success",
        description: "Version locked successfully",
      })
    } catch (error) {
      console.error("Error locking version:", error)
      toast({
        title: "Error",
        description: "Failed to lock version",
        variant: "destructive",
      })
    }
  }

  // Render loading state
  if (isLoading || !quotation) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopHeader />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Loading quotation...</h1>
              </div>
              <Card>
                <CardContent className="p-8 text-center">
                  <p>Loading quotation details, please wait...</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleGoBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{quotation.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={togglePriceVisibility}>
                  {showPrices ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide Prices
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Show Prices
                    </>
                  )}
                </Button>
                <Button 
                  onClick={async () => {
                    if (!quotation) return;
                    
                    // Don't save if the quotation is locked
                    if (versionLocked) {
                      toast({
                        title: "Error",
                        description: "Cannot save changes to a locked version. Create a new version first.",
                        variant: "destructive"
                      });
                      return;
                    }

                    try {
                      // First update the quotation
                      const updatedQuotation = await updateQuotation(quotation._id!, {
                        days: quotation.days,
                        pricingOptions: quotation.pricingOptions,
                        client: quotation.client,
                        currencySettings: quotation.currencySettings,
                        subtotal: quotation.subtotal,
                        markup: quotation.markup,
                        total: quotation.total,
                        notes: quotation.notes,
                        title: quotation.title,
                        description: quotation.description
                      });

                      if (updatedQuotation) {
                        setQuotation(updatedQuotation);
                        toast({
                          title: "Success",
                          description: "Quotation saved successfully"
                        });
                      }
                    } catch (error) {
                      console.error("Error saving quotation:", error);
                      toast({
                        title: "Error",
                        description: "Failed to save quotation",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="secondary">
                  <Send className="mr-2 h-4 w-4" />
                  Send to Client
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="configure">Configure</TabsTrigger>
                <TabsTrigger value="currency">Currency</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quotation Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold">{quotation.title}</h2>
                        <p className="text-muted-foreground">{quotation.description}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Client Details</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Name:</span>
                            <p>{quotation.client.name}</p>
                          </div>
                          {quotation.client.email && (
                            <div>
                              <span className="text-sm text-muted-foreground">Email:</span>
                              <p>{quotation.client.email}</p>
                            </div>
                          )}
                          {quotation.client.phone && (
                            <div>
                              <span className="text-sm text-muted-foreground">Phone:</span>
                              <p>{quotation.client.phone}</p>
                            </div>
                          )}
                          {quotation.client.referenceNo && (
                            <div>
                              <span className="text-sm text-muted-foreground">Reference:</span>
                              <p>{quotation.client.referenceNo}</p>
                            </div>
                          )}
                        </div>
                        {quotation.client.notes && (
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground">Notes:</span>
                            <p>{quotation.client.notes}</p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Itinerary Days and Events */}
                      {quotation.days && quotation.days.length > 0 && (
                        <div className="space-y-6">
                          {quotation.days.map((day: Day, index: number) => (
                            <div key={index} className="space-y-4">
                              <div>
                                <h3 className="text-lg font-medium">Day {day.day}: {day.title}</h3>
                                {day.description && <p className="text-muted-foreground">{day.description}</p>}
                              </div>
                              
                              <div className="space-y-3">
                                {day.events.map((event: DayEvent) => (
                                  <Card key={event.id}>
                                    <CardContent className="p-4">
                                      <div className="flex justify-between">
                                        <div>
                                          <h4 className="font-medium">{event.title}</h4>
                                          <p className="text-sm text-muted-foreground">{event.description}</p>
                                          
                                          {event.location && (
                                            <p className="text-sm mt-1">
                                              <span className="font-medium">Location:</span> {event.location}
                                            </p>
                                          )}
                                          
                                          {event.time && (
                                            <p className="text-sm">
                                              <span className="font-medium">Time:</span> {event.time}
                                            </p>
                                          )}
                                          
                                          {event.nights && (
                                            <p className="text-sm">
                                              <span className="font-medium">Nights:</span> {event.nights}
                                            </p>
                                          )}
                                        </div>
                                        
                                        {showPrices && event.price !== undefined && (
                                          <div className="text-right">
                                            <div className="flex items-center">
                                              <span className="mr-1">
                                                {displayCurrency !== quotation.currency && quotation.currencySettings?.exchangeRates
                                                  ? displayCurrency
                                                  : quotation.currency}
                                              </span>
                                              <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={displayCurrency !== quotation.currency && quotation.currencySettings?.exchangeRates
                                                  ? convertCurrency(
                                                      parseFloat(event.price.toString()),
                                                      quotation.currency,
                                                      displayCurrency,
                                                      quotation.currencySettings.exchangeRates
                                                    )
                                                  : event.price}
                                                onChange={(e) => {
                                                  // Create a copy of the quotation to modify
                                                  const updatedQuotation = {...quotation};
                                                  // Find the event to update
                                                  const dayIndex = updatedQuotation.days.findIndex((d: any) => d.day === day.day);
                                                  const eventIndex = updatedQuotation.days[dayIndex].events.findIndex((e: any) => e.id === event.id);
                                                  
                                                  if (dayIndex >= 0 && eventIndex >= 0) {
                                                    // Update the price - convert back to base currency if needed
                                                    let newPrice = parseFloat(e.target.value);
                                                    
                                                    // If displaying in a different currency, convert back to base currency
                                                    if (displayCurrency !== quotation.currency && quotation.currencySettings?.exchangeRates) {
                                                      newPrice = convertCurrency(
                                                        newPrice,
                                                        displayCurrency,
                                                        quotation.currency,
                                                        quotation.currencySettings.exchangeRates
                                                      );
                                                    }
                                                    
                                                    updatedQuotation.days[dayIndex].events[eventIndex].price = newPrice;
                                                    
                                                    // Recalculate totals
                                                    const recalculatedQuotation = recalculateTotals(updatedQuotation);
                                                    
                                                    // Update local state immediately for responsive UI
                                                    setQuotation(recalculatedQuotation);
                                                  }
                                                }}
                                                onBlur={async () => {
                                                  // Save changes when input loses focus
                                                  try {
                                                    // Send both days and updated pricing options
                                                    await updateQuotation(quotation._id!, {
                                                      days: quotation.days,
                                                      pricingOptions: quotation.pricingOptions,
                                                      totalPrice: quotation.pricingOptions.finalTotalPrice
                                                    });
                                                  } catch (error) {
                                                    console.error("Error updating price:", error);
                                                    toast({
                                                      title: "Error",
                                                      description: "Failed to update price",
                                                      variant: "destructive"
                                                    });
                                                  }
                                                }}
                                                className="w-24 text-right"
                                              />
                                            </div>
                                            {event.category === "hotel" && event.nights && (
                                              <p className="text-xs text-muted-foreground">
                                                {event.nights} night{event.nights !== 1 ? 's' : ''}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <Separator />

                      {/* Pricing Summary */}
                      {(showPrices || quotation.pricingOptions.showTotal) && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">Pricing Summary</h3>
                            
                            {/* Quick Markup Controls */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Label htmlFor="preview-markup-type" className="text-sm whitespace-nowrap">Markup Type:</Label>
                                <select
                                  id="preview-markup-type"
                                  value={quotation.pricingOptions.markupType}
                                  onChange={async (e) => {
                                    const newType = e.target.value as "percentage" | "fixed";
                                    try {
                                      // Create updated quotation with new markup type
                                      const updatedQuotation = {
                                        ...quotation,
                                        pricingOptions: {
                                          ...quotation.pricingOptions,
                                          markupType: newType
                                        }
                                      };
                                      
                                      // Recalculate totals with the new markup type
                                      const recalculatedQuotation = recalculateTotals(updatedQuotation);
                                      
                                      // Update local state for responsiveness
                                      setQuotation(recalculatedQuotation);
                                      
                                      // Also update on server
                                      await updateQuotation(quotation._id!, {
                                        pricingOptions: recalculatedQuotation.pricingOptions,
                                        subtotal: recalculatedQuotation.subtotal,
                                        markup: recalculatedQuotation.markup,
                                        total: recalculatedQuotation.total
                                      });
                                    } catch (error) {
                                      console.error("Error updating markup type:", error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to update markup type",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                  className="rounded-md border-input py-1 px-2 text-sm"
                                >
                                  <option value="percentage">Percentage</option>
                                  <option value="fixed">Fixed Amount</option>
                                </select>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Label htmlFor="preview-markup-value" className="text-sm whitespace-nowrap">
                                  {quotation.pricingOptions.markupType === "percentage" ? "Value (%):" : "Amount:"}
                                </Label>
                                <div className="flex items-center">
                                  {quotation.pricingOptions.markupType === "fixed" && (
                                    <span className="text-sm mr-1">{quotation.currency}</span>
                                  )}
                                  <Input
                                    id="preview-markup-value"
                                    type="number"
                                    min="0"
                                    step={quotation.pricingOptions.markupType === "percentage" ? "1" : "0.01"}
                                    value={quotation.pricingOptions.markupValue}
                                    onChange={(e) => {
                                      // Create updated quotation with new markup value
                                      const updatedQuotation = {
                                        ...quotation,
                                        pricingOptions: {
                                          ...quotation.pricingOptions,
                                          markupValue: parseFloat(e.target.value) || 0
                                        }
                                      };
                                      
                                      // Recalculate totals with the new markup
                                      const recalculatedQuotation = recalculateTotals(updatedQuotation);
                                      
                                      // Update local state for responsiveness
                                      setQuotation(recalculatedQuotation);
                                    }}
                                    onBlur={async () => {
                                      // Save changes when input loses focus
                                      try {
                                        await updateQuotation(quotation._id!, {
                                          pricingOptions: quotation.pricingOptions,
                                          subtotal: quotation.subtotal,
                                          markup: quotation.markup,
                                          total: quotation.total
                                        });
                                      } catch (error) {
                                        console.error("Error updating markup value:", error);
                                        toast({
                                          title: "Error",
                                          description: "Failed to update markup value",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                    className="w-20"
                                  />
                                  {quotation.pricingOptions.markupType === "percentage" && (
                                    <span className="text-sm ml-1">%</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 bg-muted/20 p-3 rounded-md">
                            {showPrices && quotation.pricingOptions.showSubtotals && (
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>
                                  {displayCurrency !== quotation.currency && quotation.currencySettings?.exchangeRates ? 
                                    formatCurrencyWithSymbol(
                                      convertCurrency(
                                        quotation.subtotal || quotation.pricingOptions.originalTotalPrice || 0,
                                        quotation.currency,
                                        displayCurrency,
                                        quotation.currencySettings.exchangeRates
                                      ),
                                      displayCurrency
                                    ) :
                                    `${quotation.currency} ${(quotation.subtotal || quotation.pricingOptions.originalTotalPrice || 0).toFixed(2)}`
                                  }
                                </span>
                              </div>
                            )}
                            
                            {showPrices && quotation.pricingOptions.markupValue > 0 && (
                              <div className="flex justify-between">
                                <span>
                                  {quotation.pricingOptions.markupType === "percentage" 
                                    ? `Service Fee (${quotation.pricingOptions.markupValue}%):`
                                    : "Service Fee:"}
                                </span>
                                <span>
                                  {displayCurrency !== quotation.currency && quotation.currencySettings?.exchangeRates ? 
                                    formatCurrencyWithSymbol(
                                      convertCurrency(
                                        quotation.markup || 
                                          (quotation.pricingOptions.markupType === "percentage"
                                            ? ((quotation.subtotal || quotation.pricingOptions.originalTotalPrice || 0) * (quotation.pricingOptions.markupValue / 100))
                                            : quotation.pricingOptions.markupValue),
                                        quotation.currency,
                                        displayCurrency,
                                        quotation.currencySettings.exchangeRates
                                      ),
                                      displayCurrency
                                    ) :
                                    `${quotation.currency} ${(quotation.markup || 
                                      (quotation.pricingOptions.markupType === "percentage"
                                        ? ((quotation.subtotal || quotation.pricingOptions.originalTotalPrice || 0) * (quotation.pricingOptions.markupValue / 100))
                                        : quotation.pricingOptions.markupValue)
                                    ).toFixed(2)}`
                                  }
                                </span>
                              </div>
                            )}
                            
                            {quotation.pricingOptions.showTotal && (
                              <div className="flex justify-between font-bold pt-2">
                                <span>Total:</span>
                                <span>
                                  {displayCurrency !== quotation.currency && quotation.currencySettings?.exchangeRates ? 
                                    formatCurrencyWithSymbol(
                                      convertCurrency(
                                        quotation.total || quotation.pricingOptions.finalTotalPrice || 0,
                                        quotation.currency,
                                        displayCurrency,
                                        quotation.currencySettings.exchangeRates
                                      ),
                                      displayCurrency
                                    ) :
                                    `${quotation.currency} ${(quotation.total || quotation.pricingOptions.finalTotalPrice || 0).toFixed(2)}`
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    {displayCurrency !== quotation.currency && quotation.currencySettings?.exchangeRates && (
                      <div className="text-sm text-muted-foreground">
                        Displaying prices in {displayCurrency} (1 {quotation.currency} = {quotation.currencySettings.exchangeRates[displayCurrency]} {displayCurrency})
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" disabled={!versionLocked}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                    <Button variant="outline" disabled={!versionLocked}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button>
                      <Send className="mr-2 h-4 w-4" />
                      Send to Client
                    </Button>
                    {!versionLocked && (
                      <div className="text-sm text-amber-600 ml-2 flex items-center">
                        <Lock className="h-4 w-4 mr-1" /> Version must be locked before printing or downloading
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Configure Tab */}
              <TabsContent value="configure" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuotationClientEditor 
                        initialData={{
                          name: quotation.client.name,
                          email: quotation.client.email,
                          phone: quotation.client.phone,
                          referenceNo: quotation.client.referenceNo,
                          notes: quotation.notes,
                          validUntil: quotation.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : undefined
                        }}
                        onUpdate={async (data: ClientInfo) => {
                          try {
                            const updatedQuotation = await updateQuotation(quotation._id!, {
                              client: {
                                name: data.name,
                                email: data.email,
                                phone: data.phone,
                                referenceNo: data.referenceNo
                              },
                              notes: data.notes,
                              validUntil: data.validUntil ? new Date(data.validUntil) : undefined
                            });
                            
                            if (updatedQuotation) {
                              setQuotation(updatedQuotation);
                              toast({
                                title: "Success",
                                description: "Client information updated successfully"
                              });
                            }
                          } catch (error) {
                            console.error("Error updating client information:", error);
                            toast({
                              title: "Error",
                              description: "Failed to update client information",
                              variant: "destructive"
                            });
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuotationPricingControls 
                        initialOptions={quotation.pricingOptions}
                        onOptionsChange={async (options: any) => {
                          try {
                            const updatedQuotation = await updateQuotation(quotation._id!, {
                              pricingOptions: {
                                ...quotation.pricingOptions,
                                ...options
                              }
                            });
                            
                            if (updatedQuotation) {
                              setQuotation(updatedQuotation);
                              setShowPrices(updatedQuotation.pricingOptions.showIndividualPrices);
                              toast({
                                title: "Success",
                                description: "Pricing options updated successfully"
                              });
                            }
                          } catch (error) {
                            console.error("Error updating pricing options:", error);
                            toast({
                              title: "Error",
                              description: "Failed to update pricing options",
                              variant: "destructive"
                            });
                          }
                        }}
                        currency={quotation.currency}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Currency Tab */}
              <TabsContent value="currency" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Currency Conversion Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CurrencyConversion
                      currencySettings={{
                        baseCurrency: quotation.currency || "USD",
                        displayCurrency: displayCurrency || quotation.currency || "USD",
                        exchangeRates: quotation.currencySettings?.exchangeRates || {
                          USD: 1,
                          EUR: 0.92,
                          INR: 83.13,
                        }
                      }}
                      onUpdateSettings={handleCurrencyChange}
                      onUpdateDisplayCurrency={handleDisplayCurrencyChange}
                    />
                  </CardContent>
                </Card>
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("preview")}>
                    Back to Preview
                  </Button>
                </div>
              </TabsContent>

              {/* Versions Tab */}
              <TabsContent value="versions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Version Control</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VersionControl
                      versionHistory={quotation.versionHistory || []}
                      currentVersion={quotation.currentVersion || 1}
                      isLocked={versionLocked}
                      isDraft={quotation.isDraft || false}
                      onCreateVersion={(description: string) => handleCreateVersion({ notes: description })}
                      onLockVersion={() => {
                        if (quotation.versionHistory && quotation.versionHistory.length > 0) {
                          const latestVersion = quotation.versionHistory[quotation.versionHistory.length - 1];
                          return handleLockVersion(latestVersion.versionNumber.toString());
                        }
                        return Promise.resolve();
                      }}
                      onSaveVersion={async () => {
                        try {
                          const updatedQuotation = await saveQuotationVersion(quotation._id!);
                          setQuotation(updatedQuotation);
                          toast({
                            title: "Success",
                            description: "Changes saved successfully",
                          });
                        } catch (error) {
                          console.error("Error saving changes:", error);
                          toast({
                            title: "Error",
                            description: "Failed to save changes",
                            variant: "destructive",
                          });
                        }
                      }}
                      onViewVersion={() => {}}
                    />
                  </CardContent>
                </Card>
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("preview")}>
                    Back to Preview
                  </Button>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quotation Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuotationSettings 
                      initialData={{
                        title: quotation.title,
                        description: quotation.description,
                        destination: quotation.destination,
                        duration: quotation.duration,
                        currency: quotation.currency
                      }}
                      onUpdate={async (data: QuotationSettingsData) => {
                        try {
                          const updatedQuotation = await updateQuotation(quotation._id!, {
                            title: data.title,
                            description: data.description,
                            destination: data.destination,
                            duration: data.duration,
                            currency: data.currency
                          });
                          
                          if (updatedQuotation) {
                            setQuotation(updatedQuotation);
                            toast({
                              title: "Success",
                              description: "Quotation settings updated successfully"
                            });
                          }
                        } catch (error) {
                          console.error("Error updating quotation settings:", error);
                          toast({
                            title: "Error",
                            description: "Failed to update quotation settings",
                            variant: "destructive"
                          });
                        }
                      }}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}