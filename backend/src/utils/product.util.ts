import Product, { IProductDocument } from '../models/product.model'

export const updateInventoryAfterVariantRemoval = async(product: IProductDocument, variantId: string): Promise<void> => {
  const variantIndex = product.variants.findIndex(v => v.variant.toString() === variantId);
  if (variantIndex === -1) return; // Variant not found, no inventory update needed
  
  const variantName = product.variants[variantIndex].options[0].name; // Assuming the first option is the variant name
  
  const updatedInventory: typeof product.inventory = [];
  const inventoryMap = new Map<string, number>();
  
  for (const invItem of product.inventory) {
    const combinationParts = invItem.variantCombination.split(',');
    const updatedCombination = combinationParts.filter(part => !part.startsWith(variantName));
      
    if (updatedCombination.length === combinationParts.length) {
      // This inventory item doesn't contain the removed variant
      updatedInventory.push(invItem);
    } else if (updatedCombination.length > 0) {
      // Consolidate inventory for the remaining combination
      const newCombination = updatedCombination.join(',');
      const currentStock = inventoryMap.get(newCombination) || 0;
      inventoryMap.set(newCombination, currentStock + invItem.stock);
    }
    // If updatedCombination is empty, this inventory item is removed entirely
  }
  
  // Add consolidated inventory items
  for (const [combination, stock] of inventoryMap.entries()) {
    updatedInventory.push({ variantCombination: combination, stock });
  }
  
  product.inventory = updatedInventory;
}