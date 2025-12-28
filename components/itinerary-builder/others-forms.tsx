import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductItem {
  name: string
  price: number | ""
  description: string
  currency?: string
}

interface OthersFormsProps {
  selectedSubCategory: string
  // Common
  manualTitle: string
  setManualTitle: (v: string) => void
  manualCurrency: string
  setManualCurrency: (v: string) => void
  // Gift card specific
  manualGiftAmount: number | ""
  setManualGiftAmount: (v: number | "") => void
  manualServiceCharge: number | ""
  setManualServiceCharge: (v: number | "") => void
  // Travel gears specific
  manualProducts: ProductItem[]
  handleAddProduct: () => void
  handleRemoveProduct: (index: number) => void
  handleProductChange: (index: number, field: keyof ProductItem, value: any) => void
  errors?: Record<string, string>
}

export function OthersForms(props: OthersFormsProps) {
  const {
    selectedSubCategory,
    manualTitle,
    setManualTitle,
    manualCurrency,
    setManualCurrency,
    manualGiftAmount,
    setManualGiftAmount,
    manualServiceCharge,
    setManualServiceCharge,
    manualProducts,
    handleAddProduct,
    handleRemoveProduct,
    handleProductChange,
    errors = {},
  } = props

  return (
    <>
      {selectedSubCategory === "gift-cards" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Gift card title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <div className="flex gap-2">
              <Select value={manualCurrency} onValueChange={setManualCurrency}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                className={`flex-1 ${errors.price ? "border-red-500" : ""}`}
                value={manualGiftAmount}
                onChange={(e) => setManualGiftAmount(Number(e.target.value) || "")}
                placeholder="0.00"
              />
            </div>
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Service Charge</label>
            <div className="flex gap-2">
              <div className="w-[100px] flex items-center justify-center bg-gray-50 border rounded-md text-sm text-gray-500">
                {manualCurrency}
              </div>
              <Input type="number" className="flex-1" value={manualServiceCharge} onChange={(e) => setManualServiceCharge(Number(e.target.value) || "")} placeholder="0.00" />
            </div>
          </div>
        </div>
      )}

      {selectedSubCategory === "travel-gears" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Travel gear title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Currency (Default)</label>
            <Select value={manualCurrency} onValueChange={setManualCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Products (multiple)</label>
            <div className="space-y-3">
              {manualProducts.map((p, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Product {idx + 1}</span>
                    {manualProducts.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveProduct(idx)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input value={p.name} onChange={(e) => handleProductChange(idx, 'name', e.target.value)} placeholder="Product name" />
                    <div className="flex gap-2">
                      <Select
                        value={p.currency || manualCurrency}
                        onValueChange={(val) => handleProductChange(idx, 'currency', val)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="AED">AED</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" className="flex-1" value={p.price} onChange={(e) => handleProductChange(idx, 'price', Number(e.target.value) || "")} placeholder="Price" />
                    </div>
                    <Textarea value={p.description} onChange={(e) => handleProductChange(idx, 'description', e.target.value)} placeholder="Description" rows={2} />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={handleAddProduct}>
                + Add Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
