// Save quotation version
export const saveQuotationVersion = async (quotationId: string) => {
  try {
    const response = await fetch(`/api/quotations/${quotationId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to save quotation version');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving quotation version:', error);
    throw error;
  }
};