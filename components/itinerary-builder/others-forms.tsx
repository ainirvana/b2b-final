import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ProductItem {
  name: string
  price: number | ""
  description: string
}

interface OthersFormsProps {
  selectedSubCategory: string
  // Common
  manualTitle: string
  setManualTitle: (v: string) => void
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
}

export function OthersForms(props: OthersFormsProps) {
  const {
    selectedSubCategory,
    manualTitle,
    setManualTitle,
    manualGiftAmount,
    setManualGiftAmount,
    manualServiceCharge,
    setManualServiceCharge,
    manualProducts,
    handleAddProduct,
    handleRemoveProduct,
    handleProductChange,
  } = props

  return (
    <>
      {selectedSubCategory === "gift-cards" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Gift card title" />
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input type="number" value={manualGiftAmount} onChange={(e) => setManualGiftAmount(Number(e.target.value) || "")} placeholder="0.00" />
          </div>

          <div>
            <label className="text-sm font-medium">Service Charge</label>
            <Input type="number" value={manualServiceCharge} onChange={(e) => setManualServiceCharge(Number(e.target.value) || "")} placeholder="0.00" />
          </div>
        </div>
      )}

      {selectedSubCategory === "travel-gears" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Travel gear title" />
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
                    <Input type="number" value={p.price} onChange={(e) => handleProductChange(idx, 'price', Number(e.target.value) || "")} placeholder="Price" />
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
