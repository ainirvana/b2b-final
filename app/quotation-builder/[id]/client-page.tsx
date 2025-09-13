"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"
import { QuotationPricingControls } from "@/components/quotation-pricing-controls"
import { QuotationClientEditor, ClientInfo } from "@/components/quotation-client-editor"
import { QuotationSettings, QuotationSettingsData } from "@/components/quotation-settings"
import { useQuotations, QuotationData } from "@/hooks/use-quotations"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Send, Printer, Download, Eye, EyeOff, Calculator } from "lucide-react"

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
  
  const router = useRouter()
  const { fetchQuotation, updateQuotation, isLoading } = useQuotations()
  const { toast } = useToast()

  // Fetch quotation data
  useEffect(() => {
    const loadQuotation = async () => {
      if (!id) return
      const data = await fetchQuotation(id)
      if (data) {
        setQuotation(data)
        setShowPrices(data.pricingOptions.showIndividualPrices)
      }
    }

    loadQuotation()
  }, [id, fetchQuotation])

  // Handle pricing options change
  const handlePricingOptionsChange = async (options: any) => {
    if (!quotation) return

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
                <Button>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="configure">Configure</TabsTrigger>
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
                                        
                                        {showPrices && event.price && (
                                          <div className="text-right">
                                            <p className="font-medium">{quotation.currency} {event.price.toFixed(2)}</p>
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
                        <div className="space-y-2">
                          <h3 className="font-medium">Pricing Summary</h3>
                          
                          {showPrices && quotation.pricingOptions.showSubtotals && (
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>{quotation.currency} {quotation.pricingOptions.originalTotalPrice.toFixed(2)}</span>
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
                                {quotation.currency} {(
                                  quotation.pricingOptions.markupType === "percentage"
                                    ? (quotation.pricingOptions.originalTotalPrice * (quotation.pricingOptions.markupValue / 100))
                                    : quotation.pricingOptions.markupValue
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}
                          
                          {quotation.pricingOptions.showTotal && (
                            <div className="flex justify-between font-bold pt-2">
                              <span>Total:</span>
                              <span>{quotation.currency} {quotation.pricingOptions.finalTotalPrice.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Send to Client
                  </Button>
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